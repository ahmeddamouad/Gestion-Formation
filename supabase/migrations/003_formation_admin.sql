-- Migration: Add structured duration fields for formations
-- Run this in your Supabase SQL editor

-- ============================================
-- ADD STRUCTURED DURATION COLUMNS
-- ============================================
ALTER TABLE formations ADD COLUMN IF NOT EXISTS nombre_jours INTEGER DEFAULT 1;
ALTER TABLE formations ADD COLUMN IF NOT EXISTS heures_par_jour DECIMAL(3,1) DEFAULT 7;

-- Update existing formations with structured data based on duree text
UPDATE formations SET nombre_jours = 2, heures_par_jour = 7 WHERE slug = 'powerbi';
UPDATE formations SET nombre_jours = 3, heures_par_jour = 7 WHERE slug = 'marketing';
UPDATE formations SET nombre_jours = 5, heures_par_jour = 7 WHERE slug = 'automatisation';
UPDATE formations SET nombre_jours = 3, heures_par_jour = 7 WHERE slug = 'rh';
