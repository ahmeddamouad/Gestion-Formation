-- Migration: Add formation details and pack registrations
-- Run this in your Supabase SQL editor

-- ============================================
-- ADD DETAIL COLUMNS TO FORMATIONS
-- ============================================
ALTER TABLE formations ADD COLUMN IF NOT EXISTS programme TEXT[];
ALTER TABLE formations ADD COLUMN IF NOT EXISTS objectifs TEXT[];
ALTER TABLE formations ADD COLUMN IF NOT EXISTS prerequis TEXT;
ALTER TABLE formations ADD COLUMN IF NOT EXISTS duree TEXT;
ALTER TABLE formations ADD COLUMN IF NOT EXISTS prix INTEGER DEFAULT 0;

-- ============================================
-- PACK REGISTRATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS pack_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_ids UUID[] NOT NULL,
  discount_percent INTEGER NOT NULL DEFAULT 0,
  total_original INTEGER NOT NULL,
  total_final INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for querying by date
CREATE INDEX IF NOT EXISTS idx_pack_registrations_created ON pack_registrations(created_at DESC);

-- RLS for pack_registrations
ALTER TABLE pack_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pack_registrations_service_all" ON pack_registrations;
CREATE POLICY "pack_registrations_service_all" ON pack_registrations
  FOR ALL TO service_role
  USING (TRUE) WITH CHECK (TRUE);

-- ============================================
-- UPDATE FORMATIONS WITH DETAILS
-- ============================================

-- Power BI Formation
UPDATE formations SET
  programme = ARRAY[
    'Introduction a Power BI et son ecosysteme',
    'Connexion aux sources de donnees (Excel, SQL, API)',
    'Transformation des donnees avec Power Query',
    'Modelisation des donnees et relations',
    'Creation de visualisations interactives',
    'Mesures DAX et calculs avances',
    'Tableaux de bord et rapports professionnels',
    'Publication et partage sur Power BI Service'
  ],
  objectifs = ARRAY[
    'Maitriser l''interface et les fonctionnalites de Power BI Desktop',
    'Creer des rapports interactifs et des tableaux de bord',
    'Analyser et transformer des donnees complexes',
    'Automatiser les mises a jour de donnees'
  ],
  prerequis = 'Connaissance de base d''Excel. Aucune experience en programmation requise.',
  duree = '2 jours (14 heures)',
  prix = 2500
WHERE slug = 'powerbi';

-- Digital Marketing Formation
UPDATE formations SET
  programme = ARRAY[
    'Fondamentaux du marketing digital',
    'Strategie de contenu et storytelling',
    'Referencement naturel (SEO) et payant (SEA)',
    'Publicite sur les reseaux sociaux (Meta, LinkedIn)',
    'Email marketing et automation',
    'Google Analytics et mesure de performance',
    'Creation de landing pages efficaces',
    'Gestion de campagnes et budget publicitaire'
  ],
  objectifs = ARRAY[
    'Elaborer une strategie marketing digital complete',
    'Maitriser les outils de publicite en ligne',
    'Optimiser le referencement de votre site web',
    'Mesurer et analyser les performances de vos campagnes'
  ],
  prerequis = 'Aucun prerequis technique. Motivation et curiosite recommandees.',
  duree = '3 jours (21 heures)',
  prix = 3500
WHERE slug = 'marketing';

-- Automatisation & Fullstack Formation
UPDATE formations SET
  programme = ARRAY[
    'Introduction a l''automatisation et aux workflows',
    'Power Automate et Microsoft 365',
    'Zapier et integration d''applications',
    'Bases du developpement web (HTML, CSS, JavaScript)',
    'Introduction a React et Next.js',
    'API REST et integration de services',
    'Deploiement et hebergement d''applications',
    'Projet pratique: creation d''une application complete'
  ],
  objectifs = ARRAY[
    'Automatiser les taches repetitives du quotidien',
    'Comprendre les bases du developpement web moderne',
    'Creer des applications web fonctionnelles',
    'Integrer differents services et API'
  ],
  prerequis = 'Logique de base et aisance avec les outils informatiques.',
  duree = '5 jours (35 heures)',
  prix = 5500
WHERE slug = 'automatisation';

