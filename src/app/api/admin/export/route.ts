import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import supabaseAdmin from "@/lib/supabase/admin";
import { generateCSV } from "@/lib/utils/csv";

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

// GET: Export registrations to CSV
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

    const csv = generateCSV(data || []);

    // Return CSV file
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="inscriptions_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting registrations:", error);
    return NextResponse.json(
      { success: false, message: "Erreur lors de l'export" },
      { status: 500 }
    );
  }
}
