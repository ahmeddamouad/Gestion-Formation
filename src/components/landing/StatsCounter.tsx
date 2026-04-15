"use client";

import { RefObject } from "react";
import { useCountUp } from "@/hooks/useCountUp";
import { LANDING_STATS } from "@/lib/constants";

interface StatItemProps {
  end: number;
  suffix?: string;
  label: string;
  icon: React.ReactNode;
}

function StatItem({ end, suffix = "", label, icon }: StatItemProps) {
  const { count, ref } = useCountUp({ end, duration: 2000 });

  return (
    <div className="text-center group" ref={ref as RefObject<HTMLDivElement>}>
      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="text-4xl sm:text-5xl font-bold text-text-primary font-display mb-2">
        {count}
        <span className="text-teal-500">{suffix}</span>
      </div>
      <div className="text-text-muted">{label}</div>
    </div>
  );
}

const icons = {
  users: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  dashboard: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  star: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  clock: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export default function StatsCounter() {
  return (
    <section id="stats" className="w-full py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-navy-800" />
      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-transparent to-teal-500/5" />

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section title */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary font-display">
            Nos <span className="gradient-text">resultats</span> Power BI
          </h2>
        </div>

        {/* Stats grid - proper 4 columns */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <StatItem
            end={LANDING_STATS.totalLearners}
            suffix="+"
            label="Apprenants formes"
            icon={icons.users}
          />
          <StatItem
            end={50}
            suffix="+"
            label="Dashboards crees"
            icon={icons.dashboard}
          />
          <StatItem
            end={LANDING_STATS.satisfactionRate}
            suffix="%"
            label="Satisfaction"
            icon={icons.star}
          />
          <StatItem
            end={LANDING_STATS.yearsExperience}
            suffix="+"
            label="Ans d'experience"
            icon={icons.clock}
          />
        </div>
      </div>
    </section>
  );
}
