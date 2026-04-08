// WhatsApp message templates for automated notifications
import { Registration, Formation } from "@/types";

export interface TemplateData {
  registration: Registration;
  formation: Formation;
}

// Format date in French
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Format programme array as bullet points
function formatProgramme(programme?: string[]): string {
  if (!programme || programme.length === 0) return "";
  return programme.map((item) => `• ${item}`).join("\n");
}

// Payment confirmation message with programme details
export function getPaymentConfirmationMessage(data: TemplateData): string {
  const { registration, formation } = data;
  const modeLabel = registration.mode_choisi === "presentiel" ? "Présentiel" : "Visio";
  const sessionDate = formatDate(formation.session_date);

  let message = `✅ *Confirmation de paiement*

Bonjour ${registration.prenom},

Votre paiement pour la formation *${formation.titre}* a bien été reçu. Merci!

📅 *Date:* ${sessionDate}
⏱ *Durée:* ${formation.nombre_jours || 1} jour(s) × ${formation.heures_par_jour || 7}h
📍 *Mode:* ${modeLabel}`;

  // Add programme if available
  if (formation.programme && formation.programme.length > 0) {
    message += `

📋 *Programme:*
${formatProgramme(formation.programme)}`;
  }

  // Add objectives if available
  if (formation.objectifs && formation.objectifs.length > 0) {
    message += `

🎯 *Objectifs:*
${formatProgramme(formation.objectifs)}`;
  }

  // Add WhatsApp group link if available
  if (formation.whatsapp_group_link) {
    message += `

📱 *Rejoignez le groupe WhatsApp de la formation:*
${formation.whatsapp_group_link}`;
  }

  message += `

Un rappel vous sera envoyé la veille avec les détails pratiques.

À très bientôt! 🎓`;

  return message;
}

// 24h reminder message with location or visio link
export function getReminderMessage(data: TemplateData): string {
  const { registration, formation } = data;
  const sessionDate = formatDate(formation.session_date);

  let message = `⏰ *Rappel - Formation demain!*

Bonjour ${registration.prenom},

Votre formation *${formation.titre}* commence demain!

📅 *Date:* ${sessionDate}
⏱ *Durée:* ${formation.nombre_jours || 1} jour(s) × ${formation.heures_par_jour || 7}h`;

  // Add location details for presentiel
  if (registration.mode_choisi === "presentiel") {
    message += `

📍 *Mode:* Présentiel`;

    if (formation.location) {
      message += `
🏢 *Lieu:* ${formation.location}`;
    }

    if (formation.location_address) {
      message += `
📮 *Adresse:* ${formation.location_address}`;
    }

    if (formation.location_maps_url) {
      message += `
🗺 *Google Maps:* ${formation.location_maps_url}`;
    }
  } else {
    // Add visio link for online mode
    message += `

💻 *Mode:* Visio`;

    if (formation.visio_link) {
      message += `
🔗 *Lien de connexion:* ${formation.visio_link}`;
    } else {
      message += `
ℹ️ Le lien de connexion vous sera communiqué le jour J.`;
    }
  }

  // Add WhatsApp group reminder if available
  if (formation.whatsapp_group_link) {
    message += `

📱 *Groupe WhatsApp:*
${formation.whatsapp_group_link}`;
  }

  message += `

N'hésitez pas à nous contacter si vous avez des questions.

À demain! 🎓`;

  return message;
}

// Manual message template (customizable)
export function getManualMessage(
  recipientName: string,
  formationTitre: string,
  customMessage: string
): string {
  return `📢 *${formationTitre}*

Bonjour ${recipientName},

${customMessage}

Cordialement,
L'équipe de formation`;
}

// Admin notification for new registration (existing functionality)
export function getAdminNewRegistrationMessage(data: TemplateData): string {
  const { registration, formation } = data;
  const preregistrationNote = registration.is_preregistration
    ? "\n⚠️ Pré-inscription (session complète)"
    : "";

  const modeLabel = registration.mode_choisi === "presentiel" ? "Présentiel" : "Visio";

  return `🎓 Nouvelle inscription!

Formation: ${formation.titre}
Nom: ${registration.prenom} ${registration.nom}
Email: ${registration.email}
Téléphone: ${registration.telephone}
${registration.entreprise ? `Entreprise: ${registration.entreprise}\n` : ""}Mode: ${modeLabel}${preregistrationNote}`;
}
