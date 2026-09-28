import { createAdminSupabaseClient } from './supabase/server';
import {
  Staff,
  StaffWithHours,
  StaffWorkingHours,
  Service,
  BookingSettings,
  Booking,
  BlockedSlot,
  BookingStatus,
} from './types';

// ============================================================================
// Default Seed Data (In-Memory Fallback when Supabase is not configured)
// ============================================================================
const initialSettings: BookingSettings = {
  id: '11111111-1111-1111-1111-111111111111',
  buffer_minutes: 10,
  min_advance_hours: 1,
  max_advance_days: 30,
  auto_confirm: true,
  notification_email: 'hello@fadeandco.com',
  shop_phone: '+44 7700 900123',
  shop_address: '47 King Street, Manchester, UK',
};

const initialStaff: Staff[] = [
  {
    id: '33333333-3333-3333-3333-333333330001',
    name: 'Marcus',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    active: true,
  },
  {
    id: '33333333-3333-3333-3333-333333330002',
    name: 'Jay',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    active: true,
  },
  {
    id: '33333333-3333-3333-3333-333333330003',
    name: 'Tariq',
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    active: true,
  },
];

// Marcus: Mon-Sat 9am-6pm (09:00:00 to 18:00:00), Sun closed
const marcusHours: StaffWorkingHours[] = [
  { staff_id: '33333333-3333-3333-3333-333333330001', day_of_week: 0, is_open: false, start_time: '09:00:00', end_time: '18:00:00' },
  { staff_id: '33333333-3333-3333-3333-333333330001', day_of_week: 1, is_open: true,  start_time: '09:00:00', end_time: '18:00:00' },
  { staff_id: '33333333-3333-3333-3333-333333330001', day_of_week: 2, is_open: true,  start_time: '09:00:00', end_time: '18:00:00' },
  { staff_id: '33333333-3333-3333-3333-333333330001', day_of_week: 3, is_open: true,  start_time: '09:00:00', end_time: '18:00:00' },
  { staff_id: '33333333-3333-3333-3333-333333330001', day_of_week: 4, is_open: true,  start_time: '09:00:00', end_time: '18:00:00' },
  { staff_id: '33333333-3333-3333-3333-333333330001', day_of_week: 5, is_open: true,  start_time: '09:00:00', end_time: '18:00:00' },
  { staff_id: '33333333-3333-3333-3333-333333330001', day_of_week: 6, is_open: true,  start_time: '09:00:00', end_time: '18:00:00' },
];

// Jay: Tue-Sun 10am-7pm (10:00:00 to 19:00:00), Mon closed
const jayHours: StaffWorkingHours[] = [
  { staff_id: '33333333-3333-3333-3333-333333330002', day_of_week: 0, is_open: true,  start_time: '10:00:00', end_time: '19:00:00' },
  { staff_id: '33333333-3333-3333-3333-333333330002', day_of_week: 1, is_open: false, start_time: '10:00:00', end_time: '19:00:00' },
  { staff_id: '33333333-3333-3333-3333-333333330002', day_of_week: 2, is_open: true,  start_time: '10:00:00', end_time: '19:00:00' },
  { staff_id: '33333333-3333-3333-3333-333333330002', day_of_week: 3, is_open: true,  start_time: '10:00:00', end_time: '19:00:00' },
  { staff_id: '33333333-3333-3333-3333-333333330002', day_of_week: 4, is_open: true,  start_time: '10:00:00', end_time: '19:00:00' },
  { staff_id: '33333333-3333-3333-3333-333333330002', day_of_week: 5, is_open: true,  start_time: '10:00:00', end_time: '19:00:00' },
  { staff_id: '33333333-3333-3333-3333-333333330002', day_of_week: 6, is_open: true,  start_time: '10:00:00', end_time: '19:00:00' },
];

