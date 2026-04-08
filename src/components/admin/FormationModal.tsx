"use client";

import { useState, useEffect } from "react";
import { Formation, FormationFormData } from "@/types";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface FormationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FormationFormData, isEdit: boolean) => Promise<void>;
  formation?: Formation | null;
  isLoading?: boolean;
}

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function FormationModal({
  isOpen,
  onClose,
  onSave,
  formation,
  isLoading = false,
}: FormationModalProps) {
  const isEdit = !!formation;

  const [formData, setFormData] = useState<FormationFormData>({
    slug: "",
    titre: "",
    description: "",
    session_date: "",
    max_attendees: 20,
    mode: "both",
    nombre_jours: 1,
    heures_par_jour: 7,
    prix: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form when editing
  useEffect(() => {
    if (formation) {
      setFormData({
        slug: formation.slug,
        titre: formation.titre,
        description: formation.description,
        session_date: formation.session_date,
        max_attendees: formation.max_attendees,
        mode: formation.mode,
        nombre_jours: formation.nombre_jours || 1,
        heures_par_jour: formation.heures_par_jour || 7,
        prix: formation.prix || 0,
        programme: formation.programme,
        objectifs: formation.objectifs,
        prerequis: formation.prerequis || undefined,
      });
    } else {
      // Reset form for new formation
      setFormData({
        slug: "",
        titre: "",
        description: "",
        session_date: "",
        max_attendees: 20,
        mode: "both",
        nombre_jours: 1,
        heures_par_jour: 7,
        prix: 0,
      });
    }
    setErrors({});
  }, [formation, isOpen]);

  // Auto-generate slug from title
  const handleTitleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      titre: value,
      slug: isEdit ? prev.slug : generateSlug(value),
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.titre.trim()) {
      newErrors.titre = "Le titre est requis";
    }
    if (!formData.slug.trim()) {
      newErrors.slug = "Le slug est requis";
    }
    if (!formData.description.trim()) {
      newErrors.description = "La description est requise";
    }
    if (!formData.session_date) {
      newErrors.session_date = "La date de session est requise";
    }
    if (formData.max_attendees < 1) {
      newErrors.max_attendees = "La capacité doit être au moins 1";
    }
    if (formData.nombre_jours < 1) {
      newErrors.nombre_jours = "Le nombre de jours doit être au moins 1";
    }
    if (formData.heures_par_jour <= 0) {
      newErrors.heures_par_jour = "Les heures par jour doivent être positives";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSave(formData, isEdit);
  };

  const totalHours = formData.nombre_jours * formData.heures_par_jour;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Modifier la formation" : "Nouvelle formation"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Title & Slug */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Titre"
            name="titre"
            value={formData.titre}
            onChange={(e) => handleTitleChange(e.target.value)}
            error={errors.titre}
            required
          />
          <Input
            label="Slug (URL)"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            error={errors.slug}
            helperText={isEdit ? "Attention: modifier le slug peut casser les liens existants" : undefined}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Description <span className="text-red-400">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2.5 rounded-lg bg-navy-600 border border-border-light text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-teal-500/50 resize-none"
            placeholder="Description de la formation..."
          />
          {errors.description && (
            <p className="text-sm text-red-400 mt-1">{errors.description}</p>
          )}
        </div>

        {/* Date */}
        <Input
          label="Date de session"
          name="session_date"
          type="date"
          value={formData.session_date}
          onChange={handleChange}
          error={errors.session_date}
          required
        />

        {/* Duration */}
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Nombre de jours"
            name="nombre_jours"
            type="number"
            min={1}
            value={formData.nombre_jours}
            onChange={handleChange}
            error={errors.nombre_jours}
          />
          <Input
            label="Heures par jour"
            name="heures_par_jour"
            type="number"
            min={0.5}
            step={0.5}
            value={formData.heures_par_jour}
            onChange={handleChange}
            error={errors.heures_par_jour}
          />
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Durée totale
            </label>
            <div className="px-4 py-2.5 rounded-lg bg-navy-700 border border-border text-text-primary">
              {totalHours} heures
            </div>
          </div>
        </div>

        {/* Capacity, Mode, Price */}
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Capacité max"
            name="max_attendees"
            type="number"
            min={1}
            value={formData.max_attendees}
            onChange={handleChange}
            error={errors.max_attendees}
          />
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Mode
            </label>
            <select
              name="mode"
              value={formData.mode}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg bg-navy-600 border border-border-light text-text-primary focus:outline-none focus:ring-2 focus:ring-teal-500/50"
            >
              <option value="both">Présentiel & Visio</option>
              <option value="presentiel">Présentiel uniquement</option>
              <option value="visio">Visio uniquement</option>
            </select>
          </div>
          <Input
            label="Prix (MAD)"
            name="prix"
            type="number"
            min={0}
            value={formData.prix}
            onChange={handleChange}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <Button type="button" variant="secondary" onClick={onClose} fullWidth>
            Annuler
          </Button>
          <Button type="submit" isLoading={isLoading} fullWidth>
            {isEdit ? "Enregistrer" : "Créer"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
