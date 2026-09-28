-- =========================================================
-- Fade & Co. Barbershop Database Schema
-- Supabase PostgreSQL Schema
-- =========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Staff Table
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  photo_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Staff Working Hours
-- day_of_week: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
CREATE TABLE IF NOT EXISTS staff_working_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  is_open BOOLEAN NOT NULL DEFAULT false,
  start_time TIME NOT NULL DEFAULT '09:00:00',
  end_time TIME NOT NULL DEFAULT '18:00:00',
  UNIQUE (staff_id, day_of_week)
);

-- 3. Services Table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  price_gbp NUMERIC(10, 2) NOT NULL CHECK (price_gbp >= 0),
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Booking Settings Table (Single Row Configuration)
CREATE TABLE IF NOT EXISTS booking_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buffer_minutes INTEGER NOT NULL DEFAULT 10 CHECK (buffer_minutes >= 0),
  min_advance_hours INTEGER NOT NULL DEFAULT 1 CHECK (min_advance_hours >= 0),
  max_advance_days INTEGER NOT NULL DEFAULT 30 CHECK (max_advance_days >= 1),
  auto_confirm BOOLEAN NOT NULL DEFAULT true,
  notification_email TEXT NOT NULL DEFAULT 'hello@fadeandco.com',
  shop_phone TEXT NOT NULL DEFAULT '+44 7700 900123',
  shop_address TEXT NOT NULL DEFAULT '47 King Street, Manchester, UK',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Bookings Table
-- Status enum check: 'confirmed', 'cancelled', 'completed', 'no_show'
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE RESTRICT,
  customer_first_name TEXT NOT NULL,
  customer_last_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  notes TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed', 'no_show')),
  reminder_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Blocked Slots Table
-- staff_id is nullable (null means entire shop / all staff are blocked)
CREATE TABLE IF NOT EXISTS blocked_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- Indexes for High-Performance Queries
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_bookings_staff_time ON bookings (staff_id, start_time, end_time) WHERE status = 'confirmed';
CREATE INDEX IF NOT EXISTS idx_bookings_time_range ON bookings (start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings (status);
CREATE INDEX IF NOT EXISTS idx_blocked_slots_date ON blocked_slots (date);
CREATE INDEX IF NOT EXISTS idx_staff_working_hours_staff ON staff_working_hours (staff_id);

-- =========================================================
-- Double Booking Prevention & Concurrency Safe Booking RPC
-- =========================================================
CREATE OR REPLACE FUNCTION create_booking_safe(
  p_service_id UUID,
  p_staff_id UUID,
  p_customer_first_name TEXT,
  p_customer_last_name TEXT,
  p_customer_email TEXT,
  p_customer_phone TEXT,
  p_notes TEXT,
  p_start_time TIMESTAMPTZ,
  p_end_time TIMESTAMPTZ,
  p_status TEXT DEFAULT 'confirmed'
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_conflict_count INTEGER;
  v_new_booking_id UUID;
  v_result JSONB;
BEGIN
  -- Lock conflicting bookings table range for the staff member
  PERFORM 1 FROM staff WHERE id = p_staff_id FOR UPDATE;

  -- Check for overlap with any existing confirmed bookings
  SELECT COUNT(*)
  INTO v_conflict_count
  FROM bookings
  WHERE staff_id = p_staff_id
    AND status = 'confirmed'
    AND (
      (start_time < p_end_time AND end_time > p_start_time)
    );

  IF v_conflict_count > 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Slot is already booked for this barber. Please choose another time.'
    );
  END IF;

  -- Insert booking
  INSERT INTO bookings (
    service_id,
    staff_id,
    customer_first_name,
    customer_last_name,
    customer_email,
    customer_phone,
    notes,
    start_time,
    end_time,
    status
  )
  VALUES (
    p_service_id,
    p_staff_id,
    p_customer_first_name,
    p_customer_last_name,
    p_customer_email,
    p_customer_phone,
    p_notes,
    p_start_time,
    p_end_time,
    p_status
  )
  RETURNING id INTO v_new_booking_id;

  SELECT row_to_json(b)::jsonb
  INTO v_result
  FROM bookings b
  WHERE b.id = v_new_booking_id;

  RETURN jsonb_build_object(
    'success', true,
    'booking', v_result
  );
END;
$$;