// Tariq: Wed-Sun 11am-8pm (11:00:00 to 20:00:00), Mon & Tue closed
const tariqHours: StaffWorkingHours[] = [
  { staff_id: '33333333-3333-3333-3333-333333330003', day_of_week: 0, is_open: true,  start_time: '11:00:00', end_time: '20:00:00' },
  { staff_id: '33333333-3333-3333-3333-333333330003', day_of_week: 1, is_open: false, start_time: '11:00:00', end_time: '20:00:00' },
  { staff_id: '33333333-3333-3333-3333-333333330003', day_of_week: 2, is_open: false, start_time: '11:00:00', end_time: '20:00:00' },
  { staff_id: '33333333-3333-3333-3333-333333330003', day_of_week: 3, is_open: true,  start_time: '11:00:00', end_time: '20:00:00' },
  { staff_id: '33333333-3333-3333-3333-333333330003', day_of_week: 4, is_open: true,  start_time: '11:00:00', end_time: '20:00:00' },
  { staff_id: '33333333-3333-3333-3333-333333330003', day_of_week: 5, is_open: true,  start_time: '11:00:00', end_time: '20:00:00' },
  { staff_id: '33333333-3333-3333-3333-333333330003', day_of_week: 6, is_open: true,  start_time: '11:00:00', end_time: '20:00:00' },
];

const initialServices: Service[] = [
  {
    id: '22222222-2222-2222-2222-222222220001',
    name: 'Classic Haircut',
    duration_minutes: 30,
    price_gbp: 20,
    description: 'Precision scissor & clipper cut finished with styling and neck shave.',
    active: true,
  },
  {
    id: '22222222-2222-2222-2222-222222220002',
    name: 'Skin Fade',
    duration_minutes: 45,
    price_gbp: 25,
    description: 'Seamless skin fade with foil shaver, texture on top, and luxury styling product.',
    active: true,
  },
  {
    id: '22222222-2222-2222-2222-222222220003',
    name: 'Beard Trim',
    duration_minutes: 20,
    price_gbp: 12,
    description: 'Beard shaping, line-up, conditioning beard oil, and hot towel finish.',
    active: true,
  },
  {
    id: '22222222-2222-2222-2222-222222220004',
    name: 'Haircut + Beard',
    duration_minutes: 60,
    price_gbp: 32,
    description: 'Full grooming package: premium haircut or skin fade paired with comprehensive beard sculpt.',
    active: true,
  },
  {
    id: '22222222-2222-2222-2222-222222220005',
    name: 'Hot Towel Shave',
    duration_minutes: 30,
    price_gbp: 18,
    description: 'Traditional straight razor wet shave with essential oils and hot towel treatment.',
    active: true,
  },
  {
    id: '22222222-2222-2222-2222-222222220006',
    name: 'Kids Cut (under 12)',
    duration_minutes: 25,
    price_gbp: 15,
    description: 'Patient, tailored haircut and styling for young gentlemen under 12.',
    active: true,
  },
];

// Global in-memory mock store for instant local development without DB setup
const mockStore = {
  settings: { ...initialSettings },
  staff: [...initialStaff],
  workingHours: [...marcusHours, ...jayHours, ...tariqHours],
  services: [...initialServices],
  bookings: [] as Booking[],
  blockedSlots: [] as BlockedSlot[],
};

// ============================================================================
// Database API Layer
// ============================================================================

// 1. Services
export async function getActiveServices(): Promise<Service[]> {
  const supabase = createAdminSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('active', true)
      .order('price_gbp', { ascending: true });
    if (!error && data) return data;
  }
  return mockStore.services.filter((s) => s.active);
}

export async function getAllServices(): Promise<Service[]> {
  const supabase = createAdminSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) return data;
  }
  return [...mockStore.services];
}

export async function getServiceById(id: string): Promise<Service | null> {
  const supabase = createAdminSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();
    if (!error && data) return data;
  }
  return mockStore.services.find((s) => s.id === id) || null;
}

