import { NextRequest, NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabase/admin";
import { sendAllNotifications } from "@/lib/notifications";
import { PackRegistrationFormData, CheckAndRegisterPackResult, Formation } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body: PackRegistrationFormData = await request.json();

    // Validate required fields
    if (
      !body.formationIds ||
      body.formationIds.length === 0 ||
      !body.prenom ||
      !body.nom ||
      !body.email ||
      !body.telephone
    ) {
      return NextResponse.json(
        { success: false, message: "Tous les champs obligatoires doivent etre remplis" },
        { status: 400 }
      );
    }

    // Validate at least 1 formation selected
    if (body.formationIds.length < 1) {
      return NextResponse.json(
        { success: false, message: "Selectionnez au moins une formation" },
        { status: 400 }
      );
    }

    // Default modes to presentiel if not provided
    const modesChoisis = body.modesChoisis || body.formationIds.map(() => "presentiel" as const);

    // Call the check_and_register_pack RPC function
    const { data, error } = await supabaseAdmin.rpc("check_and_register_pack", {
      p_formation_ids: body.formationIds,
      p_nom: body.nom,
      p_prenom: body.prenom,
      p_email: body.email,
      p_telephone: body.telephone,
      p_entreprise: body.entreprise || null,
      p_modes_choisis: modesChoisis,
    });

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { success: false, message: "Erreur lors de l'inscription. Veuillez reessayer." },
        { status: 500 }
      );
    }

    const result = data as CheckAndRegisterPackResult;

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message || "Erreur lors de l'inscription" },
        { status: 400 }
      );
    }

    // Fetch formations for notification
    const { data: formations } = await supabaseAdmin
      .from("formations")
      .select("*")
      .in("id", body.formationIds);

    // Build registration summary for notifications
    const formationNames = (formations || []).map((f: Formation) => f.titre).join(", ");

    if (result.registration_ids && result.registration_ids.length > 0) {
      // Fetch first registration for notification (with pack info)
      const { data: registration } = await supabaseAdmin
        .from("registrations")
        .select("*")
        .eq("id", result.registration_ids[0])
        .single();

      if (registration) {
        // Create a modified registration object with pack info for notifications
        const packRegistration = {
          ...registration,
          pack_info: {
            total_formations: result.registrations_count,
            discount_percent: result.discount_percent,
            total_original: result.total_original,
            total_final: result.total_final,
            formation_names: formationNames,
          },
        };

        // Create a pseudo-formation object for notifications
        const packFormation = {
          titre: `Pack de ${result.registrations_count} formations`,
          slug: "pack",
          description: formationNames,
          session_date: new Date().toISOString(),
          max_attendees: 0,
          current_attendees: 0,
          mode: "both" as const,
          is_active: true,
          week_number: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          id: result.pack_id || "",
        };

        // Send notifications in the background
        sendAllNotifications(packRegistration, packFormation).catch((err) => {
          console.error("Notification error:", err);
        });
      }
    }

    return NextResponse.json({
      success: true,
      pack_id: result.pack_id,
      registration_ids: result.registration_ids,
      failed_formations: result.failed_formations,
      discount_percent: result.discount_percent,
      total_original: result.total_original,
      total_final: result.total_final,
      registrations_count: result.registrations_count,
      message:
        result.registrations_count > 1
          ? `Votre pack de ${result.registrations_count} formations a ete enregistre avec succes`
          : "Votre inscription a ete confirmee avec succes",
    });
  } catch (error) {
    console.error("Pack registration error:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur. Veuillez reessayer." },
      { status: 500 }
    );
  }
}
