-- =========================================================
-- Fade & Co. Barbershop Seed Data
-- Pre-populates Staff, Working Hours, Services, and Settings
-- =========================================================

-- Clear existing data if necessary (for fresh development resets)
-- TRUNCATE TABLE bookings, blocked_slots, staff_working_hours, services, staff, booking_settings CASCADE;

-- 1. Default Booking Settings
INSERT INTO booking_settings (
  id,
  buffer_minutes,
  min_advance_hours,
  max_advance_days,
  auto_confirm,
  notification_email,
  shop_phone,
  shop_address
)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  10,
  1,
  30,
  true,
  'hello@fadeandco.com',
  '+44 7700 900123',
  '47 King Street, Manchester, UK'
)
ON CONFLICT (id) DO UPDATE SET
  buffer_minutes = EXCLUDED.buffer_minutes,
  min_advance_hours = EXCLUDED.min_advance_hours,
  max_advance_days = EXCLUDED.max_advance_days,
  auto_confirm = EXCLUDED.auto_confirm,
  notification_email = EXCLUDED.notification_email,
  shop_phone = EXCLUDED.shop_phone,
  shop_address = EXCLUDED.shop_address;

-- 2. Services
INSERT INTO services (id, name, duration_minutes, price_gbp, description, active) VALUES
  ('22222222-2222-2222-2222-222222220001', 'Classic Haircut', 30, 20.00, 'Precision scissor & clipper cut finished with styling and neck shave.', true),
  ('22222222-2222-2222-2222-222222220002', 'Skin Fade', 45, 25.00, 'Seamless skin fade with foil shaver, texture on top, and luxury styling product.', true),
  ('22222222-2222-2222-2222-222222220003', 'Beard Trim', 20, 12.00, 'Beard shaping, line-up, conditioning beard oil, and hot towel finish.', true),
  ('22222222-2222-2222-2222-222222220004', 'Haircut + Beard', 60, 32.00, 'Full grooming package: premium haircut or skin fade paired with comprehensive beard sculpt.', true),
  ('22222222-2222-2222-2222-222222220005', 'Hot Towel Shave', 30, 18.00, 'Traditional straight razor wet shave with essential oils and hot towel treatment.', true),
  ('22222222-2222-2222-2222-222222220006', 'Kids Cut (under 12)', 25, 15.00, 'Patient, tailored haircut and styling for young gentlemen under 12.', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  duration_minutes = EXCLUDED.duration_minutes,
  price_gbp = EXCLUDED.price_gbp,
  description = EXCLUDED.description,
  active = EXCLUDED.active;

-- 3. Staff Members (Marcus, Jay, Tariq)
INSERT INTO staff (id, name, photo_url, active) VALUES
  ('33333333-3333-3333-3333-333333330001', 'Marcus', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', true),
  ('33333333-3333-3333-3333-333333330002', 'Jay', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', true),
  ('33333333-3333-3333-3333-333333330003', 'Tariq', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  photo_url = EXCLUDED.photo_url,
  active = EXCLUDED.active;

-- 4. Staff Working Hours
-- Day of week: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday

-- Marcus: Monday–Saturday, 9am–6pm, closed Sunday
DELETE FROM staff_working_hours WHERE staff_id = '33333333-3333-3333-3333-333333330001';
INSERT INTO staff_working_hours (staff_id, day_of_week, is_open, start_time, end_time) VALUES
  ('33333333-3333-3333-3333-333333330001', 0, false, '09:00:00', '18:00:00'), -- Sun: Closed
  ('33333333-3333-3333-3333-333333330001', 1, true,  '09:00:00', '18:00:00'), -- Mon: 9am-6pm
  ('33333333-3333-3333-3333-333333330001', 2, true,  '09:00:00', '18:00:00'), -- Tue: 9am-6pm
  ('33333333-3333-3333-3333-333333330001', 3, true,  '09:00:00', '18:00:00'), -- Wed: 9am-6pm
  ('33333333-3333-3333-3333-333333330001', 4, true,  '09:00:00', '18:00:00'), -- Thu: 9am-6pm
  ('33333333-3333-3333-3333-333333330001', 5, true,  '09:00:00', '18:00:00'), -- Fri: 9am-6pm
  ('33333333-3333-3333-3333-333333330001', 6, true,  '09:00:00', '18:00:00'); -- Sat: 9am-6pm

-- Jay: Tuesday–Sunday, 10am–7pm, closed Monday
DELETE FROM staff_working_hours WHERE staff_id = '33333333-3333-3333-3333-333333330002';
INSERT INTO staff_working_hours (staff_id, day_of_week, is_open, start_time, end_time) VALUES
  ('33333333-3333-3333-3333-333333330002', 0, true,  '10:00:00', '19:00:00'), -- Sun: 10am-7pm
  ('33333333-3333-3333-3333-333333330002', 1, false, '10:00:00', '19:00:00'), -- Mon: Closed
  ('33333333-3333-3333-3333-333333330002', 2, true,  '10:00:00', '19:00:00'), -- Tue: 10am-7pm
  ('33333333-3333-3333-3333-333333330002', 3, true,  '10:00:00', '19:00:00'), -- Wed: 10am-7pm
  ('33333333-3333-3333-3333-333333330002', 4, true,  '10:00:00', '19:00:00'), -- Thu: 10am-7pm
  ('33333333-3333-3333-3333-333333330002', 5, true,  '10:00:00', '19:00:00'), -- Fri: 10am-7pm
  ('33333333-3333-3333-3333-333333330002', 6, true,  '10:00:00', '19:00:00'); -- Sat: 10am-7pm

-- Tariq: Wednesday–Sunday, 11am–8pm, closed Monday and Tuesday
DELETE FROM staff_working_hours WHERE staff_id = '33333333-3333-3333-3333-333333330003';
INSERT INTO staff_working_hours (staff_id, day_of_week, is_open, start_time, end_time) VALUES
  ('33333333-3333-3333-3333-333333330003', 0, true,  '11:00:00', '20:00:00'), -- Sun: 11am-8pm
  ('33333333-3333-3333-3333-333333330003', 1, false, '11:00:00', '20:00:00'), -- Mon: Closed
  ('33333333-3333-3333-3333-333333330003', 2, false, '11:00:00', '20:00:00'), -- Tue: Closed
  ('33333333-3333-3333-3333-333333330003', 3, true,  '11:00:00', '20:00:00'), -- Wed: 11am-8pm
  ('33333333-3333-3333-3333-333333330003', 4, true,  '11:00:00', '20:00:00'), -- Thu: 11am-8pm
  ('33333333-3333-3333-3333-333333330003', 5, true,  '11:00:00', '20:00:00'), -- Fri: 11am-8pm
  ('33333333-3333-3333-3333-333333330003', 6, true,  '11:00:00', '20:00:00'); -- Sat: 11am-8pm
