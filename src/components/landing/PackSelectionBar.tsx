"use client";

import { Formation } from "@/types";

interface PackSelectionBarProps {
  selectedFormations: Formation[];
  onViewPack: () => void;
  onClear: () => void;
}

function getDiscountPercent(count: number): number {
  if (count >= 4) return 20;
  if (count >= 3) return 15;
  if (count >= 2) return 10;
  return 0;
}

function getTotalPrice(formations: Formation[]): number {
  return formations.reduce((sum, f) => sum + (f.prix || 0), 0);
}

export default function PackSelectionBar({
  selectedFormations,
  onViewPack,
  onClear,
}: PackSelectionBarProps) {
  const count = selectedFormations.length;
  const discountPercent = getDiscountPercent(count);
  const totalOriginal = getTotalPrice(selectedFormations);
  const totalFinal = totalOriginal - (totalOriginal * discountPercent / 100);
  const savings = totalOriginal - totalFinal;

  // Only show when 2+ formations selected
  if (count < 2) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-MA", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(price) + " DH";
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 animate-slide-up">
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 border-t border-teal-400/30 shadow-2xl shadow-teal-500/20">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Left side: Info */}
            <div className="flex items-center gap-4">
              {/* Count badge */}
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{count}</span>
                </div>
                <div>
                  <p className="text-white font-semibold">
                    Pack de {count} formation{count > 1 ? "s" : ""}
                  </p>
                  <p className="text-teal-100 text-sm">
                    {discountPercent}% de reduction
                  </p>
                </div>
              </div>

              {/* Separator */}
              <div className="hidden sm:block w-px h-10 bg-white/20" />

              {/* Price breakdown */}
              {totalOriginal > 0 && (
                <div className="hidden sm:block">
                  <p className="text-teal-100 text-sm line-through">
                    {formatPrice(totalOriginal)}
                  </p>
                  <p className="text-white font-bold text-lg">
                    {formatPrice(totalFinal)}
                    <span className="text-teal-100 text-sm font-normal ml-2">
                      (-{formatPrice(savings)})
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Right side: Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={onClear}
                className="px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-sm"
              >
                Annuler
              </button>
              <button
                onClick={onViewPack}
                className="flex items-center px-5 py-2.5 bg-white text-teal-600 font-semibold rounded-xl hover:bg-teal-50 transition-colors shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Voir le pack
              </button>
            </div>
          </div>

          {/* Mobile price */}
          {totalOriginal > 0 && (
            <div className="sm:hidden mt-3 pt-3 border-t border-white/20 flex items-center justify-between">
              <span className="text-teal-100 text-sm line-through">
                {formatPrice(totalOriginal)}
              </span>
              <span className="text-white font-bold">
                {formatPrice(totalFinal)}
                <span className="text-teal-100 text-sm font-normal ml-2">
                  (-{formatPrice(savings)})
                </span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Export utility functions for use elsewhere
export { getDiscountPercent, getTotalPrice };
