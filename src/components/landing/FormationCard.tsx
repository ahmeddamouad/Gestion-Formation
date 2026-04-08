"use client";

import { useState } from "react";
import { Formation } from "@/types";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import ModeToggle from "./ModeToggle";

interface FormationCardProps {
  formation: Formation;
  onRegister: (formation: Formation, mode: "presentiel" | "visio") => void;
  onShowDetails?: (formation: Formation) => void;
  onSelectForPack?: (formation: Formation, selected: boolean) => void;
  isSelectedForPack?: boolean;
}

// Icon components
const icons: Record<string, React.ReactNode> = {
  powerbi: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  marketing: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  ),
  automatisation: (
    <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  rh: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
};

export default function FormationCard({
  formation,
  onRegister,
  onShowDetails,
  onSelectForPack,
  isSelectedForPack = false,
}: FormationCardProps) {
  const [selectedMode, setSelectedMode] = useState<"presentiel" | "visio">(
    "presentiel"
  );

  const availableSpots = formation.max_attendees - formation.current_attendees;
  const isFull = availableSpots <= 0;
  const isAlmostFull = availableSpots > 0 && availableSpots <= 3;
  const fillPercentage = Math.min(100, (formation.current_attendees / formation.max_attendees) * 100);

  const handleRegister = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRegister(formation, selectedMode);
  };

  const handleCardClick = () => {
    if (onShowDetails) {
      onShowDetails(formation);
    }
  };

  const handlePackToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelectForPack) {
      onSelectForPack(formation, !isSelectedForPack);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`
        group relative bg-navy-700/50 rounded-2xl border overflow-hidden transition-all duration-300
        hover:shadow-xl hover:shadow-teal-500/5 cursor-pointer
        ${isSelectedForPack
          ? "border-teal-500 ring-2 ring-teal-500/20"
          : "border-white/5 hover:border-teal-500/20"
        }
      `}
    >
      {/* Gradient border effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="relative p-6 sm:p-8">
        {/* Top row: Icon + Badge */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500/20 to-teal-600/10 border border-teal-500/20 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
              {icons[formation.slug] || icons.powerbi}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-text-primary font-display group-hover:text-teal-400 transition-colors">
                {formation.titre}
              </h3>
              {formation.prix && formation.prix > 0 && (
                <span className="text-sm text-teal-400 font-medium mt-1 block">{formation.prix} DH</span>
              )}
            </div>
          </div>
          <div>
            {isFull ? (
              <Badge variant="danger" dot>Complet</Badge>
            ) : isAlmostFull ? (
              <Badge variant="warning" dot>
                {availableSpots} place{availableSpots > 1 ? "s" : ""}
              </Badge>
            ) : (
              <Badge variant="success" dot>Disponible</Badge>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-text-muted text-sm leading-relaxed mb-4 line-clamp-2">
          {formation.description}
        </p>

        {/* View details link */}
        {onShowDetails && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShowDetails(formation);
            }}
            className="text-teal-400 text-sm hover:text-teal-300 transition-colors mb-4 flex items-center gap-1"
          >
            Voir le programme complet
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-text-muted">Places reservees</span>
            <span className="text-text-secondary font-medium">
              {formation.current_attendees}/{formation.max_attendees}
            </span>
          </div>
          <div className="h-2 bg-navy-600 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isFull
                  ? "bg-red-500"
                  : isAlmostFull
                  ? "bg-amber-500"
                  : "bg-teal-500"
              }`}
              style={{ width: `${fillPercentage}%` }}
            />
          </div>
        </div>

        {/* Mode selection + CTA buttons */}
        <div className="flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
          <ModeToggle value={selectedMode} onChange={setSelectedMode} />
          <div className="flex items-center gap-3">
            {onSelectForPack && (
              <Button
                onClick={handlePackToggle}
                variant={isSelectedForPack ? "primary" : "secondary"}
                className={`flex-1 ${isSelectedForPack ? "bg-teal-600 hover:bg-teal-700" : ""}`}
              >
                {isSelectedForPack ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Dans le pack
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Ajouter au pack
                  </>
                )}
              </Button>
            )}
            <Button onClick={handleRegister} className="flex-1 whitespace-nowrap">
              {isFull ? "Pre-inscription" : "S'inscrire"}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </div>
        </div>

        {isFull && (
          <p className="text-xs text-text-muted text-center mt-4 pt-4 border-t border-white/5">
            Inscription pour la session de la semaine prochaine
          </p>
        )}
      </div>
    </div>
  );
}
