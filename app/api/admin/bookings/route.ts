import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/auth';
import { getBookings, createBookingSafe, getServiceById, getBookingSettings } from '@/lib/db';
import { BookingStatus } from '@/lib/types';
import { sendCustomerConfirmationEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
  if (!(await isAuthenticatedAdmin())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const staffId = searchParams.get('staff_id') || undefined;
    const status = (searchParams.get('status') as BookingStatus) || undefined;
    const startDate = searchParams.get('start_date') || undefined;
    const endDate = searchParams.get('end_date') || undefined;

    const bookings = await getBookings({
      staffId,
      status,
      startDate,
      endDate,
    });

    return NextResponse.json({ success: true, bookings });
  } catch (error) {
    console.error('Error fetching admin bookings:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticatedAdmin())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

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
      send_email = true,
    } = body;

    if (!service_id || !staff_id || !start_time || !customer_first_name || !customer_last_name) {
      return NextResponse.json(
        { success: false, error: 'Missing required booking parameters' },
        { status: 400 }
      );
    }

    const service = await getServiceById(service_id);
    if (!service) {
      return NextResponse.json({ success: false, error: 'Invalid service' }, { status: 400 });
    }

    const startDate = new Date(start_time);
    const endDate = new Date(startDate.getTime() + service.duration_minutes * 60 * 1000);

    const result = await createBookingSafe({
      service_id,
      staff_id,
      customer_first_name,
      customer_last_name,
      customer_email: customer_email || 'walkin@fadeandco.com',
      customer_phone: customer_phone || 'Walk-in',
      notes: notes || null,
      start_time: startDate.toISOString(),
      end_time: endDate.toISOString(),
      status: 'confirmed',
    });

    if (!result.success || !result.booking) {
      return NextResponse.json(
        { success: false, error: result.error || 'Conflict or error creating booking' },
        { status: 409 }
      );
    }

    if (send_email && customer_email && customer_email !== 'walkin@fadeandco.com') {
      const settings = await getBookingSettings();
      sendCustomerConfirmationEmail(result.booking, settings).catch(console.error);
    }

    return NextResponse.json({ success: true, booking: result.booking });
  } catch (error) {
    console.error('Error in manual admin booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
