"use client";

import Image from "next/image";

const dashboards = [
  {
    id: 1,
    title: "Dashboard SKT Telecom",
    description: "Analyse des performances commerciales et KPIs",
    image: "/dashboard-skt.png",
  },
  {
    id: 2,
    title: "Dashboard RLS Security",
    description: "Securite au niveau des lignes (Row Level Security)",
    image: "/dashboard-rls.png",
  },
  {
    id: 3,
    title: "Dashboard Walmart",
    description: "Analyse des ventes et performances retail",
    image: "/dashboard-walmart.png",
  },
];

export default function DashboardShowcase() {
  return (
    <section className="w-full py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-800/50 via-navy-900 to-navy-900" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm font-medium mb-4">
            Exemples de realisations
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary font-display mb-6">
            Ce que vous allez <span className="gradient-text">construire</span>
          </h2>
          <p className="text-text-muted max-w-2xl mx-auto text-lg">
            Decouvrez les dashboards professionnels que nos apprenants realisent
            pendant la formation Power BI.
          </p>
        </div>

        {/* Dashboard grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboards.map((dashboard, index) => (
            <div
              key={dashboard.id}
              className="group relative bg-navy-700/50 rounded-2xl border border-white/5 overflow-hidden transition-all duration-300 hover:border-teal-500/30 hover:shadow-xl hover:shadow-teal-500/10 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image container */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={dashboard.image}
                  alt={dashboard.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg font-semibold text-text-primary font-display mb-2 group-hover:text-teal-400 transition-colors">
                  {dashboard.title}
                </h3>
                <p className="text-text-muted text-sm">
                  {dashboard.description}
                </p>
              </div>

              {/* Hover accent */}
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-teal-500 to-teal-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="text-center mt-12">
          <p className="text-text-muted">
            <span className="text-teal-400 font-medium">+50 projets pratiques</span>{" "}
            realises par nos apprenants
          </p>
        </div>
      </div>
    </section>
  );
}
