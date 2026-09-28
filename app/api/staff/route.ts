import { NextResponse } from 'next/server';
import { getActiveStaff } from '@/lib/db';

export async function GET() {
  try {
    const staff = await getActiveStaff();
    return NextResponse.json({ success: true, staff });
  } catch (error) {
    console.error('Error fetching active staff:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch staff' }, { status: 500 });
  }
}
