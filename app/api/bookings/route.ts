import { NextRequest, NextResponse } from 'next/server';
import {
  createBookingSafe,
  getServiceById,
  getBookingSettings,
  getActiveStaff,
} from '@/lib/db';
import { getSlotsForStaff } from '@/lib/availability';
import { sendCustomerConfirmationEmail, sendOwnerNotificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      service_id,
      staff_id,
      start_time,
      customer_first_name,
      customer_last_name,
      customer_email,
      customer_phone,
      notes,
    } = body;

    // Validation
    if (
      !service_id ||
      !staff_id ||
      !start_time ||
      !customer_first_name?.trim() ||
      !customer_last_name?.trim() ||
      !customer_email?.trim() ||
      !customer_phone?.trim()
    ) {
      return NextResponse.json(
        { success: false, error: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    const service = await getServiceById(service_id);
    if (!service || !service.active) {
      return NextResponse.json(
        { success: false, error: 'Selected service is invalid or unavailable' },
        { status: 400 }
      );
    }

    const settings = await getBookingSettings();
    const startDate = new Date(start_time);
    if (isNaN(startDate.getTime())) {
      return NextResponse.json({ success: false, error: 'Invalid start time format' }, { status: 400 });
    }

    const durationMs = service.duration_minutes * 60 * 1000;
    const endDate = new Date(startDate.getTime() + durationMs);

    let resolvedStaffId = staff_id;

    // Handle "Any Available" resolution with tiebreaker priority
    if (staff_id === 'any') {
      const activeStaff = await getActiveStaff();
      const priority = ['Marcus', 'Jay', 'Tariq'];
      activeStaff.sort((a, b) => {
        const ia = priority.indexOf(a.name);
        const ib = priority.indexOf(b.name);
        if (ia !== -1 && ib !== -1) return ia - ib;
        if (ia !== -1) return -1;
        if (ib !== -1) return 1;
        return a.name.localeCompare(b.name);
      });

      const dateStr = startDate.toISOString().split('T')[0];
      let assigned = false;

      for (const barber of activeStaff) {
        const slots = await getSlotsForStaff(barber, service_id, dateStr);
        const match = slots.find((s) => new Date(s.startTime).getTime() === startDate.getTime());
        if (match) {
          resolvedStaffId = barber.id;
          assigned = true;
          break;
        }
      }

      if (!assigned) {
        return NextResponse.json(
          { success: false, error: 'No barber is available for this selected time slot' },
          { status: 409 }
        );
      }
    }

    const status = settings.auto_confirm ? 'confirmed' : 'confirmed';

    // Atomic / Concurrency safe booking creation
    const result = await createBookingSafe({
      service_id,
      staff_id: resolvedStaffId,
      customer_first_name: customer_first_name.trim(),
      customer_last_name: customer_last_name.trim(),
      customer_email: customer_email.trim(),
      customer_phone: customer_phone.trim(),
      notes: notes?.trim() || null,
      start_time: startDate.toISOString(),
      end_time: endDate.toISOString(),
      status,
    });

    if (!result.success || !result.booking) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to create booking' },
        { status: 409 }
      );
    }

    const createdBooking = result.booking;

    // Send emails asynchronously (do not block response on email failure)
    Promise.allSettled([
      sendCustomerConfirmationEmail(createdBooking, settings),
      sendOwnerNotificationEmail(createdBooking, settings.notification_email),
    ]).catch((err) => console.error('Error dispatching booking emails:', err));

    return NextResponse.json({
      success: true,
      booking: createdBooking,
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error while creating booking' },
      { status: 500 }
    );
  }
}
