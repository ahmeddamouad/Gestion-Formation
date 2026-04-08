"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Formation, Registration } from "@/types";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { formatShortDate, formatPhoneNumber } from "@/lib/utils/formatters";

interface GroupedRegistrations {
  formation: Formation;
  registrations: Registration[];
  isCompleted: boolean;
}

export default function RegistrationsPage() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFormationId, setSelectedFormationId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grouped">("grouped");

  // Single delete state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Batch delete state
  const [batchDeleteFormation, setBatchDeleteFormation] = useState<Formation | null>(null);
  const [isBatchDeleting, setIsBatchDeleting] = useState(false);
  const [batchDeleteResult, setBatchDeleteResult] = useState<string | null>(null);

  // Fetch formations
  const fetchFormations = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/formations");
      const data = await response.json();
      if (data.success) {
        setFormations(data.data);
      }
    } catch (error) {
      console.error("Error fetching formations:", error);
    }
  }, []);

  // Fetch all registrations
  const fetchRegistrations = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = selectedFormationId === "all"
        ? "/api/admin/registrations"
        : `/api/admin/registrations?formation_id=${selectedFormationId}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setRegistrations(data.data);
      }
    } catch (error) {
      console.error("Error fetching registrations:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFormationId]);

  // Initial fetch
  useEffect(() => {
    fetchFormations();
  }, [fetchFormations]);

  // Fetch registrations when filter changes
  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  // Filter registrations by search query
  const filteredRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      if (!searchQuery) return true;
      const search = searchQuery.toLowerCase();
      return (
        reg.nom.toLowerCase().includes(search) ||
        reg.prenom.toLowerCase().includes(search) ||
        reg.email.toLowerCase().includes(search) ||
        reg.telephone.includes(search) ||
        (reg.entreprise && reg.entreprise.toLowerCase().includes(search))
      );
    });
  }, [registrations, searchQuery]);

  // Group registrations by formation
  const groupedRegistrations = useMemo((): GroupedRegistrations[] => {
    const groups: Record<string, GroupedRegistrations> = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    filteredRegistrations.forEach((reg) => {
      if (!groups[reg.formation_id]) {
        const formation = formations.find((f) => f.id === reg.formation_id);
        if (formation) {
          const sessionDate = new Date(formation.session_date);
          groups[reg.formation_id] = {
            formation,
            registrations: [],
            isCompleted: sessionDate < today,
          };
        }
      }
      if (groups[reg.formation_id]) {
        groups[reg.formation_id].registrations.push(reg);
      }
    });

    // Sort by session date (most recent first)
    return Object.values(groups).sort((a, b) =>
      new Date(b.formation.session_date).getTime() - new Date(a.formation.session_date).getTime()
    );
  }, [filteredRegistrations, formations]);

  // Cancel single registration
  const handleCancelRegistration = async () => {
    if (!confirmDeleteId) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/registrations?id=${confirmDeleteId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        setRegistrations((prev) =>
          prev.map((r) =>
            r.id === confirmDeleteId ? { ...r, status: "cancelled" as const } : r
          )
        );
      }
    } catch (error) {
      console.error("Error cancelling registration:", error);
    } finally {
      setIsDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  // Batch delete registrations
  const handleBatchDelete = async () => {
    if (!batchDeleteFormation) return;
    setIsBatchDeleting(true);
    setBatchDeleteResult(null);

    try {
      const response = await fetch(
        `/api/admin/registrations?formation_id=${batchDeleteFormation.id}&batch=true`,
        { method: "DELETE" }
      );
      const data = await response.json();

      if (data.success) {
        setBatchDeleteResult(data.message);
        // Remove deleted registrations from state
        setRegistrations((prev) =>
          prev.filter((r) => r.formation_id !== batchDeleteFormation.id)
        );
        // Refresh formations to update counts
        fetchFormations();
        // Close modal after short delay
        setTimeout(() => {
          setBatchDeleteFormation(null);
          setBatchDeleteResult(null);
        }, 2000);
      } else {
        setBatchDeleteResult(data.message || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Error batch deleting:", error);
      setBatchDeleteResult("Erreur lors de la suppression");
    } finally {
      setIsBatchDeleting(false);
    }
  };

  // Export registrations
  const handleExport = () => {
    const url = selectedFormationId === "all"
      ? "/api/admin/export"
      : `/api/admin/export?formation_id=${selectedFormationId}`;
    window.open(url, "_blank");
  };

  // Get formation title by id
  const getFormationTitle = (formationId: string) => {
    const formation = formations.find((f) => f.id === formationId);
    return formation?.titre || "Formation inconnue";
  };

  // Render registration item
  const renderRegistrationItem = (reg: Registration, showFormation = false) => (
    <div
      key={reg.id}
      className={`p-4 ${reg.status === "cancelled" ? "opacity-60" : ""}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium text-text-primary">
              {reg.prenom} {reg.nom}
            </p>
            {reg.is_preregistration && (
              <Badge variant="warning" size="sm">
                Pré-inscription
              </Badge>
            )}
            {reg.status === "cancelled" && (
              <Badge variant="danger" size="sm">
                Annulé
              </Badge>
            )}
            {reg.status === "confirmed" && (
              <Badge variant="success" size="sm">
                Confirmé
              </Badge>
            )}
          </div>
          {showFormation && (
            <p className="text-sm text-teal-500 mb-2">
              {getFormationTitle(reg.formation_id)}
            </p>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-sm text-text-muted">
            <p>
              <span className="text-text-secondary">Email:</span>{" "}
              <a href={`mailto:${reg.email}`} className="hover:text-teal-500">
                {reg.email}
              </a>
            </p>
            <p>
              <span className="text-text-secondary">Téléphone:</span>{" "}
              <a href={`tel:${reg.telephone}`} className="hover:text-teal-500">
                {formatPhoneNumber(reg.telephone)}
              </a>
            </p>
            {reg.entreprise && (
              <p>
                <span className="text-text-secondary">Entreprise:</span>{" "}
                {reg.entreprise}
              </p>
            )}
            <p>
              <span className="text-text-secondary">Mode:</span>{" "}
              {reg.mode_choisi === "presentiel" ? "Présentiel" : "Visio"}
            </p>
            <p>
              <span className="text-text-secondary">Date:</span>{" "}
              {formatShortDate(reg.created_at)}
            </p>
          </div>
        </div>
        {reg.status !== "cancelled" && (
          <button
            onClick={() => setConfirmDeleteId(reg.id)}
            className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Annuler l'inscription"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary font-display">
          Inscriptions
        </h1>
        <p className="text-text-muted mt-1">
          Consultez et gérez toutes les inscriptions
        </p>
      </div>

      {/* Filters */}
      <div className="bg-navy-700 rounded-xl border border-border-light p-4 mb-6 overflow-visible">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Rechercher par nom, email, téléphone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="relative">
            <select
              value={selectedFormationId}
              onChange={(e) => setSelectedFormationId(e.target.value)}
              className="appearance-none px-4 py-2.5 pr-10 rounded-lg bg-navy-600 border border-border-light text-text-primary focus:outline-none focus:ring-2 focus:ring-teal-500/50 cursor-pointer min-w-[200px] max-w-[300px]"
            >
              <option value="all">Toutes les formations</option>
              {formations.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.titre}
                </option>
              ))}
            </select>
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* View mode toggle */}
          <div className="flex rounded-lg border border-border-light overflow-hidden">
            <button
              onClick={() => setViewMode("grouped")}
              className={`px-3 py-2 text-sm ${
                viewMode === "grouped"
                  ? "bg-teal-500/20 text-teal-500"
                  : "bg-navy-600 text-text-muted hover:text-text-primary"
              }`}
            >
              Groupé
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-2 text-sm ${
                viewMode === "list"
                  ? "bg-teal-500/20 text-teal-500"
                  : "bg-navy-600 text-text-muted hover:text-text-primary"
              }`}
            >
              Liste
            </button>
          </div>

          <Button variant="secondary" onClick={handleExport}>
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exporter CSV
          </Button>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-text-muted mb-4">
        {filteredRegistrations.length} inscription{filteredRegistrations.length !== 1 ? "s" : ""} trouvée{filteredRegistrations.length !== 1 ? "s" : ""}
        {viewMode === "grouped" && ` dans ${groupedRegistrations.length} formation${groupedRegistrations.length !== 1 ? "s" : ""}`}
      </p>

      {/* Content */}
      {isLoading ? (
        <div className="bg-navy-700 rounded-xl border border-border-light p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 bg-navy-600 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filteredRegistrations.length === 0 ? (
        <div className="bg-navy-700 rounded-xl border border-border-light text-center py-12">
          <p className="text-text-muted">
            {searchQuery ? "Aucun résultat trouvé" : "Aucune inscription"}
          </p>
        </div>
      ) : viewMode === "grouped" ? (
        /* Grouped View */
        <div className="space-y-6">
          {groupedRegistrations.map((group) => (
            <div
              key={group.formation.id}
              className="bg-navy-700 rounded-xl border border-border-light overflow-hidden"
            >
              {/* Formation Header */}
              <div className="px-6 py-4 bg-navy-800 border-b border-border flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-text-primary">
                      {group.formation.titre}
                    </h3>
                    {group.isCompleted ? (
                      <Badge variant="neutral" size="sm">Terminée</Badge>
                    ) : (
                      <Badge variant="success" size="sm">Active</Badge>
                    )}
                  </div>
                  <p className="text-sm text-text-muted mt-1">
                    Session du {formatShortDate(group.formation.session_date)} • {group.registrations.length} inscription{group.registrations.length !== 1 ? "s" : ""}
                  </p>
                </div>
                {group.isCompleted && group.registrations.length > 0 && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setBatchDeleteFormation(group.formation)}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Supprimer tout
                  </Button>
                )}
              </div>

              {/* Registrations */}
              <div className="divide-y divide-border">
                {group.registrations.map((reg) => renderRegistrationItem(reg))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-navy-700 rounded-xl border border-border-light overflow-hidden">
          <div className="divide-y divide-border">
            {filteredRegistrations.map((reg) => renderRegistrationItem(reg, true))}
          </div>
        </div>
      )}

      {/* Single Delete Confirmation Modal */}
      <Modal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        title="Confirmer l'annulation"
        size="sm"
      >
        <div className="p-6">
          <p className="text-text-muted mb-6">
            Êtes-vous sûr de vouloir annuler cette inscription ? Cette action
            libérera une place dans la formation.
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setConfirmDeleteId(null)}
              fullWidth
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={handleCancelRegistration}
              isLoading={isDeleting}
              fullWidth
            >
              Confirmer
            </Button>
          </div>
        </div>
      </Modal>

      {/* Batch Delete Confirmation Modal */}
      <Modal
        isOpen={!!batchDeleteFormation}
        onClose={() => {
          setBatchDeleteFormation(null);
          setBatchDeleteResult(null);
        }}
        title="Supprimer toutes les inscriptions"
        size="sm"
      >
        <div className="p-6">
          {batchDeleteResult ? (
            <div className={`p-4 rounded-lg mb-4 ${
              batchDeleteResult.includes("Erreur") || batchDeleteResult.includes("Impossible")
                ? "bg-red-500/10 text-red-400"
                : "bg-green-500/10 text-green-400"
            }`}>
              {batchDeleteResult}
            </div>
          ) : (
            <>
              <p className="text-text-muted mb-4">
                Êtes-vous sûr de vouloir supprimer toutes les inscriptions de la formation{" "}
                <span className="text-text-primary font-medium">
                  {batchDeleteFormation?.titre}
                </span>{" "}
                ?
              </p>
              <p className="text-sm text-amber-400 mb-6">
                Cette action est irréversible et supprimera définitivement toutes les données.
              </p>
            </>
          )}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setBatchDeleteFormation(null);
                setBatchDeleteResult(null);
              }}
              fullWidth
            >
              {batchDeleteResult ? "Fermer" : "Annuler"}
            </Button>
            {!batchDeleteResult && (
              <Button
                variant="danger"
                onClick={handleBatchDelete}
                isLoading={isBatchDeleting}
                fullWidth
              >
                Supprimer tout
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
