import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/auth';
import { getBookingSettings, updateBookingSettings } from '@/lib/db';

export async function GET() {
  if (!(await isAuthenticatedAdmin())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const settings = await getBookingSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticatedAdmin())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      buffer_minutes,
      min_advance_hours,
      max_advance_days,
      auto_confirm,
      notification_email,
      shop_phone,
      shop_address,
    } = body;

    const updates: Record<string, unknown> = {};
    if (buffer_minutes !== undefined) updates.buffer_minutes = parseInt(buffer_minutes, 10);
    if (min_advance_hours !== undefined) updates.min_advance_hours = parseInt(min_advance_hours, 10);
    if (max_advance_days !== undefined) updates.max_advance_days = parseInt(max_advance_days, 10);
    if (auto_confirm !== undefined) updates.auto_confirm = Boolean(auto_confirm);
    if (notification_email !== undefined) updates.notification_email = notification_email.trim();
    if (shop_phone !== undefined) updates.shop_phone = shop_phone.trim();
    if (shop_address !== undefined) updates.shop_address = shop_address.trim();

    const updated = await updateBookingSettings(updates);
    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ success: false, error: 'Failed to update settings' }, { status: 500 });
  }
}
