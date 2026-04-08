// Google Sheets integration
import { google } from "googleapis";
import { Registration, Formation } from "@/types";
import { formatDateTime } from "@/lib/utils/formatters";

const sheetId = process.env.GOOGLE_SHEET_ID;
const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

export async function appendToGoogleSheet(
  registration: Registration,
  formation: Formation
): Promise<{ success: boolean; error?: string }> {
  if (!sheetId || !serviceAccountJson) {
    console.warn(
      "Google Sheets notification skipped: Missing Google credentials"
    );
    return {
      success: false,
      error: "Configuration Google Sheets manquante",
    };
  }

  try {
    // Parse service account credentials
    const credentials = JSON.parse(serviceAccountJson);

    // Create auth client
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const modeLabel =
      registration.mode_choisi === "presentiel" ? "Présentiel" : "Visio";
    const preregistrationLabel = registration.is_preregistration
      ? "Oui"
      : "Non";

    // Prepare row data
    // Columns: Date/Heure, Formation, Prenom, Nom, Email, Telephone, Entreprise, Mode, Pre-inscription, Semaine
    const rowData = [
      formatDateTime(registration.created_at),
      formation.titre,
      registration.prenom,
      registration.nom,
      registration.email,
      registration.telephone,
      registration.entreprise || "",
      modeLabel,
      preregistrationLabel,
      `Semaine ${formation.week_number}`,
    ];

    // Append to sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "Inscriptions!A:J", // Assumes sheet named "Inscriptions"
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [rowData],
      },
    });

    console.log("Google Sheets row appended successfully");
    return { success: true };
  } catch (error) {
    console.error("Google Sheets notification failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur Google Sheets",
    };
  }
}

// Create initial sheet headers if needed (run once)
export async function initializeSheet(): Promise<void> {
  if (!sheetId || !serviceAccountJson) {
    console.warn("Cannot initialize sheet: Missing credentials");
    return;
  }

  try {
    const credentials = JSON.parse(serviceAccountJson);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const headers = [
      "Date/Heure",
      "Formation",
      "Prénom",
      "Nom",
      "Email",
      "Téléphone",
      "Entreprise",
      "Mode",
      "Pré-inscription",
      "Semaine",
    ];

    // Check if headers exist
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "Inscriptions!A1:J1",
    });

    if (!response.data.values || response.data.values.length === 0) {
      // Add headers
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: "Inscriptions!A1:J1",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [headers],
        },
      });
      console.log("Google Sheets headers initialized");
    }
  } catch (error) {
    console.error("Failed to initialize Google Sheets:", error);
  }
}
