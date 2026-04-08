import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import supabaseAdmin from "@/lib/supabase/admin";
import {
  sendManualNotification,
  sendReminder,
  sendPaymentConfirmation,
} from "@/lib/notifications/whatsapp";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "default-secret-change-in-production"
);

async function verifyAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token) return false;
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

// POST: Send manual notification or trigger specific notification type
export async function POST(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json(
      { success: false, message: "Non autorise" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { registration_id, notification_type, custom_message } = body;

    if (!registration_id) {
      return NextResponse.json(
        { success: false, message: "ID d'inscription requis" },
        { status: 400 }
      );
    }

    // Get registration with formation data
    const { data: registration, error: fetchError } = await supabaseAdmin
      .from("registrations")
      .select("*, formation:formations(*)")
      .eq("id", registration_id)
      .single();

    if (fetchError || !registration) {
      return NextResponse.json(
        { success: false, message: "Inscription non trouvee" },
        { status: 404 }
      );
    }

    if (!registration.formation) {
      return NextResponse.json(
        { success: false, message: "Formation non trouvee" },
        { status: 404 }
      );
    }

    let result;

    switch (notification_type) {
      case "payment_confirmation":
        result = await sendPaymentConfirmation(registration, registration.formation);
        break;

      case "reminder_24h":
        result = await sendReminder(registration, registration.formation);
        break;

      case "manual":
        if (!custom_message) {
          return NextResponse.json(
            { success: false, message: "Message requis pour les notifications manuelles" },
            { status: 400 }
          );
        }
        result = await sendManualNotification(
          registration,
          registration.formation,
          custom_message
        );
        break;

      default:
        return NextResponse.json(
          { success: false, message: "Type de notification invalide" },
          { status: 400 }
        );
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error || "Echec de l'envoi" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notification envoyee",
      message_sid: result.messageSid,
      notification_id: result.notificationId,
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    return NextResponse.json(
      { success: false, message: "Erreur lors de l'envoi" },
      { status: 500 }
    );
  }
}
