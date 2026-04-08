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

    // Allow more fields to be updated for full editing
    const allowedFields = [
      "titre", "description", "slug", "session_date", "max_attendees",
      "is_active", "mode", "nombre_jours", "heures_par_jour",
      "prix", "programme", "objectifs", "prerequis",
      "location", "location_address", "location_maps_url", "visio_link", "whatsapp_group_link"
    ];
    const filteredUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = value;
      }
    }

    // Auto-generate duree text if duration fields are updated
    if (filteredUpdates.nombre_jours || filteredUpdates.heures_par_jour) {
      const nombreJours = (filteredUpdates.nombre_jours as number) || 1;
      const heuresParJour = (filteredUpdates.heures_par_jour as number) || 7;
      const totalHeures = nombreJours * heuresParJour;
      filteredUpdates.duree = `${nombreJours} jour${nombreJours > 1 ? 's' : ''} (${totalHeures} heures)`;
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

// POST: Create a new formation
export async function POST(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ success: false, message: "Non autorise" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.titre || !body.slug || !body.description || !body.session_date) {
      return NextResponse.json(
        { success: false, message: "Titre, slug, description et date sont requis" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const { data: existing } = await supabaseAdmin
      .from("formations")
      .select("id")
      .eq("slug", body.slug)
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Ce slug existe deja" },
        { status: 400 }
      );
    }

    // Generate duree text
    const nombreJours = body.nombre_jours || 1;
    const heuresParJour = body.heures_par_jour || 7;
    const totalHeures = nombreJours * heuresParJour;
    const duree = `${nombreJours} jour${nombreJours > 1 ? 's' : ''} (${totalHeures} heures)`;

    // Create formation
    const { data, error } = await supabaseAdmin
      .from("formations")
      .insert({
        slug: body.slug,
        titre: body.titre,
        description: body.description,
        session_date: body.session_date,
        max_attendees: body.max_attendees || 20,
        current_attendees: 0,
        mode: body.mode || "both",
        is_active: true,
        nombre_jours: nombreJours,
        heures_par_jour: heuresParJour,
        duree,
        prix: body.prix || 0,
        programme: body.programme || null,
        objectifs: body.objectifs || null,
        prerequis: body.prerequis || null,
        location: body.location || null,
        location_address: body.location_address || null,
        location_maps_url: body.location_maps_url || null,
        visio_link: body.visio_link || null,
        whatsapp_group_link: body.whatsapp_group_link || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data, message: "Formation creee avec succes" });
  } catch (error) {
    console.error("Error creating formation:", error);
    return NextResponse.json(
      { success: false, message: "Erreur lors de la creation de la formation" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a formation (only if no active registrations)
export async function DELETE(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ success: false, message: "Non autorise" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID de formation requis" },
        { status: 400 }
      );
    }

    // Check for active registrations
    const { count: registrationCount } = await supabaseAdmin
      .from("registrations")
      .select("*", { count: "exact", head: true })
      .eq("formation_id", id)
      .neq("status", "cancelled");

    if (registrationCount && registrationCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Impossible de supprimer: ${registrationCount} inscription(s) active(s) existent`,
          registration_count: registrationCount,
        },
        { status: 400 }
      );
    }

    // Delete any cancelled registrations first
    await supabaseAdmin
      .from("registrations")
      .delete()
      .eq("formation_id", id);

    // Delete the formation
    const { error } = await supabaseAdmin
      .from("formations")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Formation supprimee avec succes" });
  } catch (error) {
    console.error("Error deleting formation:", error);
    return NextResponse.json(
      { success: false, message: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}
