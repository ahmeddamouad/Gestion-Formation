"use client";

import { useState, useCallback } from "react";
import { Formation } from "@/types";
import { useFormations } from "@/hooks/useFormations";
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
import FormationDetailModal from "@/components/landing/FormationDetailModal";
import PackSelectionBar from "@/components/landing/PackSelectionBar";
import PackRegistrationModal from "@/components/landing/PackRegistrationModal";

export default function LandingPage() {
  const { formations, isLoading, error, refetch } = useFormations();

  // Registration modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);
  const [selectedMode, setSelectedMode] = useState<"presentiel" | "visio">("presentiel");

  // Detail modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailFormation, setDetailFormation] = useState<Formation | null>(null);

  // Pack selection state
  const [selectedForPack, setSelectedForPack] = useState<Set<string>>(new Set());
  const [packModalOpen, setPackModalOpen] = useState(false);

  // Get selected formations as array
  const selectedFormations = formations.filter((f) => selectedForPack.has(f.id));

  // Handle opening registration modal
  const handleRegister = useCallback((formation: Formation, mode: "presentiel" | "visio") => {
    setSelectedFormation(formation);
    setSelectedMode(mode);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setSelectedFormation(null);
  }, []);

  // Handle showing formation details
  const handleShowDetails = useCallback((formation: Formation) => {
    setDetailFormation(formation);
    setDetailModalOpen(true);
  }, []);

  const handleCloseDetailModal = useCallback(() => {
    setDetailModalOpen(false);
    setDetailFormation(null);
  }, []);

  // Handle detail modal register (opens registration modal from detail modal)
  const handleDetailRegister = useCallback((formation: Formation, mode: "presentiel" | "visio") => {
    setDetailModalOpen(false);
    setDetailFormation(null);
    // Small delay to let detail modal close
    setTimeout(() => {
      handleRegister(formation, mode);
    }, 100);
  }, [handleRegister]);

  // Handle pack selection
  const handleSelectForPack = useCallback((formation: Formation, selected: boolean) => {
    setSelectedForPack((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(formation.id);
      } else {
        next.delete(formation.id);
      }
      return next;
    });
  }, []);

  // Handle adding to pack from registration modal
  const handleAddToPackFromModal = useCallback((formation: Formation) => {
    setSelectedForPack((prev) => {
      const next = new Set(prev);
      next.add(formation.id);
      return next;
    });
    setModalOpen(false);
    setSelectedFormation(null);
  }, []);

  const handleViewPack = useCallback(() => {
    setPackModalOpen(true);
  }, []);

  const handleClearPack = useCallback(() => {
    setSelectedForPack(new Set());
  }, []);

  const handleClosePackModal = useCallback(() => {
    setPackModalOpen(false);
  }, []);

  const handlePackSuccess = useCallback(() => {
    // Clear selection and refetch formations
    setSelectedForPack(new Set());
    refetch();
  }, [refetch]);

  return (
    <main className="w-full min-h-screen bg-navy-900">
      <Navbar />
      <Hero />
      <FormationsSection
        formations={formations}
        isLoading={isLoading}
        error={error}
        onRegister={handleRegister}
        onShowDetails={handleShowDetails}
        onSelectForPack={handleSelectForPack}
        selectedFormationIds={selectedForPack}
      />
      <DashboardShowcase />
      <StatsCounter />
      <WhyUsSection />
      <FAQSection />
      <Footer />

      {/* Registration Modal (single formation) */}
      <RegistrationModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        formation={selectedFormation}
        initialMode={selectedMode}
        onAddToPack={handleAddToPackFromModal}
        isInPack={selectedFormation ? selectedForPack.has(selectedFormation.id) : false}
      />

      {/* Formation Detail Modal */}
      <FormationDetailModal
        isOpen={detailModalOpen}
        onClose={handleCloseDetailModal}
        formation={detailFormation}
        onRegister={handleDetailRegister}
      />

      {/* Pack Selection Bar */}
      <PackSelectionBar
        selectedFormations={selectedFormations}
        onViewPack={handleViewPack}
        onClear={handleClearPack}
      />

      {/* Pack Registration Modal */}
      <PackRegistrationModal
        isOpen={packModalOpen}
        onClose={handleClosePackModal}
        selectedFormations={selectedFormations}
        onSuccess={handlePackSuccess}
      />
    </main>
  );
}
