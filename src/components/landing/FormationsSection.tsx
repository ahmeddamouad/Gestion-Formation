"use client";

import { Formation } from "@/types";
import FormationCard from "./FormationCard";
import Spinner from "@/components/ui/Spinner";

interface FormationsSectionProps {
  formations: Formation[];
  isLoading: boolean;
  error: string | null;
  onRegister: (formation: Formation, mode: "presentiel" | "visio") => void;
  onShowDetails?: (formation: Formation) => void;
  onSelectForPack?: (formation: Formation, selected: boolean) => void;
  selectedFormationIds?: Set<string>;
}

export default function FormationsSection({
  formations,
  isLoading,
  error,
  onRegister,
  onShowDetails,
  onSelectForPack,
  selectedFormationIds = new Set(),
}: FormationsSectionProps) {
  // Temporarily show only Power BI formation for traffic building
  const visibleFormations = formations.filter(f =>
    f.slug?.toLowerCase().includes('power')
  );

  return (
    <section id="formations" className="w-full py-24 relative">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-900 via-navy-800/50 to-navy-900" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm font-medium mb-4">
            Nos programmes
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary font-display mb-6">
            Formations <span className="gradient-text">qualifiantes</span>
          </h2>
          <p className="text-text-muted max-w-2xl mx-auto text-lg">
            Choisissez la formation adaptee a vos objectifs.
            Disponibles en presentiel et en visioconference.
          </p>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="text-center py-16">
            <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-red-500/10 border border-red-500/20">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-400">{error}</span>
            </div>
          </div>
        )}

        {/* Formations grid */}
        {!isLoading && !error && visibleFormations.length > 0 && (
          <div className="max-w-xl mx-auto">
            {visibleFormations.map((formation, index) => (
              <div
                key={formation.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <FormationCard
                  formation={formation}
                  onRegister={onRegister}
                  onShowDetails={onShowDetails}
                  onSelectForPack={onSelectForPack}
                  isSelectedForPack={selectedFormationIds.has(formation.id)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && visibleFormations.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-navy-700 flex items-center justify-center">
              <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-text-muted text-lg">
              Aucune formation disponible pour le moment.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
