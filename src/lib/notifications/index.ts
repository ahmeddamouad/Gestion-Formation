// Notification orchestrator - sends all notifications in parallel
import { Registration, Formation } from "@/types";
import { sendWhatsAppNotification } from "./whatsapp";
import { sendEmailNotification } from "./email";
import { appendToGoogleSheet } from "./sheets";

export interface NotificationResults {
  whatsapp: { success: boolean; error?: string };
  email: { success: boolean; error?: string };
  sheets: { success: boolean; error?: string };
}

/**
 * Send all notifications for a new registration
 * Runs all three channels in parallel - failures in one don't block others
 */
export async function sendAllNotifications(
  registration: Registration,
  formation: Formation
): Promise<NotificationResults> {
  console.log(
    `Sending notifications for registration ${registration.id} (${formation.titre})`
  );

  // Execute all notifications in parallel
  const [whatsappResult, emailResult, sheetsResult] = await Promise.allSettled([
    sendWhatsAppNotification(registration, formation),
    sendEmailNotification(registration, formation),
    appendToGoogleSheet(registration, formation),
  ]);

  // Extract results, handling both fulfilled and rejected promises
  const results: NotificationResults = {
    whatsapp:
      whatsappResult.status === "fulfilled"
        ? whatsappResult.value
        : { success: false, error: String(whatsappResult.reason) },
    email:
      emailResult.status === "fulfilled"
        ? emailResult.value
        : { success: false, error: String(emailResult.reason) },
    sheets:
      sheetsResult.status === "fulfilled"
        ? sheetsResult.value
        : { success: false, error: String(sheetsResult.reason) },
  };

  // Log results
  const successCount = [
    results.whatsapp.success,
    results.email.success,
    results.sheets.success,
  ].filter(Boolean).length;

  console.log(`Notifications sent: ${successCount}/3 successful`);

  if (!results.whatsapp.success)
    console.warn("WhatsApp failed:", results.whatsapp.error);
  if (!results.email.success)
    console.warn("Email failed:", results.email.error);
  if (!results.sheets.success)
    console.warn("Google Sheets failed:", results.sheets.error);

  return results;
}

// Re-export individual functions for direct use if needed
export { sendWhatsAppNotification } from "./whatsapp";
export { sendEmailNotification } from "./email";
export { appendToGoogleSheet, initializeSheet } from "./sheets";
