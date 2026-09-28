export type BookingStatus = 'confirmed' | 'cancelled' | 'completed' | 'no_show';

export interface Staff {
  id: string;
  name: string;
  photo_url?: string | null;
  active: boolean;
  created_at?: string;
}

export interface StaffWorkingHours {
  id?: string;
  staff_id: string;
  day_of_week: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  is_open: boolean;
  start_time: string; // '09:00:00' or '09:00'
  end_time: string;   // '18:00:00' or '18:00'
}

export interface StaffWithHours extends Staff {
  working_hours: StaffWorkingHours[];
}

export interface Service {
  id: string;
  name: string;
  duration_minutes: number;
  price_gbp: number;
  description?: string | null;
  active: boolean;
  created_at?: string;
}

export interface BookingSettings {
  id?: string;
  buffer_minutes: number;
  min_advance_hours: number;
  max_advance_days: number;
  auto_confirm: boolean;
  notification_email: string;
  shop_phone: string;
  shop_address: string;
  created_at?: string;
  updated_at?: string;
}

export interface Booking {
  id: string;
  service_id: string;
  staff_id: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  notes?: string | null;
  start_time: string; // ISO string (UTC)
  end_time: string;   // ISO string (UTC)
  status: BookingStatus;
  reminder_sent?: boolean;
  created_at?: string;
  // Joined fields for display
  service?: Service;
  staff?: Staff;
}

export interface BlockedSlot {
  id: string;
  staff_id?: string | null; // null = all staff
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM:SS or HH:MM
  end_time: string;   // HH:MM:SS or HH:MM
  reason?: string | null;
  created_at?: string;
  staff?: Staff | null;
}

export interface AvailableSlot {
  startTime: string; // ISO string (UTC)
  endTime: string;   // ISO string (UTC)
  timeFormatted: string; // e.g., "09:00" or "09:00 AM" in Europe/London
  staffId: string;
  staffName: string;
  availableBarbers?: { id: string; name: string }[];
}

export interface CreateBookingRequest {
  service_id: string;
  staff_id: string; // Specific barber ID or "any"
  date: string;     // YYYY-MM-DD
  start_time: string; // ISO string or HH:MM
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  notes?: string;
}
