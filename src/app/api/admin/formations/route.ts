import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import supabaseAdmin from "@/lib/supabase/admin";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "default-secret-change-in-production"
);

// Middleware to verify admin auth
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

// GET: Fetch all formations
export async function GET() {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ success: false, message: "Non autorise" }, { status: 401 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("formations")
      .select("*")
      .order("slug");

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching formations:", error);
    return NextResponse.json(
      { success: false, message: "Erreur lors du chargement des formations" },
      { status: 500 }
    );
  }
}

// PATCH: Update a formation
export async function PATCH(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ success: false, message: "Non autorise" }, { status: 401 });
  }

  try {
    const { id, ...updates } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID de formation requis" },
        { status: 400 }
      );
    }

    // Only allow specific fields to be updated
    const allowedFields = ["max_attendees", "is_active", "session_date", "week_number"];
    const filteredUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = value;
      }
    }

    const { data, error } = await supabaseAdmin
      .from("formations")
      .update(filteredUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error updating formation:", error);
    return NextResponse.json(
      { success: false, message: "Erreur lors de la mise a jour" },
      { status: 500 }
    );
  }
}