export async function createService(input: Omit<Service, 'id' | 'created_at'>): Promise<Service> {
  const supabase = createAdminSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('services')
      .insert([input])
      .select()
      .single();
    if (!error && data) return data;
  }
  const newService: Service = {
    ...input,
    id: `srv-${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  mockStore.services.push(newService);
  return newService;
}

export async function updateService(id: string, updates: Partial<Service>): Promise<Service | null> {
  const supabase = createAdminSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (!error && data) return data;
  }
  const index = mockStore.services.findIndex((s) => s.id === id);
  if (index !== -1) {
    mockStore.services[index] = { ...mockStore.services[index], ...updates };
    return mockStore.services[index];
  }
  return null;
}

// 2. Staff
export async function getActiveStaff(): Promise<Staff[]> {
  const supabase = createAdminSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('active', true)
      .order('name', { ascending: true });
    if (!error && data) return data;
  }
  return mockStore.staff.filter((s) => s.active);
}

export async function getAllStaff(): Promise<StaffWithHours[]> {
  const supabase = createAdminSupabaseClient();
  if (supabase) {
    const { data: staffList, error: sErr } = await supabase
      .from('staff')
      .select('*')
      .order('name', { ascending: true });
    if (!sErr && staffList) {
      const { data: hoursList } = await supabase.from('staff_working_hours').select('*');
      return staffList.map((st) => ({
        ...st,
        working_hours: (hoursList || []).filter((h) => h.staff_id === st.id),
      }));
    }
  }
  return mockStore.staff.map((st) => ({
    ...st,
    working_hours: mockStore.workingHours.filter((h) => h.staff_id === st.id),
  }));
}

export async function getStaffById(id: string): Promise<StaffWithHours | null> {
  const supabase = createAdminSupabaseClient();
  if (supabase) {
    const { data: staff, error } = await supabase
      .from('staff')
      .select('*')
      .eq('id', id)
      .single();
    if (!error && staff) {
      const { data: hours } = await supabase
        .from('staff_working_hours')
        .select('*')
        .eq('staff_id', id);
      return { ...staff, working_hours: hours || [] };
    }
  }
  const found = mockStore.staff.find((s) => s.id === id);
  if (found) {
    return {
      ...found,
      working_hours: mockStore.workingHours.filter((h) => h.staff_id === id),
    };
  }
  return null;
}

export async function createStaff(
  staffInput: Omit<Staff, 'id' | 'created_at'>,
  hoursInput: Omit<StaffWorkingHours, 'id' | 'staff_id'>[]
): Promise<StaffWithHours> {
  const supabase = createAdminSupabaseClient();
  if (supabase) {
    const { data: createdStaff, error } = await supabase
      .from('staff')
      .insert([staffInput])
      .select()
      .single();
    if (!error && createdStaff) {
      const formattedHours = hoursInput.map((h) => ({ ...h, staff_id: createdStaff.id }));
      const { data: createdHours } = await supabase
        .from('staff_working_hours')
        .insert(formattedHours)
        .select();
      return { ...createdStaff, working_hours: createdHours || [] };
    }
  }
  const newStaff: Staff = {
    ...staffInput,
    id: `staff-${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  mockStore.staff.push(newStaff);
  const createdHours: StaffWorkingHours[] = hoursInput.map((h, i) => ({
    ...h,
    id: `wh-${Date.now()}-${i}`,
    staff_id: newStaff.id,
  }));
  mockStore.workingHours.push(...createdHours);
  return { ...newStaff, working_hours: createdHours };
}

export async function updateStaff(
  id: string,
  updates: Partial<Staff>,
  hours?: Omit<StaffWorkingHours, 'id' | 'staff_id'>[]
): Promise<StaffWithHours | null> {
  const supabase = createAdminSupabaseClient();
  if (supabase) {
    const { data: updatedStaff, error } = await supabase
      .from('staff')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (!error && updatedStaff) {
      if (hours && hours.length > 0) {
        await supabase.from('staff_working_hours').delete().eq('staff_id', id);
        const toInsert = hours.map((h) => ({ ...h, staff_id: id }));
        const { data: newHours } = await supabase
          .from('staff_working_hours')
          .insert(toInsert)
          .select();
        return { ...updatedStaff, working_hours: newHours || [] };
      }
      const { data: currentHours } = await supabase
        .from('staff_working_hours')
        .select('*')
        .eq('staff_id', id);
      return { ...updatedStaff, working_hours: currentHours || [] };
    }
  }
  const idx = mockStore.staff.findIndex((s) => s.id === id);
  if (idx !== -1) {
    mockStore.staff[idx] = { ...mockStore.staff[idx], ...updates };
    if (hours) {
      mockStore.workingHours = mockStore.workingHours.filter((h) => h.staff_id !== id);
      const newH = hours.map((h, i) => ({
        ...h,
        id: `wh-${Date.now()}-${i}`,
        staff_id: id,
      }));
      mockStore.workingHours.push(...newH);
    }
    return {
      ...mockStore.staff[idx],
      working_hours: mockStore.workingHours.filter((h) => h.staff_id === id),
    };
  }
  return null;
}

export async function getStaffWorkingHours(staffId: string): Promise<StaffWorkingHours[]> {
  const supabase = createAdminSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('staff_working_hours')
      .select('*')
      .eq('staff_id', staffId)
      .order('day_of_week', { ascending: true });
    if (!error && data) return data;
  }
  return mockStore.workingHours.filter((h) => h.staff_id === staffId);
}

