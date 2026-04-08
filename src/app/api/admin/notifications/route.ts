import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import supabaseAdmin from "@/lib/supabase/admin";
import { retryNotification } from "@/lib/notifications/whatsapp";

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

// GET: Fetch notifications history
export async function GET(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json(
      { success: false, message: "Non autorise" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const formationId = searchParams.get("formation_id");
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = supabaseAdmin
      .from("notifications")
      .select(
        "*, registration:registrations(id, prenom, nom, email), formation:formations(id, titre, slug)",
        { count: "exact" }
      );

    // Apply filters
    if (formationId) {
      query = query.eq("formation_id", formationId);
    }
    if (status && status !== "all") {
      query = query.eq("status", status);
    }
    if (type && type !== "all") {
      query = query.eq("notification_type", type);
    }

    // Order and paginate
    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
      total: count,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { success: false, message: "Erreur lors du chargement des notifications" },
      { status: 500 }
    );
  }
}

// POST: Retry a failed notification
export async function POST(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json(
      { success: false, message: "Non autorise" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { notification_id, action } = body;

    if (action === "retry" && notification_id) {
      const result = await retryNotification(notification_id);

      if (!result.success) {
        return NextResponse.json(
          { success: false, message: result.error || "Echec du renvoi" },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Notification renvoyee",
        message_sid: result.messageSid,
      });
    }

    return NextResponse.json(
      { success: false, message: "Action non reconnue" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in notification action:", error);
    return NextResponse.json(
      { success: false, message: "Erreur lors de l'operation" },
      { status: 500 }
    );
  }
}