-- Ressources Humaines Formation
UPDATE formations SET
  programme = ARRAY[
    'Evolution du role RH a l''ere digitale',
    'Outils SIRH et gestion des talents',
    'Recrutement digital et marque employeur',
    'Gestion de la paie et obligations legales',
    'Formation et developpement des competences',
    'Communication interne et engagement',
    'Indicateurs RH et tableaux de bord',
    'Bien-etre au travail et QVT'
  ],
  objectifs = ARRAY[
    'Maitriser les outils RH modernes',
    'Optimiser les processus de recrutement',
    'Gerer efficacement la paie et l''administration',
    'Developper une culture d''entreprise positive'
  ],
  prerequis = 'Experience en RH appreciee mais non obligatoire.',
  duree = '3 jours (21 heures)',
  prix = 3000
WHERE slug = 'rh';

-- ============================================
-- CHECK_AND_REGISTER_PACK RPC FUNCTION
-- Registers multiple formations at once with discount
-- ============================================
CREATE OR REPLACE FUNCTION check_and_register_pack(
  p_formation_ids UUID[],
  p_nom TEXT,
  p_prenom TEXT,
  p_email TEXT,
  p_telephone TEXT,
  p_entreprise TEXT DEFAULT NULL,
  p_modes_choisis TEXT[] DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_formation_id UUID;
  v_registration_result JSONB;
  v_registration_ids UUID[] := ARRAY[]::UUID[];
  v_failed_formations TEXT[] := ARRAY[]::TEXT[];
  v_total_original INTEGER := 0;
  v_discount_percent INTEGER := 0;
  v_total_final INTEGER;
  v_pack_id UUID;
  v_mode TEXT;
  v_idx INTEGER := 1;
  v_formation RECORD;
BEGIN
  -- Validate input
  IF array_length(p_formation_ids, 1) IS NULL OR array_length(p_formation_ids, 1) = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'no_formations',
      'message', 'Aucune formation selectionnee'
    );
  END IF;

  -- Calculate discount based on number of formations
  IF array_length(p_formation_ids, 1) = 2 THEN
    v_discount_percent := 10;
  ELSIF array_length(p_formation_ids, 1) = 3 THEN
    v_discount_percent := 15;
  ELSIF array_length(p_formation_ids, 1) >= 4 THEN
    v_discount_percent := 20;
  END IF;

  -- Register for each formation
  FOREACH v_formation_id IN ARRAY p_formation_ids
  LOOP
    -- Get formation price
    SELECT prix INTO v_formation FROM formations WHERE id = v_formation_id;
    v_total_original := v_total_original + COALESCE(v_formation.prix, 0);

    -- Determine mode for this formation
    IF p_modes_choisis IS NOT NULL AND v_idx <= array_length(p_modes_choisis, 1) THEN
      v_mode := p_modes_choisis[v_idx];
    ELSE
      v_mode := 'presentiel';
    END IF;

    -- Call existing check_and_register function
    v_registration_result := check_and_register(
      v_formation_id,
      p_nom,
      p_prenom,
      p_email,
      p_telephone,
      p_entreprise,
      v_mode
    );

    IF (v_registration_result->>'success')::boolean THEN
      v_registration_ids := array_append(v_registration_ids, (v_registration_result->>'registration_id')::UUID);
    ELSE
      v_failed_formations := array_append(v_failed_formations, v_registration_result->>'formation_titre');
    END IF;

    v_idx := v_idx + 1;
  END LOOP;

  -- Calculate final price with discount
  v_total_final := v_total_original - (v_total_original * v_discount_percent / 100);

  -- Create pack registration record if at least one succeeded
  IF array_length(v_registration_ids, 1) > 0 THEN
    INSERT INTO pack_registrations (
      registration_ids,
      discount_percent,
      total_original,
      total_final
    ) VALUES (
      v_registration_ids,
      v_discount_percent,
      v_total_original,
      v_total_final
    )
    RETURNING id INTO v_pack_id;
  END IF;

  -- Return result
  RETURN jsonb_build_object(
    'success', array_length(v_registration_ids, 1) > 0,
    'pack_id', v_pack_id,
    'registration_ids', v_registration_ids,
    'failed_formations', v_failed_formations,
    'discount_percent', v_discount_percent,
    'total_original', v_total_original,
    'total_final', v_total_final,
    'registrations_count', array_length(v_registration_ids, 1)
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'server_error',
      'message', 'Une erreur est survenue. Veuillez reessayer.'
    );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION check_and_register_pack TO anon, authenticated, service_role;
