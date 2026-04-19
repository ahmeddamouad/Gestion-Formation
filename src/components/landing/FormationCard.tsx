"use client";

import { useState } from "react";
import { Formation } from "@/types";
import Button from "@/components/ui/Button";
import ModeToggle from "./ModeToggle";

interface FormationCardProps {
  formation: Formation;
  onRegister: (formation: Formation, mode: "presentiel" | "visio") => void;
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
}: FormationCardProps) {
  const [selectedMode, setSelectedMode] = useState<"presentiel" | "visio">(
    "presentiel"
  );

  const handleRegister = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRegister(formation, selectedMode);
  };

  return (
    <div
      className="group relative bg-navy-700/50 rounded-2xl border border-white/5 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/5 hover:border-teal-500/20"
    >
      {/* Gradient border effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="relative p-6 sm:p-8">
        {/* Top row: Centered Icon + Title */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500/20 to-teal-600/10 border border-teal-500/20 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform mb-3">
            {icons[formation.slug] || icons.powerbi}
          </div>
          <h3 className="text-xl font-semibold text-text-primary font-display group-hover:text-teal-400 transition-colors">
            {formation.titre}
          </h3>
        </div>

        {/* Description */}
        <p className="text-text-muted text-sm leading-relaxed mb-4 line-clamp-2">
          {formation.description}
        </p>

        {/* Programme display */}
        {formation.programme && formation.programme.length > 0 && (
          <div className="mb-4 pb-4 border-b border-white/5">
            <h4 className="text-sm font-semibold text-teal-400 mb-2">Programme:</h4>
            <ul className="space-y-1">
              {formation.programme.map((item, index) => (
                <li key={index} className="text-sm text-text-muted flex items-start gap-2">
                  <span className="text-teal-400 mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Mode selection + CTA button */}
        <div className="flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
          <ModeToggle value={selectedMode} onChange={setSelectedMode} />
          <Button onClick={handleRegister} className="w-full whitespace-nowrap">
            S'inscrire
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
