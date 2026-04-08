-- Seed data for Formations Management Application
-- Run this after the migration to populate initial data

-- Clear existing data (for development only - remove in production)
TRUNCATE formations CASCADE;

-- Insert the 4 formations
INSERT INTO formations (slug, titre, description, session_date, max_attendees, current_attendees, mode, is_active, week_number)
VALUES
  (
    'powerbi',
    'Formation Power BI',
    'Maitrisez la visualisation de donnees et la business intelligence avec Power BI. Apprenez a creer des tableaux de bord interactifs, analyser vos donnees et prendre des decisions eclairees.',
    CURRENT_DATE + INTERVAL '7 days',
    20,
    0,
    'both',
    TRUE,
    EXTRACT(WEEK FROM CURRENT_DATE + INTERVAL '7 days')::INTEGER
  ),
  (
    'marketing',
    'Formation Digital Marketing',
    'Strategies digitales, reseaux sociaux, SEO et campagnes publicitaires. Developpez votre presence en ligne et atteignez vos objectifs commerciaux.',
    CURRENT_DATE + INTERVAL '7 days',
    15,
    0,
    'both',
    TRUE,
    EXTRACT(WEEK FROM CURRENT_DATE + INTERVAL '7 days')::INTEGER
  ),
  (
    'automatisation',
    'Formation Automatisation & Fullstack Vibe Coding',
    'No-code, automatisation de workflows, et developpement fullstack moderne. Creez des applications completes sans ecrire des milliers de lignes de code.',
    CURRENT_DATE + INTERVAL '7 days',
    12,
    0,
    'both',
    TRUE,
    EXTRACT(WEEK FROM CURRENT_DATE + INTERVAL '7 days')::INTEGER
  ),
  (
    'rh',
    'Formation Ressources Humaines',
    'Gestion des talents, recrutement moderne et developpement organisationnel. Transformez votre departement RH avec les meilleures pratiques actuelles.',
    CURRENT_DATE + INTERVAL '7 days',
    18,
    0,
    'both',
    TRUE,
    EXTRACT(WEEK FROM CURRENT_DATE + INTERVAL '7 days')::INTEGER
  );

-- Verify the insert
SELECT id, slug, titre, max_attendees, current_attendees, is_active, week_number
FROM formations
ORDER BY slug;
