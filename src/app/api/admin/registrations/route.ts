import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import supabaseAdmin from "@/lib/supabase/admin";

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

// GET: Fetch registrations (optionally filtered by formation_id)
export async function GET(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ success: false, message: "Non autorise" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const formationId = searchParams.get("formation_id");

    let query = supabaseAdmin
      .from("registrations")
      .select("*, formation:formations(*)");

    if (formationId) {
      query = query.eq("formation_id", formationId);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return NextResponse.json(
      { success: false, message: "Erreur lors du chargement des inscriptions" },
      { status: 500 }
    );
  }
}

// DELETE: Cancel a registration
export async function DELETE(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ success: false, message: "Non autorise" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID d'inscription requis" },
        { status: 400 }
      );
    }

    // Use the cancel_registration RPC function
    const { data, error } = await supabaseAdmin.rpc("cancel_registration", {
      p_registration_id: id,
    });

    if (error) throw error;

    if (!data.success) {
      return NextResponse.json(
        { success: false, message: data.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: "Inscription annulee" });
  } catch (error) {
    console.error("Error cancelling registration:", error);
    return NextResponse.json(
      { success: false, message: "Erreur lors de l'annulation" },
      { status: 500 }
    );
  }
}
