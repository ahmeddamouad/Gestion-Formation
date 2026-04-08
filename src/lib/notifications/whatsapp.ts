// WhatsApp notification via Twilio
import twilio from "twilio";
import { Registration, Formation } from "@/types";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";
const adminNumber = process.env.ADMIN_WHATSAPP_NUMBER;

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
    const client = twilio(accountSid, authToken);

    const preregistrationNote = registration.is_preregistration
      ? "\n⚠️ Pré-inscription (session complète)"
      : "";

    const modeLabel =
      registration.mode_choisi === "presentiel" ? "Présentiel" : "Visio";

    const message = `🎓 Nouvelle inscription!

Formation: ${formation.titre}
Nom: ${registration.prenom} ${registration.nom}
Email: ${registration.email}
Téléphone: ${registration.telephone}
${registration.entreprise ? `Entreprise: ${registration.entreprise}\n` : ""}Mode: ${modeLabel}${preregistrationNote}`;

    await client.messages.create({
      body: message,
      from: fromNumber,
      to: `whatsapp:${adminNumber}`,
    });

    console.log("WhatsApp notification sent successfully");
    return { success: true };
  } catch (error) {
    console.error("WhatsApp notification failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur WhatsApp",
    };
  }
}
