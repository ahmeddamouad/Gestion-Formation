"use client";

import { useState, useCallback } from "react";
import { Formation } from "@/types";
import { useMockFormations } from "@/lib/mockFormations";
import {
  Navbar,
  Hero,
  FormationsSection,
  RegistrationModal,
  StatsCounter,
  WhyUsSection,
  FAQSection,
  Footer,
  DashboardShowcase,
} from "@/components/landing";

export default function LandingPage() {
  const { formations, isLoading, error } = useMockFormations();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);
  const [selectedMode, setSelectedMode] = useState<"presentiel" | "visio">("presentiel");

  const handleRegister = useCallback((formation: Formation, mode: "presentiel" | "visio") => {
    setSelectedFormation(formation);
    setSelectedMode(mode);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setSelectedFormation(null);
  }, []);

  return (
    <main className="w-full min-h-screen bg-navy-900">
      <Navbar />
      <Hero />
      <FormationsSection
        formations={formations}
        isLoading={isLoading}
        error={error}
        onRegister={handleRegister}
      />
      <DashboardShowcase />
      <StatsCounter />
      <WhyUsSection />
      <FAQSection />
      <Footer />

      <RegistrationModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        formation={selectedFormation}
        initialMode={selectedMode}
      />
    </main>
  );
}
