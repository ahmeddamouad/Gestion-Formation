-- Migration 004: WhatsApp Automation System
-- Adds location fields to formations, payment tracking to registrations, and notifications table

-- ===========================================
-- 1. Add location and visio fields to formations
-- ===========================================
ALTER TABLE formations ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE formations ADD COLUMN IF NOT EXISTS location_address TEXT;
ALTER TABLE formations ADD COLUMN IF NOT EXISTS location_maps_url TEXT;
ALTER TABLE formations ADD COLUMN IF NOT EXISTS visio_link TEXT;
ALTER TABLE formations ADD COLUMN IF NOT EXISTS whatsapp_group_link TEXT;

-- ===========================================
-- 2. Add payment tracking to registrations
-- ===========================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registrations' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE registrations ADD COLUMN payment_status TEXT DEFAULT 'pending';
    ALTER TABLE registrations ADD CONSTRAINT registrations_payment_status_check
      CHECK (payment_status IN ('pending', 'paid', 'refunded'));
  END IF;
END $$;

ALTER TABLE registrations ADD COLUMN IF NOT EXISTS payment_date TIMESTAMPTZ;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS payment_amount INTEGER;

-- ===========================================
-- 3. Create notifications table
-- ===========================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
  formation_id UUID REFERENCES formations(id) ON DELETE CASCADE,
  recipient_phone TEXT NOT NULL,
  recipient_name TEXT,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('payment_confirmation', 'reminder_24h', 'manual')),
  message_content TEXT NOT NULL,
  twilio_message_sid TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed', 'undelivered')),
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_notifications_registration_id ON notifications(registration_id);
CREATE INDEX IF NOT EXISTS idx_notifications_formation_id ON notifications(formation_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Index for reminder queries (find registrations needing reminders)
CREATE INDEX IF NOT EXISTS idx_registrations_payment_status ON registrations(payment_status);

-- ===========================================
-- 4. Enable RLS on notifications table
-- ===========================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can access notifications (admin operations)
CREATE POLICY "Service role full access to notifications" ON notifications
  FOR ALL
  USING (auth.role() = 'service_role');

-- ===========================================
-- 5. Helper function to get pending reminders
-- ===========================================
CREATE OR REPLACE FUNCTION get_pending_reminders()
RETURNS TABLE (
  registration_id UUID,
  formation_id UUID,
  recipient_phone TEXT,
  recipient_name TEXT,
  formation_titre TEXT,
  formation_date DATE,
  mode_choisi TEXT,
  location TEXT,
  location_address TEXT,
  location_maps_url TEXT,
  visio_link TEXT,
  whatsapp_group_link TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id AS registration_id,
    r.formation_id,
    r.telephone AS recipient_phone,
    CONCAT(r.prenom, ' ', r.nom) AS recipient_name,
    f.titre AS formation_titre,
    f.session_date AS formation_date,
    r.mode_choisi,
    f.location,
    f.location_address,
    f.location_maps_url,
    f.visio_link,
    f.whatsapp_group_link
  FROM registrations r
  JOIN formations f ON r.formation_id = f.id
  WHERE r.payment_status = 'paid'
    AND r.status = 'confirmed'
    AND f.session_date = CURRENT_DATE + INTERVAL '1 day'
    AND NOT EXISTS (
      SELECT 1 FROM notifications n
      WHERE n.registration_id = r.id
        AND n.notification_type = 'reminder_24h'
        AND n.status IN ('sent', 'delivered', 'read')
    );
END;
$$;

-- ===========================================
-- 6. Function to log notification
-- ===========================================
CREATE OR REPLACE FUNCTION log_notification(
  p_registration_id UUID,
  p_formation_id UUID,
  p_recipient_phone TEXT,
  p_recipient_name TEXT,
  p_notification_type TEXT,
  p_message_content TEXT,
  p_twilio_message_sid TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'pending'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    registration_id,
    formation_id,
    recipient_phone,
    recipient_name,
    notification_type,
    message_content,
    twilio_message_sid,
    status,
    sent_at
  ) VALUES (
    p_registration_id,
    p_formation_id,
    p_recipient_phone,
    p_recipient_name,
    p_notification_type,
    p_message_content,
    p_twilio_message_sid,
    p_status,
    CASE WHEN p_status = 'sent' THEN NOW() ELSE NULL END
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$;

-- ===========================================
-- 7. Function to update notification status (for Twilio webhook)
-- ===========================================
CREATE OR REPLACE FUNCTION update_notification_status(
  p_twilio_message_sid TEXT,
  p_status TEXT,
  p_error_message TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE notifications
  SET
    status = p_status,
    error_message = p_error_message,
    delivered_at = CASE WHEN p_status IN ('delivered', 'read') THEN NOW() ELSE delivered_at END
  WHERE twilio_message_sid = p_twilio_message_sid;

  RETURN FOUND;
END;
$$;
