"use client";

import { useState } from "react";
import { Formation } from "@/types";
import ProgressBar from "@/components/ui/ProgressBar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

interface FormationsTableProps {
  formations: Formation[];
  isLoading: boolean;
  onUpdateCapacity: (id: string, newCapacity: number) => Promise<void>;
  onToggleActive: (id: string, isActive: boolean) => Promise<void>;
  onViewRegistrations: (formation: Formation) => void;
  onEdit?: (formation: Formation) => void;
  onDelete?: (formation: Formation) => void;
}

export default function FormationsTable({
  formations,
  isLoading,
  onUpdateCapacity,
  onToggleActive,
  onViewRegistrations,
  onEdit,
  onDelete,
}: FormationsTableProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleCapacityChange = async (id: string, delta: number) => {
    const formation = formations.find((f) => f.id === id);
    if (!formation) return;

    const newCapacity = Math.max(1, formation.max_attendees + delta);
    setUpdatingId(id);
    await onUpdateCapacity(id, newCapacity);
    setUpdatingId(null);
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    setUpdatingId(id);
    await onToggleActive(id, !currentActive);
    setUpdatingId(null);
  };

  if (isLoading) {
    return (
      <div className="bg-navy-700 rounded-xl border border-border-light overflow-hidden">
        <div className="p-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-navy-600 rounded-lg mb-4 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-navy-700 rounded-xl border border-border-light overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-6 py-4 text-sm font-medium text-text-muted">
                Formation
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-text-muted">
                Statut
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-text-muted">
                Capacite
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-text-muted">
                Progression
              </th>
              <th className="text-right px-6 py-4 text-sm font-medium text-text-muted">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {formations.map((formation) => {
              const isFull = formation.current_attendees >= formation.max_attendees;
              const isUpdating = updatingId === formation.id;

              return (
                <tr key={formation.id} className="border-b border-border last:border-0">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-text-primary">
                        {formation.titre}
                      </p>
                      {formation.nombre_jours && (
                        <p className="text-sm text-text-muted">
                          {formation.nombre_jours}j × {formation.heures_par_jour || 7}h
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {formation.is_active ? (
                        isFull ? (
                          <Badge variant="warning" dot>
                            Complet
                          </Badge>
                        ) : (
                          <Badge variant="success" dot>
                            Actif
                          </Badge>
                        )
                      ) : (
                        <Badge variant="neutral" dot>
                          Inactif
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCapacityChange(formation.id, -1)}
                        disabled={isUpdating || formation.max_attendees <= formation.current_attendees}
                        className="w-8 h-8 rounded-lg bg-navy-600 border border-border-light text-text-muted hover:text-text-primary hover:bg-navy-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        -
                      </button>
                      <span className="w-16 text-center text-text-primary font-medium">
                        {formation.current_attendees} / {formation.max_attendees}
                      </span>
                      <button
                        onClick={() => handleCapacityChange(formation.id, 1)}
                        disabled={isUpdating}
                        className="w-8 h-8 rounded-lg bg-navy-600 border border-border-light text-text-muted hover:text-text-primary hover:bg-navy-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 w-48">
                    <ProgressBar
                      value={formation.current_attendees}
                      max={formation.max_attendees}
                      showLabel={false}
                      size="md"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(formation)}
                          className="p-2 rounded-lg text-text-muted hover:text-teal-400 hover:bg-teal-500/10 transition-colors"
                          title="Modifier"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(formation)}
                          disabled={formation.current_attendees > 0}
                          className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={formation.current_attendees > 0 ? "Impossible de supprimer: des inscriptions existent" : "Supprimer"}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleActive(formation.id, formation.is_active)}
                        disabled={isUpdating}
                        className={`
                          px-3 py-1.5 text-sm rounded-lg border transition-colors
                          ${
                            formation.is_active
                              ? "border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                              : "border-green-500/30 text-green-400 hover:bg-green-500/10"
                          }
                          disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                      >
                        {formation.is_active ? "Désactiver" : "Activer"}
                      </button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onViewRegistrations(formation)}
                      >
                        Voir inscrits
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
