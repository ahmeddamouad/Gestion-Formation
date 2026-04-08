import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import supabaseAdmin from "@/lib/supabase/admin";
import { sendPaymentConfirmation } from "@/lib/notifications/whatsapp";

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

// PATCH: Update payment status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdmin())) {
    return NextResponse.json(
      { success: false, message: "Non autorise" },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { payment_status, payment_amount, send_confirmation } = body;

    // Validate payment status
    if (!["pending", "paid", "refunded"].includes(payment_status)) {
      return NextResponse.json(
        { success: false, message: "Statut de paiement invalide" },
        { status: 400 }
      );
    }

    // Get registration with formation data
    const { data: registration, error: fetchError } = await supabaseAdmin
      .from("registrations")
      .select("*, formation:formations(*)")
      .eq("id", id)
      .single();

    if (fetchError || !registration) {
      return NextResponse.json(
        { success: false, message: "Inscription non trouvee" },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {
      payment_status,
    };

    if (payment_status === "paid") {
      updateData.payment_date = new Date().toISOString();
      if (payment_amount !== undefined) {
        updateData.payment_amount = payment_amount;
      }
    } else if (payment_status === "pending") {
      updateData.payment_date = null;
    }

    // Update registration
    const { error: updateError } = await supabaseAdmin
      .from("registrations")
      .update(updateData)
      .eq("id", id);

    if (updateError) {
      throw updateError;
    }

    // Send WhatsApp confirmation if requested and status is paid
    let whatsappResult = null;
    if (send_confirmation && payment_status === "paid" && registration.formation) {
      whatsappResult = await sendPaymentConfirmation(
        registration,
        registration.formation
      );
    }

    return NextResponse.json({
      success: true,
      message:
        payment_status === "paid"
          ? "Paiement confirme"
          : payment_status === "refunded"
          ? "Remboursement enregistre"
          : "Statut mis a jour",
      whatsapp_sent: whatsappResult?.success ?? false,
      whatsapp_error: whatsappResult?.error,
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    return NextResponse.json(
      { success: false, message: "Erreur lors de la mise a jour" },
      { status: 500 }
    );
  }
}

// GET: Get payment status for a registration
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdmin())) {
    return NextResponse.json(
      { success: false, message: "Non autorise" },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;

    const { data: registration, error } = await supabaseAdmin
      .from("registrations")
      .select("id, payment_status, payment_date, payment_amount")
      .eq("id", id)
      .single();

    if (error || !registration) {
      return NextResponse.json(
        { success: false, message: "Inscription non trouvee" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: registration });
  } catch (error) {
    console.error("Error fetching payment status:", error);
    return NextResponse.json(
      { success: false, message: "Erreur lors du chargement" },
      { status: 500 }
    );
  }
}
