-- Supabase Migration: Initial Schema
-- Description: Creates tables for formations and registrations management

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- FORMATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS formations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  titre TEXT NOT NULL,
  description TEXT NOT NULL,
  session_date DATE NOT NULL,
  max_attendees INTEGER NOT NULL DEFAULT 20,
  current_attendees INTEGER NOT NULL DEFAULT 0,
  mode TEXT NOT NULL DEFAULT 'both' CHECK (mode IN ('presentiel', 'visio', 'both')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  week_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraint: current cannot be negative
  CONSTRAINT attendees_check CHECK (current_attendees >= 0)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_formations_active ON formations(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_formations_slug ON formations(slug);

-- ============================================
-- REGISTRATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  formation_id UUID NOT NULL REFERENCES formations(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  email TEXT NOT NULL,
  telephone TEXT NOT NULL,
  entreprise TEXT,
  mode_choisi TEXT NOT NULL CHECK (mode_choisi IN ('presentiel', 'visio')),
  is_preregistration BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate registrations for the same email and formation
  CONSTRAINT unique_registration UNIQUE (formation_id, email)
);

-- Indexes for queries
CREATE INDEX IF NOT EXISTS idx_registrations_formation ON registrations(formation_id);
CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_created ON registrations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_registrations_preregistration ON registrations(is_preregistration) WHERE is_preregistration = TRUE;

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS formations_updated_at ON formations;
CREATE TRIGGER formations_updated_at
  BEFORE UPDATE ON formations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- CHECK_AND_REGISTER RPC FUNCTION
-- Atomically checks capacity and registers a user
-- ============================================
CREATE OR REPLACE FUNCTION check_and_register(
  p_formation_id UUID,
  p_nom TEXT,
  p_prenom TEXT,
  p_email TEXT,
  p_telephone TEXT,
  p_entreprise TEXT DEFAULT NULL,
  p_mode_choisi TEXT DEFAULT 'presentiel'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_formation RECORD;
  v_registration_id UUID;
  v_is_preregistration BOOLEAN := FALSE;
  v_existing_registration UUID;
BEGIN
  -- Validate mode
  IF p_mode_choisi NOT IN ('presentiel', 'visio') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'invalid_mode',
      'message', 'Le mode choisi doit etre "presentiel" ou "visio"'
    );
  END IF;

  -- Check for existing registration
  SELECT id INTO v_existing_registration
  FROM registrations
  WHERE formation_id = p_formation_id
    AND email = LOWER(TRIM(p_email))
    AND status != 'cancelled';

  IF FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'already_registered',
      'message', 'Vous etes deja inscrit(e) a cette formation'
    );
  END IF;

  -- Lock and fetch the formation row to prevent race conditions
  SELECT * INTO v_formation
  FROM formations
  WHERE id = p_formation_id AND is_active = TRUE
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'formation_not_found',
      'message', 'Cette formation n''est pas disponible'
    );
  END IF;

  -- Determine if this is a pre-registration (session is full)
  IF v_formation.current_attendees >= v_formation.max_attendees THEN
    v_is_preregistration := TRUE;
  ELSE
    -- Increment attendee count atomically
    UPDATE formations
    SET current_attendees = current_attendees + 1
    WHERE id = p_formation_id;
  END IF;

  -- Insert the registration
  INSERT INTO registrations (
    formation_id,
    nom,
    prenom,
    email,
    telephone,
    entreprise,
    mode_choisi,
    is_preregistration,
    status
  ) VALUES (
    p_formation_id,
    TRIM(p_nom),
    TRIM(p_prenom),
    LOWER(TRIM(p_email)),
    TRIM(p_telephone),
    NULLIF(TRIM(p_entreprise), ''),
    p_mode_choisi,
    v_is_preregistration,
    'confirmed'
  )
  RETURNING id INTO v_registration_id;

  -- Return success with details
  RETURN jsonb_build_object(
    'success', true,
    'registration_id', v_registration_id,
    'is_preregistration', v_is_preregistration,
    'formation_titre', v_formation.titre,
    'spots_remaining', GREATEST(0,
      v_formation.max_attendees - v_formation.current_attendees -
      CASE WHEN v_is_preregistration THEN 0 ELSE 1 END
    )
  );

EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'already_registered',
      'message', 'Vous etes deja inscrit(e) a cette formation'
    );
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'server_error',
      'message', 'Une erreur est survenue. Veuillez reessayer.'
    );
END;
$$;

-- ============================================
-- CANCEL REGISTRATION FUNCTION
-- Cancels a registration and decrements count if needed
-- ============================================
CREATE OR REPLACE FUNCTION cancel_registration(
  p_registration_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_registration RECORD;
BEGIN
  -- Lock and fetch the registration
  SELECT r.*, f.titre as formation_titre
  INTO v_registration
  FROM registrations r
  JOIN formations f ON r.formation_id = f.id
  WHERE r.id = p_registration_id
  FOR UPDATE OF r;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'not_found',
      'message', 'Inscription non trouvee'
    );
  END IF;

  IF v_registration.status = 'cancelled' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'already_cancelled',
      'message', 'Cette inscription est deja annulee'
    );
  END IF;

  -- If not a pre-registration, decrement the count
  IF NOT v_registration.is_preregistration AND v_registration.status = 'confirmed' THEN
    UPDATE formations
    SET current_attendees = GREATEST(0, current_attendees - 1)
    WHERE id = v_registration.formation_id;
  END IF;

  -- Update status to cancelled
  UPDATE registrations
  SET status = 'cancelled'
  WHERE id = p_registration_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Inscription annulee avec succes'
  );
END;
$$;

-- ============================================
-- GET DASHBOARD STATS FUNCTION
-- Returns aggregated statistics for admin dashboard
-- ============================================
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_registrations INTEGER;
  v_weekly_registrations INTEGER;
  v_full_sessions INTEGER;
  v_pending_preregistrations INTEGER;
BEGIN
  -- Total confirmed registrations
  SELECT COUNT(*) INTO v_total_registrations
  FROM registrations
  WHERE status = 'confirmed';

  -- Registrations this week
  SELECT COUNT(*) INTO v_weekly_registrations
  FROM registrations
  WHERE status = 'confirmed'
    AND created_at >= date_trunc('week', CURRENT_DATE);

  -- Full sessions (where current >= max)
  SELECT COUNT(*) INTO v_full_sessions
  FROM formations
  WHERE is_active = TRUE
    AND current_attendees >= max_attendees;

  -- Pending pre-registrations
  SELECT COUNT(*) INTO v_pending_preregistrations
  FROM registrations
  WHERE is_preregistration = TRUE
    AND status = 'confirmed';

  RETURN jsonb_build_object(
    'total_registrations', COALESCE(v_total_registrations, 0),
    'weekly_registrations', COALESCE(v_weekly_registrations, 0),
    'full_sessions', COALESCE(v_full_sessions, 0),
    'pending_preregistrations', COALESCE(v_pending_preregistrations, 0)
  );
END;
$$;

-- ============================================
-- UPDATE FORMATION CAPACITY FUNCTION
-- Updates max_attendees for a formation
-- ============================================
CREATE OR REPLACE FUNCTION update_formation_capacity(
  p_formation_id UUID,
  p_max_attendees INTEGER
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_max_attendees < 1 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'invalid_capacity',
      'message', 'La capacite doit etre au moins 1'
    );
  END IF;

  UPDATE formations
  SET max_attendees = p_max_attendees
  WHERE id = p_formation_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'not_found',
      'message', 'Formation non trouvee'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Capacite mise a jour'
  );
END;
$$;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE formations ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Public read access to active formations (for landing page)
DROP POLICY IF EXISTS "formations_public_read" ON formations;
CREATE POLICY "formations_public_read" ON formations
  FOR SELECT
  TO anon, authenticated
  USING (is_active = TRUE);

-- Service role has full access to formations
DROP POLICY IF EXISTS "formations_service_all" ON formations;
CREATE POLICY "formations_service_all" ON formations
  FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- Service role has full access to registrations
DROP POLICY IF EXISTS "registrations_service_all" ON registrations;
CREATE POLICY "registrations_service_all" ON registrations
  FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION check_and_register TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_dashboard_stats TO service_role;
GRANT EXECUTE ON FUNCTION cancel_registration TO service_role;
GRANT EXECUTE ON FUNCTION update_formation_capacity TO service_role;
