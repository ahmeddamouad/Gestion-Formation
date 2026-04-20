// Mock Formation data for landing page development
// This replaces Supabase backend integration temporarily

import { Formation } from "@/types";

export const mockFormations: Formation[] = [
  {
    id: "power-bi-001",
    slug: "power-bi",
    titre: "Formation Power BI",
    description:
      "Maitrisez la visualisation de donnees et la business intelligence avec Power BI. Apprenez a creer des tableaux de bord interactifs, analyser vos donnees et prendre des decisions eclairees.",
    programme: [
      "Introduction a Power BI et son ecosysteme",
      "Connexion aux sources de donnees (Excel, SQL, API)",
      "Transformation des donnees avec Power Query",
      "Modelisation des donnees et relations",
      "Creation de visualisations interactives",
      "Mesures DAX et calculs avances",
      "Tableaux de bord et rapports professionnels",
      "Publication et partage sur Power BI Service",
    ],
    objectifs: [
      "Maîtriser les fondamentaux de Power BI",
      "Créer des rapports professionnels",
      "Analyser des données complexes",
    ],
    prerequis: "Expérience avec Excel recommandée",
    duree: "3 jours",
    nombre_jours: 3,
    heures_par_jour: 8,
    prix: 1500,
    mode: "both",
    session_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    max_attendees: 20,
    current_attendees: 0,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    location: "Casablanca",
    location_address: "Centre de Formation, Casablanca",
    visio_link: "https://meet.google.com/xyz",
    whatsapp_group_link: "https://chat.whatsapp.com/xyz",
  },
];

// Mock hook that returns the formations
export function useMockFormations() {
  return {
    formations: mockFormations,
    isLoading: false,
    error: null,
    refetch: () => Promise.resolve(),
  };
}
