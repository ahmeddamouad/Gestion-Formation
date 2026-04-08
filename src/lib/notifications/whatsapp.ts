// WhatsApp notification via Twilio with delivery tracking
import twilio from "twilio";
import { Registration, Formation, NotificationType } from "@/types";
import {
  getPaymentConfirmationMessage,
  getReminderMessage,
  getManualMessage,
  getAdminNewRegistrationMessage,
} from "./templates";
import supabaseAdmin from "@/lib/supabase/admin";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";
const adminNumber = process.env.ADMIN_WHATSAPP_NUMBER;
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

interface SendResult {
  success: boolean;
  messageSid?: string;
  notificationId?: string;
  error?: string;
}

// Get Twilio client
function getTwilioClient() {
  if (!accountSid || !authToken) {
    throw new Error("Missing Twilio credentials");
  }
  return twilio(accountSid, authToken);
}

// Format phone number for WhatsApp
function formatWhatsAppNumber(phone: string): string {
  // Remove spaces and dashes
  let cleaned = phone.replace(/[\s-]/g, "");

  // If starts with 0, replace with +212 (Morocco)
  if (cleaned.startsWith("0")) {
    cleaned = "+212" + cleaned.slice(1);
  }

  // Add + if missing
  if (!cleaned.startsWith("+")) {
    cleaned = "+" + cleaned;
  }

  return `whatsapp:${cleaned}`;
}

// Log notification to database
async function logNotification(
  registrationId: string | undefined,
  formationId: string | undefined,
  recipientPhone: string,
  recipientName: string,
  notificationType: NotificationType,
  messageContent: string,
  twilioMessageSid?: string,
  status: string = "pending"
): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin.rpc("log_notification", {
      p_registration_id: registrationId || null,
      p_formation_id: formationId || null,
      p_recipient_phone: recipientPhone,
      p_recipient_name: recipientName,
      p_notification_type: notificationType,
      p_message_content: messageContent,
      p_twilio_message_sid: twilioMessageSid || null,
      p_status: status,
    });

    if (error) {
      console.error("Error logging notification:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Failed to log notification:", err);
    return null;
  }
}

// Update notification status when Twilio message is created
async function updateNotificationWithSid(
  notificationId: string,
  messageSid: string
): Promise<void> {
  try {
    await supabaseAdmin
      .from("notifications")
      .update({
        twilio_message_sid: messageSid,
        status: "sent",
        sent_at: new Date().toISOString(),
      })
      .eq("id", notificationId);
  } catch (err) {
    console.error("Failed to update notification with SID:", err);
  }
}

// Send WhatsApp message with tracking
async function sendTrackedMessage(
  toPhone: string,
  message: string,
  registrationId?: string,
  formationId?: string,
  recipientName?: string,
  notificationType: NotificationType = "manual"
): Promise<SendResult> {
  if (!accountSid || !authToken) {
    return {
      success: false,
      error: "Configuration Twilio manquante",
    };
  }

  const formattedPhone = formatWhatsAppNumber(toPhone);

  // Log notification first
  const notificationId = await logNotification(
    registrationId,
    formationId,
    toPhone,
    recipientName || "Inconnu",
    notificationType,
    message,
    undefined,
    "pending"
  );

  try {
    const client = getTwilioClient();

    const twilioMessage = await client.messages.create({
      body: message,
      from: fromNumber,
      to: formattedPhone,
      statusCallback: `${baseUrl}/api/webhooks/twilio/status`,
    });

    // Update notification with message SID
    if (notificationId) {
      await updateNotificationWithSid(notificationId, twilioMessage.sid);
    }

    console.log(`WhatsApp message sent: ${twilioMessage.sid}`);
    return {
      success: true,
      messageSid: twilioMessage.sid,
      notificationId: notificationId || undefined,
    };
  } catch (error) {
    console.error("WhatsApp send failed:", error);

    // Update notification as failed
    if (notificationId) {
      await supabaseAdmin
        .from("notifications")
        .update({
          status: "failed",
          error_message: error instanceof Error ? error.message : "Unknown error",
        })
        .eq("id", notificationId);
    }

    return {
      success: false,
      notificationId: notificationId || undefined,
      error: error instanceof Error ? error.message : "Erreur WhatsApp",
    };
  }
}

