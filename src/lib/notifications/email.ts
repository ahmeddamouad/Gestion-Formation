// Email notification via Resend
import { Resend } from "resend";
import { Registration, Formation } from "@/types";
import { formatDateTime } from "@/lib/utils/formatters";

const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM || "notifications@example.com";
const adminEmail = process.env.ADMIN_EMAIL;

export async function sendEmailNotification(
  registration: Registration,
  formation: Formation
): Promise<{ success: boolean; error?: string }> {
  if (!resendApiKey || !adminEmail) {
    console.warn("Email notification skipped: Missing Resend credentials");
    return {
      success: false,
      error: "Configuration email manquante",
    };
  }

  try {
    const resend = new Resend(resendApiKey);

    const preregistrationBadge = registration.is_preregistration
      ? '<span style="background-color: #F59E0B; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">PRE-INSCRIPTION</span>'
      : '<span style="background-color: #22C55E; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">CONFIRME</span>';

    const modeLabel =
      registration.mode_choisi === "presentiel" ? "Presentiel" : "Visio";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #090E1A 0%, #1F2937 100%); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { padding: 30px; }
            .badge { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
            th { background-color: #f9fafb; color: #374151; font-weight: 600; width: 40%; }
            td { color: #1f2937; }
            .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
            .button { display: inline-block; background-color: #00C896; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 Nouvelle Inscription</h1>
            </div>
            <div class="content">
              <div class="badge">
                ${preregistrationBadge}
              </div>
              <h2 style="color: #00C896; margin-top: 0;">${formation.titre}</h2>
              <table>
                <tr>
                  <th>Prenom</th>
                  <td>${registration.prenom}</td>
                </tr>
                <tr>
                  <th>Nom</th>
                  <td>${registration.nom}</td>
                </tr>
                <tr>
                  <th>Email</th>
                  <td><a href="mailto:${registration.email}">${registration.email}</a></td>
                </tr>
                <tr>
                  <th>Telephone</th>
                  <td><a href="tel:${registration.telephone}">${registration.telephone}</a></td>
                </tr>
                ${registration.entreprise ? `<tr><th>Entreprise</th><td>${registration.entreprise}</td></tr>` : ""}
                <tr>
                  <th>Mode</th>
                  <td>${modeLabel}</td>
                </tr>
                <tr>
                  <th>Date d'inscription</th>
                  <td>${formatDateTime(registration.created_at)}</td>
                </tr>
                <tr>
                  <th>Date de session</th>
                  <td>${formation.session_date}</td>
                </tr>
              </table>
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/admin" class="button">
                  Voir le tableau de bord
                </a>
              </div>
            </div>
            <div class="footer">
              <p>Gestion Formation - Systeme de notification automatique</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const subject = registration.is_preregistration
      ? `[Pre-inscription] ${formation.titre} - ${registration.prenom} ${registration.nom}`
      : `Nouvelle inscription - ${formation.titre} - ${registration.prenom} ${registration.nom}`;

    await resend.emails.send({
      from: emailFrom,
      to: adminEmail,
      subject: subject,
      html: htmlContent,
    });

    console.log("Email notification sent successfully");
    return { success: true };
  } catch (error) {
    console.error("Email notification failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur email",
    };
  }
}
