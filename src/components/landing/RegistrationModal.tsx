"use client";

import { useState, FormEvent } from "react";
import emailjs from "@emailjs/browser";
import { Formation, RegistrationFormData, FormErrors } from "@/types";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ModeToggle from "./ModeToggle";
import { validateRegistrationForm, hasErrors } from "@/lib/utils/validators";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  formation: Formation | null;
  initialMode: "presentiel" | "visio";
}

export default function RegistrationModal({
  isOpen,
  onClose,
  formation,
  initialMode,
}: RegistrationModalProps) {
  const [formData, setFormData] = useState<Partial<RegistrationFormData>>({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    entreprise: "",
    mode: initialMode,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (field: keyof RegistrationFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formation) return;

    const validationErrors = validateRegistrationForm(formData);
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        {
          formation_titre: formation.titre,
          prenom: formData.prenom,
          nom: formData.nom,
          email: formData.email,
          telephone: formData.telephone,
          entreprise: formData.entreprise || "—",
          mode: formData.mode === "presentiel" ? "Présentiel" : "Visio",
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      );
      setIsSuccess(true);
    } catch {
      setErrors({ general: "Erreur lors de l'envoi. Veuillez reessayer." });
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
      mode: initialMode,
    });
    setErrors({});
    setIsSuccess(false);
    onClose();
  };

  if (!formation) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isSuccess ? "Inscription confirmee !" : formation.titre}
      size="lg"
    >
      {isSuccess ? (
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
          <p className="text-text-muted mb-6">
            Votre demande a ete enregistree. Vous recevrez une confirmation par email dans les plus brefs delais.
          </p>
          <Button onClick={handleClose}>Fermer</Button>
        </div>
      ) : (
        // Form state
        <form onSubmit={handleSubmit} className="p-6">
          {/* Formation info */}
          <div className="mb-6 p-4 rounded-lg bg-navy-600 border border-border">
            <p className="text-sm text-text-muted mb-1">Formation selectionnee</p>
            <p className="font-medium text-text-primary">{formation.titre}</p>
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

            <div>
              <p className="text-sm font-medium text-text-secondary mb-2">
                Mode de formation <span className="text-red-500">*</span>
              </p>
              <ModeToggle
                value={formData.mode || "presentiel"}
                onChange={(mode) => handleChange("mode", mode)}
                disabled={isSubmitting}
              />
              {errors.mode && (
                <p className="mt-1.5 text-sm text-red-500">{errors.mode}</p>
              )}
            </div>
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
              Confirmer mon inscription
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
