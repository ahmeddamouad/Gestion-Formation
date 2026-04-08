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
}

export default function FormationsTable({
  formations,
  isLoading,
  onUpdateCapacity,
  onToggleActive,
  onViewRegistrations,
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
                      <p className="text-sm text-text-muted">
                        Semaine {formation.week_number}
                      </p>
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
                        {formation.is_active ? "Desactiver" : "Activer"}
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