// 3. Booking Settings
export async function getBookingSettings(): Promise<BookingSettings> {
  const supabase = createAdminSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('booking_settings')
      .select('*')
      .limit(1)
      .single();
    if (!error && data) return data;
  }
  return { ...mockStore.settings };
}

export async function updateBookingSettings(updates: Partial<BookingSettings>): Promise<BookingSettings> {
  const supabase = createAdminSupabaseClient();
  if (supabase) {
    const { data: existing } = await supabase.from('booking_settings').select('id').limit(1).single();
    if (existing) {
      const { data, error } = await supabase
        .from('booking_settings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();
      if (!error && data) return data;
    }
  }
  mockStore.settings = { ...mockStore.settings, ...updates };
  return { ...mockStore.settings };
}

// 4. Blocked Slots
export async function getBlockedSlots(dateStr?: string): Promise<BlockedSlot[]> {
  const supabase = createAdminSupabaseClient();
  if (supabase) {
    let query = supabase.from('blocked_slots').select('*, staff(*)').order('date', { ascending: true });
    if (dateStr) {
      query = query.eq('date', dateStr);
    }
    const { data, error } = await query;
    if (!error && data) return data;
  }
  let slots = [...mockStore.blockedSlots];
  if (dateStr) {
    slots = slots.filter((b) => b.date === dateStr);
  }
  return slots.map((s) => ({
    ...s,
    staff: s.staff_id ? mockStore.staff.find((st) => st.id === s.staff_id) || null : null,
  }));
}

export async function createBlockedSlot(
  input: Omit<BlockedSlot, 'id' | 'created_at' | 'staff'>
): Promise<BlockedSlot> {
  const supabase = createAdminSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('blocked_slots')
      .insert([input])
      .select('*, staff(*)')
      .single();
    if (!error && data) return data;
  }
  const newBlock: BlockedSlot = {
    ...input,
    id: `blk-${Date.now()}`,
    created_at: new Date().toISOString(),
    staff: input.staff_id ? mockStore.staff.find((s) => s.id === input.staff_id) || null : null,
  };
  mockStore.blockedSlots.push(newBlock);
  return newBlock;
}

export async function deleteBlockedSlot(id: string): Promise<boolean> {
  const supabase = createAdminSupabaseClient();
  if (supabase) {
    const { error } = await supabase.from('blocked_slots').delete().eq('id', id);
    if (!error) return true;
  }
  const idx = mockStore.blockedSlots.findIndex((b) => b.id === id);
  if (idx !== -1) {
    mockStore.blockedSlots.splice(idx, 1);
    return true;
  }
  return false;
}

// 5. Bookings
export async function getBookings(options?: {
  staffId?: string;
  status?: BookingStatus;
  startDate?: string;
  endDate?: string;
}): Promise<Booking[]> {
  const supabase = createAdminSupabaseClient();
  if (supabase) {
    let query = supabase
      .from('bookings')
      .select('*, service:services(*), staff:staff(*)')
      .order('start_time', { ascending: false });

    if (options?.staffId) query = query.eq('staff_id', options.staffId);
    if (options?.status) query = query.eq('status', options.status);
    if (options?.startDate) query = query.gte('start_time', options.startDate);
    if (options?.endDate) query = query.lte('end_time', options.endDate);

    const { data, error } = await query;
    if (!error && data) return data;
  }

  let list = [...mockStore.bookings];
  if (options?.staffId) list = list.filter((b) => b.staff_id === options.staffId);
  if (options?.status) list = list.filter((b) => b.status === options.status);
  if (options?.startDate) {
    const startMs = new Date(options.startDate).getTime();
    list = list.filter((b) => new Date(b.start_time).getTime() >= startMs);
  }
  if (options?.endDate) {
    const endMs = new Date(options.endDate).getTime();
    list = list.filter((b) => new Date(b.end_time).getTime() <= endMs);
  }

  // Populate joined entities
  return list
    .map((b) => ({
      ...b,
      service: mockStore.services.find((s) => s.id === b.service_id),
      staff: mockStore.staff.find((s) => s.id === b.staff_id),
    }))
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
}

