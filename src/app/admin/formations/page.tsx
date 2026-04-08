"use client";

import { useState, useEffect, useCallback } from "react";
import { Formation, Registration, FormationFormData } from "@/types";
import { FormationsTable, RegistrationsPanel, FormationModal } from "@/components/admin";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

export default function FormationsPage() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoadingRegistrations, setIsLoadingRegistrations] = useState(false);

  // Modal states
  const [showFormationModal, setShowFormationModal] = useState(false);
  const [editingFormation, setEditingFormation] = useState<Formation | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete confirmation
  const [deleteFormation, setDeleteFormation] = useState<Formation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch registrations for a formation
  const fetchRegistrations = useCallback(async (formationId: string) => {
    setIsLoadingRegistrations(true);
    try {
      const response = await fetch(`/api/admin/registrations?formation_id=${formationId}`);
      const data = await response.json();
      if (data.success) {
        setRegistrations(data.data);
      }
    } catch (error) {
      console.error("Error fetching registrations:", error);
    } finally {
      setIsLoadingRegistrations(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchFormations();
  }, [fetchFormations]);

  // Fetch registrations when formation is selected
  useEffect(() => {
    if (selectedFormation) {
      fetchRegistrations(selectedFormation.id);
    }
  }, [selectedFormation, fetchRegistrations]);

  // Update formation capacity
  const handleUpdateCapacity = async (id: string, newCapacity: number) => {
    try {
      const response = await fetch("/api/admin/formations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, max_attendees: newCapacity }),
      });
      const data = await response.json();
      if (data.success) {
        setFormations((prev) =>
          prev.map((f) => (f.id === id ? { ...f, max_attendees: newCapacity } : f))
        );
      }
    } catch (error) {
      console.error("Error updating capacity:", error);
    }
  };

  // Toggle formation active state
  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch("/api/admin/formations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_active: isActive }),
      });
      const data = await response.json();
      if (data.success) {
        setFormations((prev) =>
          prev.map((f) => (f.id === id ? { ...f, is_active: isActive } : f))
        );
      }
    } catch (error) {
      console.error("Error toggling active:", error);
    }
  };

  // Create or update formation
  const handleSaveFormation = async (formData: FormationFormData, isEdit: boolean) => {
    setIsSaving(true);
    try {
      const url = "/api/admin/formations";
      const method = isEdit ? "PATCH" : "POST";
      const body = isEdit
        ? { id: editingFormation?.id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        await fetchFormations();
        setShowFormationModal(false);
        setEditingFormation(null);
      } else {
        alert(data.message || "Erreur lors de l'enregistrement");
      }
    } catch (error) {
      console.error("Error saving formation:", error);
      alert("Erreur lors de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete formation
  const handleDeleteFormation = async () => {
    if (!deleteFormation) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/admin/formations?id=${deleteFormation.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        setFormations((prev) => prev.filter((f) => f.id !== deleteFormation.id));
        setDeleteFormation(null);
      } else {
        setDeleteError(data.message || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Error deleting formation:", error);
      setDeleteError("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  // Cancel registration
  const handleCancelRegistration = async (registrationId: string) => {
    try {
      const response = await fetch(`/api/admin/registrations?id=${registrationId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        setRegistrations((prev) =>
          prev.map((r) =>
            r.id === registrationId ? { ...r, status: "cancelled" as const } : r
          )
        );
        // Refresh formations
        fetchFormations();
      }
    } catch (error) {
      console.error("Error cancelling registration:", error);
    }
  };

  // Export registrations
  const handleExport = () => {
    if (!selectedFormation) return;
    window.open(`/api/admin/export?formation_id=${selectedFormation.id}`, "_blank");
  };

  // Open edit modal
  const handleEdit = (formation: Formation) => {
    setEditingFormation(formation);
    setShowFormationModal(true);
  };

  // Open create modal
  const handleCreate = () => {
    setEditingFormation(null);
    setShowFormationModal(true);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary font-display">
            Gestion des formations
          </h1>
          <p className="text-text-muted mt-1">
            Gérez les formations et leur capacité
          </p>
        </div>
        <Button onClick={handleCreate}>
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouvelle formation
        </Button>
      </div>

      {/* Formations Table */}
      <FormationsTable
        formations={formations}
        isLoading={isLoading}
        onUpdateCapacity={handleUpdateCapacity}
        onToggleActive={handleToggleActive}
        onViewRegistrations={setSelectedFormation}
        onEdit={handleEdit}
        onDelete={setDeleteFormation}
      />

      {/* Formation Modal (Create/Edit) */}
      <FormationModal
        isOpen={showFormationModal}
        onClose={() => {
          setShowFormationModal(false);
          setEditingFormation(null);
        }}
        onSave={handleSaveFormation}
        formation={editingFormation}
        isLoading={isSaving}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteFormation}
        onClose={() => {
          setDeleteFormation(null);
          setDeleteError(null);
        }}
        title="Supprimer la formation"
        size="sm"
      >
        <div className="p-6">
          <p className="text-text-muted mb-4">
            Êtes-vous sûr de vouloir supprimer la formation{" "}
            <span className="text-text-primary font-medium">
              {deleteFormation?.titre}
            </span>{" "}
            ?
          </p>
          <p className="text-sm text-amber-400 mb-4">
            Cette action est irréversible.
          </p>
          {deleteError && (
            <p className="text-sm text-red-400 mb-4 p-3 bg-red-500/10 rounded-lg">
              {deleteError}
            </p>
          )}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setDeleteFormation(null);
                setDeleteError(null);
              }}
              fullWidth
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteFormation}
              isLoading={isDeleting}
              fullWidth
            >
              Supprimer
            </Button>
          </div>
        </div>
      </Modal>

      {/* Registrations Panel */}
      {selectedFormation && (
        <RegistrationsPanel
          registrations={registrations}
          formation={selectedFormation}
          isLoading={isLoadingRegistrations}
          onClose={() => setSelectedFormation(null)}
          onCancel={handleCancelRegistration}
          onExport={handleExport}
        />
      )}
    </div>
  );
}