// Send payment confirmation to participant
export async function sendPaymentConfirmation(
  registration: Registration,
  formation: Formation
): Promise<SendResult> {
  const message = getPaymentConfirmationMessage({ registration, formation });

  return sendTrackedMessage(
    registration.telephone,
    message,
    registration.id,
    formation.id,
    `${registration.prenom} ${registration.nom}`,
    "payment_confirmation"
  );
}

// Send 24h reminder to participant
export async function sendReminder(
  registration: Registration,
  formation: Formation
): Promise<SendResult> {
  const message = getReminderMessage({ registration, formation });

  return sendTrackedMessage(
    registration.telephone,
    message,
    registration.id,
    formation.id,
    `${registration.prenom} ${registration.nom}`,
    "reminder_24h"
  );
}

// Send manual message to participant
export async function sendManualNotification(
  registration: Registration,
  formation: Formation,
  customMessage: string
): Promise<SendResult> {
  const message = getManualMessage(
    registration.prenom,
    formation.titre,
    customMessage
  );

  return sendTrackedMessage(
    registration.telephone,
    message,
    registration.id,
    formation.id,
    `${registration.prenom} ${registration.nom}`,
    "manual"
  );
}

// Existing function: Send notification to admin (for new registrations)
export async function sendWhatsAppNotification(
  registration: Registration,
  formation: Formation
): Promise<{ success: boolean; error?: string }> {
  if (!accountSid || !authToken || !adminNumber) {
    console.warn("WhatsApp notification skipped: Missing Twilio credentials");
    return {
      success: false,
      error: "Configuration Twilio manquante",
    };
  }

  try {
    const client = getTwilioClient();
    const message = getAdminNewRegistrationMessage({ registration, formation });

    await client.messages.create({
      body: message,
      from: fromNumber,
      to: `whatsapp:${adminNumber}`,
    });

    console.log("WhatsApp admin notification sent successfully");
    return { success: true };
  } catch (error) {
    console.error("WhatsApp notification failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur WhatsApp",
    };
  }
}

// Retry a failed notification
export async function retryNotification(notificationId: string): Promise<SendResult> {
  try {
    // Get the notification details
    const { data: notification, error } = await supabaseAdmin
      .from("notifications")
      .select("*, registration:registrations(*), formation:formations(*)")
      .eq("id", notificationId)
      .single();

    if (error || !notification) {
      return { success: false, error: "Notification non trouvée" };
    }

    // Reset status to pending
    await supabaseAdmin
      .from("notifications")
      .update({ status: "pending", error_message: null })
      .eq("id", notificationId);

    // Resend the message
    const client = getTwilioClient();
    const formattedPhone = formatWhatsAppNumber(notification.recipient_phone);

    const twilioMessage = await client.messages.create({
      body: notification.message_content,
      from: fromNumber,
      to: formattedPhone,
      statusCallback: `${baseUrl}/api/webhooks/twilio/status`,
    });

    // Update notification
    await supabaseAdmin
      .from("notifications")
      .update({
        twilio_message_sid: twilioMessage.sid,
        status: "sent",
        sent_at: new Date().toISOString(),
        error_message: null,
      })
      .eq("id", notificationId);

    return {
      success: true,
      messageSid: twilioMessage.sid,
      notificationId,
    };
  } catch (error) {
    console.error("Retry failed:", error);

    await supabaseAdmin
      .from("notifications")
      .update({
        status: "failed",
        error_message: error instanceof Error ? error.message : "Retry failed",
      })
      .eq("id", notificationId);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors du renvoi",
    };
  }
}