export async function getBookingById(id: string): Promise<Booking | null> {
  const supabase = createAdminSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, service:services(*), staff:staff(*)')
      .eq('id', id)
      .single();
    if (!error && data) return data;
  }

  const found = mockStore.bookings.find((b) => b.id === id);
  if (found) {
    return {
      ...found,
      service: mockStore.services.find((s) => s.id === found.service_id),
      staff: mockStore.staff.find((s) => s.id === found.staff_id),
    };
  }
  return null;
}

export async function getConfirmedBookingsForRange(
  staffId: string,
  rangeStartISO: string,
  rangeEndISO: string
): Promise<Booking[]> {
  const supabase = createAdminSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('staff_id', staffId)
      .eq('status', 'confirmed')
      .lt('start_time', rangeEndISO)
      .gt('end_time', rangeStartISO);
    if (!error && data) return data;
  }

  const rStart = new Date(rangeStartISO).getTime();
  const rEnd = new Date(rangeEndISO).getTime();

  return mockStore.bookings.filter(
    (b) =>
      b.staff_id === staffId &&
      b.status === 'confirmed' &&
      new Date(b.start_time).getTime() < rEnd &&
      new Date(b.end_time).getTime() > rStart
  );
}

export async function createBookingSafe(
  input: Omit<Booking, 'id' | 'created_at' | 'service' | 'staff'>
): Promise<{ success: boolean; booking?: Booking; error?: string }> {
  const supabase = createAdminSupabaseClient();

  if (supabase) {
    // Call the PostgreSQL safe booking function with concurrency lock
    const { data, error } = await supabase.rpc('create_booking_safe', {
      p_service_id: input.service_id,
      p_staff_id: input.staff_id,
      p_customer_first_name: input.customer_first_name,
      p_customer_last_name: input.customer_last_name,
      p_customer_email: input.customer_email,
      p_customer_phone: input.customer_phone,
      p_notes: input.notes || null,
      p_start_time: input.start_time,
      p_end_time: input.end_time,
      p_status: input.status || 'confirmed',
    });

    if (!error && data && data.success) {
      const fullBooking = await getBookingById(data.booking.id);
      return { success: true, booking: fullBooking || data.booking };
    } else if (data && !data.success) {
      return { success: false, error: data.error };
    }
  }

  // In-Memory Double Booking Check (atomic in Node single thread)
  const newStart = new Date(input.start_time).getTime();
  const newEnd = new Date(input.end_time).getTime();

  const conflict = mockStore.bookings.some(
    (b) =>
      b.staff_id === input.staff_id &&
      b.status === 'confirmed' &&
      new Date(b.start_time).getTime() < newEnd &&
      new Date(b.end_time).getTime() > newStart
  );

  if (conflict) {
    return {
      success: false,
      error: 'This slot has just been booked by another customer. Please select another time.',
    };
  }

  const newBooking: Booking = {
    ...input,
    id: `bkg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString(),
  };

  mockStore.bookings.push(newBooking);

  const populated: Booking = {
    ...newBooking,
    service: mockStore.services.find((s) => s.id === newBooking.service_id),
    staff: mockStore.staff.find((s) => s.id === newBooking.staff_id),
  };

  return { success: true, booking: populated };
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus
): Promise<Booking | null> {
  const supabase = createAdminSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select('*, service:services(*), staff:staff(*)')
      .single();
    if (!error && data) return data;
  }

  const idx = mockStore.bookings.findIndex((b) => b.id === id);
  if (idx !== -1) {
    mockStore.bookings[idx].status = status;
    return {
      ...mockStore.bookings[idx],
      service: mockStore.services.find((s) => s.id === mockStore.bookings[idx].service_id),
      staff: mockStore.staff.find((s) => s.id === mockStore.bookings[idx].staff_id),
    };
  }
  return null;
}
