import { NextRequest, NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabase/admin";
import { sendAllNotifications } from "@/lib/notifications";
import { RegistrationFormData, CheckAndRegisterResult } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body: RegistrationFormData = await request.json();

    // Validate required fields
    if (!body.formationId || !body.prenom || !body.nom || !body.email || !body.telephone || !body.mode) {
      return NextResponse.json(
        { success: false, message: "Tous les champs obligatoires doivent etre remplis" },
        { status: 400 }
      );
    }

    // Call the check_and_register RPC function
    const { data, error } = await supabaseAdmin.rpc("check_and_register", {
      p_formation_id: body.formationId,
      p_nom: body.nom,
      p_prenom: body.prenom,
      p_email: body.email,
      p_telephone: body.telephone,
      p_entreprise: body.entreprise || null,
      p_mode_choisi: body.mode,
    });

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { success: false, message: "Erreur lors de l'inscription. Veuillez reessayer." },
        { status: 500 }
      );
    }

    const result = data as CheckAndRegisterResult;

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message || "Erreur lors de l'inscription" },
        { status: 400 }
      );
    }

    // Fetch the full registration and formation data for notifications
    const { data: registration } = await supabaseAdmin
      .from("registrations")
      .select("*, formation:formations(*)")
      .eq("id", result.registration_id)
      .single();

    if (registration && registration.formation) {
      // Send notifications in the background (don't wait for them)
      sendAllNotifications(registration, registration.formation).catch((err) => {
        console.error("Notification error:", err);
      });
    }

    return NextResponse.json({
      success: true,
      registration_id: result.registration_id,
      is_preregistration: result.is_preregistration,
      message: result.is_preregistration
        ? "Votre pre-inscription a ete enregistree avec succes"
        : "Votre inscription a ete confirmee avec succes",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur. Veuillez reessayer." },
      { status: 500 }
    );
  }
}
