"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import Spinner from "@/components/ui/Spinner";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { isAuthenticated, isLoading, logout } = useAdminAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Load sidebar state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("admin-sidebar-open");
    if (saved !== null) {
      setSidebarOpen(JSON.parse(saved));
    }
  }, []);

  // Save sidebar state to localStorage
  const toggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    localStorage.setItem("admin-sidebar-open", JSON.stringify(newState));
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Don't show layout on login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Redirect handled by hook, show nothing while redirecting
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const navItems = [
    { href: "/admin", label: "Vue d'ensemble", icon: "home" },
    { href: "/admin/formations", label: "Formations", icon: "collection" },
    { href: "/admin/registrations", label: "Inscriptions", icon: "users" },
    { href: "/admin/notifications", label: "WhatsApp", icon: "whatsapp" },
  ];

  const icons: Record<string, ReactNode> = {
    home: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    collection: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    users: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    whatsapp: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  };

  return (
    <div className="min-h-screen bg-navy-900 flex">
      {/* Sidebar */}
      <aside
        className={`
          ${sidebarOpen ? "w-64" : "w-20"}
          bg-navy-800 border-r border-border flex flex-col transition-[width] duration-300 ease-in-out relative overflow-hidden
        `}
      >
        {/* Toggle button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-8 z-50 w-6 h-6 rounded-full bg-navy-700 border border-border flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-navy-600 transition-colors"
          title={sidebarOpen ? "Réduire" : "Agrandir"}
        >
          <svg
            className={`w-4 h-4 transition-transform ${sidebarOpen ? "" : "rotate-180"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Logo */}
        <div className={`${sidebarOpen ? "p-6" : "p-4"} border-b border-border`}>
          <Link href="/admin" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="WWP Academy"
              width={36}
              height={36}
              className="rounded-lg flex-shrink-0"
            />
            {sidebarOpen && (
              <h1 className="text-lg font-bold text-text-primary font-display whitespace-nowrap">
                WWP <span className="text-teal-500">Academy</span>
              </h1>
            )}
          </Link>
          {sidebarOpen && <p className="text-xs text-text-muted mt-1 whitespace-nowrap">Tableau de bord</p>}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors
                      ${sidebarOpen ? "" : "justify-center"}
                      ${
                        isActive
                          ? "bg-teal-500/10 text-teal-500"
                          : "text-text-muted hover:text-text-primary hover:bg-navy-700"
                      }
                    `}
                    title={sidebarOpen ? undefined : item.label}
                  >
                    {icons[item.icon]}
                    {sidebarOpen && <span className="font-medium whitespace-nowrap">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-border">
          <button
            onClick={logout}
            className={`
              w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors
              ${sidebarOpen ? "" : "justify-center"}
            `}
            title={sidebarOpen ? undefined : "Déconnexion"}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {sidebarOpen && <span className="font-medium whitespace-nowrap">Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
