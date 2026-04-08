"use client";

import { useState } from "react";
import { Formation } from "@/types";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import ModeToggle from "./ModeToggle";

interface FormationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  formation: Formation | null;
  onRegister: (formation: Formation, mode: "presentiel" | "visio") => void;
}

// Icon components
const icons: Record<string, React.ReactNode> = {
  powerbi: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  marketing: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  ),
  automatisation: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  rh: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
};

export default function FormationDetailModal({
  isOpen,
  onClose,
  formation,
  onRegister,
}: FormationDetailModalProps) {
  const [selectedMode, setSelectedMode] = useState<"presentiel" | "visio">("presentiel");

  if (!formation) return null;

  const availableSpots = formation.max_attendees - formation.current_attendees;
  const isFull = availableSpots <= 0;
  const isAlmostFull = availableSpots > 0 && availableSpots <= 3;

  const handleRegister = () => {
    onRegister(formation, selectedMode);
    onClose();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-MA", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(price) + " DH";
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={formation.titre} size="xl">
      <div className="px-6 pb-6">
        {/* Header with icon and badges */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-teal-500/20 to-teal-600/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
            {icons[formation.slug] || icons.powerbi}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {isFull ? (
                <Badge variant="danger" dot>Complet</Badge>
              ) : isAlmostFull ? (
                <Badge variant="warning" dot>
                  {availableSpots} place{availableSpots > 1 ? "s" : ""} restante{availableSpots > 1 ? "s" : ""}
                </Badge>
              ) : (
                <Badge variant="success" dot>Disponible</Badge>
              )}
              {formation.duree && (
                <Badge variant="neutral">
                  <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formation.duree}
                </Badge>
              )}
              <Badge variant="neutral">Semaine {formation.week_number}</Badge>
            </div>
            <p className="text-text-muted text-sm">{formation.description}</p>
          </div>
        </div>

        {/* Price */}
        {formation.prix && formation.prix > 0 && (
          <div className="bg-gradient-to-r from-teal-500/10 to-transparent border border-teal-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Tarif de la formation</span>
              <span className="text-2xl font-bold text-teal-400 font-display">
                {formatPrice(formation.prix)}
              </span>
            </div>
          </div>
        )}

        {/* Programme */}
        {formation.programme && formation.programme.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-text-primary font-display mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              Programme
            </h4>
            <ul className="space-y-2">
              {formation.programme.map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-text-secondary text-sm">
                  <span className="w-6 h-6 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 text-xs font-medium shrink-0">
                    {index + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Objectifs */}
        {formation.objectifs && formation.objectifs.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-text-primary font-display mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              Objectifs
            </h4>
            <ul className="space-y-2">
              {formation.objectifs.map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-text-secondary text-sm">
                  <svg className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Prerequis */}
        {formation.prerequis && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-text-primary font-display mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Prerequis
            </h4>
            <p className="text-text-secondary text-sm bg-navy-600/50 rounded-lg p-3 border border-white/5">
              {formation.prerequis}
            </p>
          </div>
        )}

        {/* Mode selection + CTA */}
        <div className="border-t border-white/5 pt-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm text-text-muted mb-2">Mode de participation</label>
              <ModeToggle value={selectedMode} onChange={setSelectedMode} />
            </div>
            <Button onClick={handleRegister} size="lg" className="whitespace-nowrap">
              {isFull ? "Pre-inscription" : "S'inscrire maintenant"}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </div>
          {isFull && (
            <p className="text-xs text-text-muted text-center mt-4">
              La session actuelle est complete. Votre inscription sera pour la semaine prochaine.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
