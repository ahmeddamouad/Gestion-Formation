import { Registration, Formation } from "@/types";
import { formatShortDate } from "./formatters";

// Convert registrations to CSV format
export function generateCSV(
  registrations: (Registration & { formation?: Formation })[]
): string {
  const headers = [
    "Date/Heure",
    "Formation",
    "Prenom",
    "Nom",
    "Email",
    "Telephone",
    "Entreprise",
    "Mode",
    "Pre-inscription",
    "Statut",
    "Date Session",
  ];

  const rows = registrations.map((reg) => [
    formatShortDate(reg.created_at),
    reg.formation?.titre || "N/A",
    reg.prenom,
    reg.nom,
    reg.email,
    reg.telephone,
    reg.entreprise || "",
    reg.mode_choisi === "presentiel" ? "Presentiel" : "Visio",
    reg.is_preregistration ? "Oui" : "Non",
    reg.status === "confirmed"
      ? "Confirme"
      : reg.status === "pending"
        ? "En attente"
        : "Annule",
    reg.formation?.session_date || "",
  ]);

  // Escape and format CSV
  const escapeCsvField = (field: string): string => {
    if (field.includes(",") || field.includes('"') || field.includes("\n")) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  };

  const csvContent = [
    headers.map(escapeCsvField).join(","),
    ...rows.map((row) => row.map(escapeCsvField).join(",")),
  ].join("\n");

  return csvContent;
}

// Download CSV file
export function downloadCSV(
  data: string,
  filename: string = "inscriptions.csv"
): void {
  // Add BOM for Excel UTF-8 compatibility
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + data], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
