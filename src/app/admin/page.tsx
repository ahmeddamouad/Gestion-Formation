"use client";

import { useState, useEffect, useCallback } from "react";
import { Formation, DashboardStats, Registration } from "@/types";
import { StatsCards, FormationsTable, RegistrationsPanel } from "@/components/admin";

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingFormations, setIsLoadingFormations] = useState(true);
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoadingRegistrations, setIsLoadingRegistrations] = useState(false);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/stats");
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

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
      setIsLoadingFormations(false);
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
    fetchStats();
    fetchFormations();
  }, [fetchStats, fetchFormations]);

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
        // Refresh stats and formations
        fetchStats();
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

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary font-display">
          Tableau de bord
        </h1>
        <p className="text-text-muted mt-1">
          Bienvenue dans votre espace d&apos;administration
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8">
        <StatsCards stats={stats} isLoading={isLoadingStats} />
      </div>

      {/* Formations Table */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          Gestion des formations
        </h2>
        <FormationsTable
          formations={formations}
          isLoading={isLoadingFormations}
          onUpdateCapacity={handleUpdateCapacity}
          onToggleActive={handleToggleActive}
          onViewRegistrations={setSelectedFormation}
        />
      </div>

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
