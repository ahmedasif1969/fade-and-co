import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/auth';
import { getBlockedSlots, createBlockedSlot } from '@/lib/db';

export async function GET(request: NextRequest) {
  if (!(await isAuthenticatedAdmin())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || undefined;

    const blockedSlots = await getBlockedSlots(date);
    return NextResponse.json({ success: true, blocked_slots: blockedSlots });
  } catch (error) {
    console.error('Error fetching blocked slots:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch blocked slots' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticatedAdmin())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { staff_id, date, start_time, end_time, reason, is_full_day } = body;

    if (!date) {
      return NextResponse.json({ success: false, error: 'Date is required' }, { status: 400 });
    }

    const finalStartTime = is_full_day ? '00:00:00' : start_time || '00:00:00';
    const finalEndTime = is_full_day ? '23:59:59' : end_time || '23:59:59';

    const blocked = await createBlockedSlot({
      staff_id: staff_id && staff_id !== 'all' ? staff_id : null,
      date,
      start_time: finalStartTime,
      end_time: finalEndTime,
      reason: reason?.trim() || null,
    });

    return NextResponse.json({ success: true, blocked_slot: blocked });
  } catch (error) {
    console.error('Error creating blocked slot:', error);
    return NextResponse.json({ success: false, error: 'Failed to create blocked slot' }, { status: 500 });
  }
}
