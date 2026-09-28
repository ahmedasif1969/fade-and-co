import { NextRequest, NextResponse } from 'next/server';
import { getAvailableSlots } from '@/lib/availability';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const staffId = searchParams.get('staff_id') || 'any';
    const serviceId = searchParams.get('service_id');
    const date = searchParams.get('date');

    if (!serviceId || !date) {
      return NextResponse.json(
        { success: false, error: 'service_id and date query parameters are required' },
        { status: 400 }
      );
    }

    // Validate date format YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { success: false, error: 'Invalid date format. Expected YYYY-MM-DD' },
        { status: 400 }
      );
    }

    const slots = await getAvailableSlots(staffId, serviceId, date);
    return NextResponse.json({ success: true, slots, date, staff_id: staffId });
  } catch (error) {
    console.error('Error calculating available slots:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate available slots' },
      { status: 500 }
    );
  }
}
