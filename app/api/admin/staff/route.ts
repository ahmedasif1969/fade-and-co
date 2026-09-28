import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/auth';
import { getAllStaff, createStaff } from '@/lib/db';

export async function GET() {
  if (!(await isAuthenticatedAdmin())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const staff = await getAllStaff();
    return NextResponse.json({ success: true, staff });
  } catch (error) {
    console.error('Error fetching admin staff:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch staff' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticatedAdmin())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, photo_url, active = true, working_hours = [] } = body;

    if (!name?.trim()) {
      return NextResponse.json({ success: false, error: 'Staff name is required' }, { status: 400 });
    }

    // Default working hours for all 7 days if none provided
    const defaultHours = [0, 1, 2, 3, 4, 5, 6].map((day) => {
      const existing = working_hours.find((h: { day_of_week: number }) => h.day_of_week === day);
      return (
        existing || {
          day_of_week: day,
          is_open: day !== 0, // open Mon-Sat, Sun closed by default
          start_time: '09:00:00',
          end_time: '18:00:00',
        }
      );
    });

    const newStaff = await createStaff(
      {
        name: name.trim(),
        photo_url: photo_url?.trim() || null,
        active: Boolean(active),
      },
      defaultHours
    );

    return NextResponse.json({ success: true, staff: newStaff });
  } catch (error) {
    console.error('Error creating staff:', error);
    return NextResponse.json({ success: false, error: 'Failed to create staff' }, { status: 500 });
  }
}
