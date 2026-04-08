import { DashboardStats } from "@/types";

interface StatsCardsProps {
  stats: DashboardStats | null;
  isLoading: boolean;
}

const statCards = [
  {
    key: "total_registrations",
    label: "Total des inscriptions",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    color: "teal",
  },
  {
    key: "weekly_registrations",
    label: "Cette semaine",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    color: "blue",
  },
  {
    key: "full_sessions",
    label: "Sessions completes",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "green",
  },
  {
    key: "pending_preregistrations",
    label: "Pre-inscriptions",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "amber",
  },
];

const colorClasses: Record<string, { bg: string; text: string; iconBg: string }> = {
  teal: {
    bg: "bg-teal-500/10",
    text: "text-teal-500",
    iconBg: "bg-teal-500/20",
  },
  blue: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    iconBg: "bg-blue-500/20",
  },
  green: {
    bg: "bg-green-500/10",
    text: "text-green-400",
    iconBg: "bg-green-500/20",
  },
  amber: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    iconBg: "bg-amber-500/20",
  },
};

export default function StatsCards({ stats, isLoading }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card) => {
        const colors = colorClasses[card.color];
        const value = stats
          ? stats[card.key as keyof DashboardStats]
          : 0;

        return (
          <div
            key={card.key}
            className={`${colors.bg} rounded-xl p-6 border border-border-light`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm mb-1">{card.label}</p>
                {isLoading ? (
                  <div className="h-8 w-16 bg-navy-600 rounded animate-pulse" />
                ) : (
                  <p className={`text-3xl font-bold ${colors.text} font-display`}>
                    {value}
                  </p>
                )}
              </div>
              <div className={`p-3 rounded-lg ${colors.iconBg} ${colors.text}`}>
                {card.icon}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
