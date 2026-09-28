import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/auth';
import { getBookingById, updateBookingStatus } from '@/lib/db';
import { BookingStatus } from '@/lib/types';
import { sendCancellationEmail } from '@/lib/email';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticatedAdmin())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const booking = await getBookingById(id);

    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error('Error fetching booking detail:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticatedAdmin())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body as { status: BookingStatus };

    const validStatuses: BookingStatus[] = ['confirmed', 'cancelled', 'completed', 'no_show'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid booking status' },
        { status: 400 }
      );
    }

    const updated = await updateBookingStatus(id, status);

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    // If cancelled, trigger cancellation email to customer
    if (status === 'cancelled') {
      sendCancellationEmail(updated).catch((err) =>
        console.error('Failed to send cancellation email:', err)
      );
    }

    return NextResponse.json({ success: true, booking: updated });
  } catch (error) {
    console.error('Error updating booking status:', error);
    return NextResponse.json({ success: false, error: 'Failed to update booking' }, { status: 500 });
  }
}
