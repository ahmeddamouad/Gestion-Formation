"use client";

import { useState, FormEvent } from "react";
import { Formation, RegistrationFormData, FormErrors } from "@/types";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import ModeToggle from "./ModeToggle";
import { validateRegistrationForm, hasErrors } from "@/lib/utils/validators";
import { getDiscountPercent, getTotalPrice } from "./PackSelectionBar";

interface PackRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFormations: Formation[];
  onSuccess?: () => void;
}

// Formation-specific mode state
interface FormationModes {
  [formationId: string]: "presentiel" | "visio";
}

export default function PackRegistrationModal({
  isOpen,
  onClose,
  selectedFormations,
  onSuccess,
}: PackRegistrationModalProps) {
  const [formData, setFormData] = useState<Partial<RegistrationFormData>>({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    entreprise: "",
  });
  const [formationModes, setFormationModes] = useState<FormationModes>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successData, setSuccessData] = useState<{
    registrationsCount: number;
    failedFormations: string[];
    totalFinal: number;
  } | null>(null);

  const count = selectedFormations.length;
  const discountPercent = getDiscountPercent(count);
  const totalOriginal = getTotalPrice(selectedFormations);
  const totalFinal = totalOriginal - (totalOriginal * discountPercent / 100);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-MA", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(price) + " DH";
  };

  const getFormationMode = (formationId: string): "presentiel" | "visio" => {
    return formationModes[formationId] || "presentiel";
  };

  const setFormationMode = (formationId: string, mode: "presentiel" | "visio") => {
    setFormationModes((prev) => ({ ...prev, [formationId]: mode }));
  };

  const handleChange = (field: keyof RegistrationFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (selectedFormations.length === 0) return;

    // Validate form
    const validationErrors = validateRegistrationForm(formData);
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const modesChoisis = selectedFormations.map((f) => getFormationMode(f.id));

      const response = await fetch("/api/register-pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formationIds: selectedFormations.map((f) => f.id),
          prenom: formData.prenom,
          nom: formData.nom,
          email: formData.email,
          telephone: formData.telephone,
          entreprise: formData.entreprise,
          modesChoisis,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setErrors({ general: result.message || "Une erreur est survenue" });
        return;
      }

      setIsSuccess(true);
      setSuccessData({
        registrationsCount: result.registrations_count || selectedFormations.length,
        failedFormations: result.failed_formations || [],
        totalFinal: result.total_final || totalFinal,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch {
      setErrors({ general: "Erreur de connexion. Veuillez reessayer." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      prenom: "",
      nom: "",
      email: "",
      telephone: "",
      entreprise: "",
    });
    setFormationModes({});
    setErrors({});
    setIsSuccess(false);
    setSuccessData(null);
    onClose();
  };

  if (selectedFormations.length === 0) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isSuccess ? "Pack confirme !" : `Pack de ${count} formations`}
      size="xl"
    >
      {isSuccess && successData ? (
        // Success state
        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-teal-500/20 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-teal-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            Merci pour votre inscription !
          </h3>
          <p className="text-text-muted mb-4">
            Vous etes inscrit(e) a {successData.registrationsCount} formation{successData.registrationsCount > 1 ? "s" : ""}.
            {discountPercent > 0 && (
              <span className="text-teal-400"> Vous beneficiez de {discountPercent}% de reduction !</span>
            )}
          </p>
          {successData.failedFormations.length > 0 && (
            <div className="mb-4 p-3 rounded-lg bg-amber-500/20 border border-amber-500/30 text-left">
              <p className="text-amber-400 text-sm">
                <strong>Attention:</strong> Les formations suivantes n&apos;ont pas pu etre inscrites (possiblement completes):
              </p>
              <ul className="text-amber-300 text-sm mt-2 list-disc list-inside">
                {successData.failedFormations.map((name, i) => (
                  <li key={i}>{name}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-text-muted text-sm mb-6">
            Un email de confirmation vous sera envoye prochainement.
          </p>
          <Button onClick={handleClose}>Fermer</Button>
        </div>
      ) : (
        // Form state
        <form onSubmit={handleSubmit} className="p-6">
          {/* Pack summary */}
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-teal-500/10 to-transparent border border-teal-500/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-text-muted">Pack de {count} formations</span>
              <Badge variant="success">{discountPercent}% de reduction</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted line-through text-sm">
                {formatPrice(totalOriginal)}
              </span>
              <span className="text-2xl font-bold text-teal-400 font-display">
                {formatPrice(totalFinal)}
              </span>
            </div>
          </div>

          {/* Selected formations list with mode selection */}
          <div className="mb-6">
            <p className="text-sm font-medium text-text-secondary mb-3">
              Formations selectionnees
            </p>
            <div className="space-y-3">
              {selectedFormations.map((formation) => {
                const availableSpots = formation.max_attendees - formation.current_attendees;
                const isFull = availableSpots <= 0;

                return (
                  <div
                    key={formation.id}
                    className="p-4 rounded-lg bg-navy-600 border border-border"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1">
                        <p className="font-medium text-text-primary">{formation.titre}</p>
                        <p className="text-xs text-text-muted mt-1">
                          Semaine {formation.week_number}
                          {formation.prix && ` • ${formatPrice(formation.prix)}`}
                        </p>
                      </div>
                      {isFull && (
                        <Badge variant="warning" size="sm">Pre-inscription</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-muted">Mode:</span>
                      <ModeToggle
                        value={getFormationMode(formation.id)}
                        onChange={(mode) => setFormationMode(formation.id, mode)}
                        disabled={isSubmitting}
                        size="sm"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form fields */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Prenom"
                name="prenom"
                value={formData.prenom}
                onChange={(e) => handleChange("prenom", e.target.value)}
                error={errors.prenom}
                required
                placeholder="Votre prenom"
                disabled={isSubmitting}
              />
              <Input
                label="Nom"
                name="nom"
                value={formData.nom}
                onChange={(e) => handleChange("nom", e.target.value)}
                error={errors.nom}
                required
                placeholder="Votre nom"
                disabled={isSubmitting}
              />
            </div>

            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              error={errors.email}
              required
              placeholder="votre.email@exemple.com"
              disabled={isSubmitting}
            />

            <Input
              label="Telephone"
              name="telephone"
              type="tel"
              value={formData.telephone}
              onChange={(e) => handleChange("telephone", e.target.value)}
              error={errors.telephone}
              required
              placeholder="0612345678"
              helperText="Format: 0612345678 ou +212612345678"
              disabled={isSubmitting}
            />

            <Input
              label="Entreprise"
              name="entreprise"
              value={formData.entreprise}
              onChange={(e) => handleChange("entreprise", e.target.value)}
              error={errors.entreprise}
              placeholder="Nom de votre entreprise (optionnel)"
              disabled={isSubmitting}
            />
          </div>

          {/* General error */}
          {errors.general && (
            <div className="mt-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30">
              <p className="text-red-400 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Submit buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isSubmitting}
              fullWidth
            >
              Annuler
            </Button>
            <Button type="submit" isLoading={isSubmitting} fullWidth>
              Confirmer le pack ({formatPrice(totalFinal)})
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
