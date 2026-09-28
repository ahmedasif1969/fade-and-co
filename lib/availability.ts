import {
  getBookingSettings,
  getActiveStaff,
  getStaffById,
  getStaffWorkingHours,
  getServiceById,
  getBookings,
  getBlockedSlots,
} from './db';
import {
  formatTimeLondon,
  formatDateLondon,
  createLondonDateTime,
  getDayOfWeekForDate,
  SHOP_TIMEZONE,
} from './dates';
import { AvailableSlot, Staff } from './types';

export { formatTimeLondon, formatDateLondon, createLondonDateTime, getDayOfWeekForDate, SHOP_TIMEZONE };

/**
 * Calculates available slots for a specific staff member and service on a date.
 */
export async function getSlotsForStaff(
  staff: Staff,
  serviceId: string,
  dateStr: string
): Promise<AvailableSlot[]> {
  const service = await getServiceById(serviceId);
  if (!service || !service.active) return [];

  const settings = await getBookingSettings();
  const dayOfWeek = getDayOfWeekForDate(dateStr);
  const workingHours = await getStaffWorkingHours(staff.id);
  const daySchedule = workingHours.find((h) => h.day_of_week === dayOfWeek);

  if (!daySchedule || !daySchedule.is_open) {
    return []; // Barber is off on this day
  }

  // Calculate day start and day end Date objects in UTC
  const workStart = createLondonDateTime(dateStr, daySchedule.start_time);
  const workEnd = createLondonDateTime(dateStr, daySchedule.end_time);

  // Fetch confirmed bookings for this barber on this date
  const dateDayStart = createLondonDateTime(dateStr, '00:00:00').toISOString();
  const dateDayEnd = createLondonDateTime(dateStr, '23:59:59').toISOString();
  const bookings = await getBookings({
    staffId: staff.id,
    status: 'confirmed',
    startDate: dateDayStart,
    endDate: dateDayEnd,
  });

  // Fetch blocked slots (either for this barber or shop-wide where staff_id is null)
  const blockedSlots = await getBlockedSlots(dateStr);
  const relevantBlocks = blockedSlots.filter(
    (b) => !b.staff_id || b.staff_id === staff.id
  );

  const slotStepMinutes = service.duration_minutes + settings.buffer_minutes;
  const serviceDurationMs = service.duration_minutes * 60 * 1000;
  const slotStepMs = slotStepMinutes * 60 * 1000;

  const now = new Date();
  const minAdvanceMs = settings.min_advance_hours * 60 * 60 * 1000;
  const earliestAllowedTime = new Date(now.getTime() + minAdvanceMs);

  const availableSlots: AvailableSlot[] = [];
  let currentStart = new Date(workStart.getTime());

  while (currentStart.getTime() + serviceDurationMs <= workEnd.getTime()) {
    const currentEnd = new Date(currentStart.getTime() + serviceDurationMs);

    // 1. Check if slot starts at least min_advance_hours from now
    if (currentStart.getTime() < earliestAllowedTime.getTime()) {
      currentStart = new Date(currentStart.getTime() + slotStepMs);
      continue;
    }

    // 2. Check overlap with existing confirmed bookings
    const hasBookingOverlap = bookings.some((b) => {
      const bStart = new Date(b.start_time).getTime();
      const bEnd = new Date(b.end_time).getTime();
      return currentStart.getTime() < bEnd && currentEnd.getTime() > bStart;
    });

    if (hasBookingOverlap) {
      currentStart = new Date(currentStart.getTime() + slotStepMs);
      continue;
    }

    // 3. Check overlap with blocked slots
    const hasBlockOverlap = relevantBlocks.some((blk) => {
      const blkStart = createLondonDateTime(dateStr, blk.start_time).getTime();
      const blkEnd = createLondonDateTime(dateStr, blk.end_time).getTime();
      return currentStart.getTime() < blkEnd && currentEnd.getTime() > blkStart;
    });

    if (hasBlockOverlap) {
      currentStart = new Date(currentStart.getTime() + slotStepMs);
      continue;
    }

    // Slot is free!
    availableSlots.push({
      startTime: currentStart.toISOString(),
      endTime: currentEnd.toISOString(),
      timeFormatted: formatTimeLondon(currentStart),
      staffId: staff.id,
      staffName: staff.name,
      availableBarbers: [{ id: staff.id, name: staff.name }],
    });

    currentStart = new Date(currentStart.getTime() + slotStepMs);
  }

  return availableSlots;
}

/**
 * Calculates available slots for all active staff members or a specific staff member.
 * For "any", returns union of slots with tiebreaker order Marcus -> Jay -> Tariq.
 */
export async function getAvailableSlots(
  staffIdOrAny: string,
  serviceId: string,
  dateStr: string
): Promise<AvailableSlot[]> {
  const settings = await getBookingSettings();
  const [year, month, day] = dateStr.split('-').map(Number);
  const requestedDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check max advance days
  const maxAdvanceDate = new Date(today.getTime() + settings.max_advance_days * 24 * 60 * 60 * 1000);
  if (requestedDate > maxAdvanceDate) {
    return [];
  }

  // If a specific barber is chosen
  if (staffIdOrAny && staffIdOrAny !== 'any') {
    const staff = await getStaffById(staffIdOrAny);
    if (!staff || !staff.active) return [];
    return getSlotsForStaff(staff, serviceId, dateStr);
  }

  // "Any Available" chosen: query all active staff
  const activeStaff = await getActiveStaff();
  // Tiebreaker priority order: Marcus, Jay, Tariq, others
  const priorityOrder = ['Marcus', 'Jay', 'Tariq'];
  activeStaff.sort((a, b) => {
    const idxA = priorityOrder.indexOf(a.name);
    const idxB = priorityOrder.indexOf(b.name);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.name.localeCompare(b.name);
  });

  const slotsMap = new Map<string, AvailableSlot>();

  for (const barber of activeStaff) {
    const barberSlots = await getSlotsForStaff(barber, serviceId, dateStr);
    for (const slot of barberSlots) {
      if (!slotsMap.has(slot.startTime)) {
        slotsMap.set(slot.startTime, {
          startTime: slot.startTime,
          endTime: slot.endTime,
          timeFormatted: slot.timeFormatted,
          staffId: barber.id,
          staffName: barber.name,
          availableBarbers: [{ id: barber.id, name: barber.name }],
        });
      } else {
        const existing = slotsMap.get(slot.startTime)!;
        existing.availableBarbers?.push({ id: barber.id, name: barber.name });
      }
    }
  }

  return Array.from(slotsMap.values()).sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
}
