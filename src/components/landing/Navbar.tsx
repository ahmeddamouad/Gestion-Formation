"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/Button";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-7xl z-50 rounded-2xl bg-navy-800/95 backdrop-blur-md shadow-xl shadow-black/20 border border-white/5">
      <nav className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/logo.png"
              alt="WWP Academy"
              width={44}
              height={44}
              className="rounded-lg"
            />
            <span className="font-display font-bold text-xl text-text-primary">
              WWP <span className="text-teal-500">Academy</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("formations")}
              className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            >
              Formations
            </button>
            <button
              onClick={() => scrollToSection("stats")}
              className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            >
              Resultats
            </button>
            <button
              onClick={() => scrollToSection("why-us")}
              className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            >
              Pourquoi nous
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            >
              FAQ
            </button>
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button onClick={() => scrollToSection("formations")} size="sm">
              S&apos;inscrire
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-white/10">
            <div className="flex flex-col gap-4">
              <button
                onClick={() => scrollToSection("formations")}
                className="text-left text-text-muted hover:text-text-primary transition-colors py-2 cursor-pointer"
              >
                Formations
              </button>
              <button
                onClick={() => scrollToSection("stats")}
                className="text-left text-text-muted hover:text-text-primary transition-colors py-2 cursor-pointer"
              >
                Resultats
              </button>
              <button
                onClick={() => scrollToSection("why-us")}
                className="text-left text-text-muted hover:text-text-primary transition-colors py-2 cursor-pointer"
              >
                Pourquoi nous
              </button>
              <button
                onClick={() => scrollToSection("faq")}
                className="text-left text-text-muted hover:text-text-primary transition-colors py-2 cursor-pointer"
              >
                FAQ
              </button>
              <Button onClick={() => scrollToSection("formations")} fullWidth>
                S&apos;inscrire maintenant
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
