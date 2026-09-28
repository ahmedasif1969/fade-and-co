import { NextRequest, NextResponse } from 'next/server';
import { getBookings, getBookingSettings } from '@/lib/db';
import { sendCustomerReminderEmail } from '@/lib/email';
import { createAdminSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  // Optional Bearer CRON_SECRET verification for production security
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized cron trigger' }, { status: 401 });
  }

  try {
    const now = new Date();
    // Wide window: anything happening in the next 20–44 hours (covers full day since cron runs once daily)
    const windowStart = new Date(now.getTime() + 20 * 60 * 60 * 1000);
    const windowEnd = new Date(now.getTime() + 44 * 60 * 60 * 1000);

    const settings = await getBookingSettings();

    // Query confirmed bookings starting between windowStart and windowEnd
    const bookings = await getBookings({
      status: 'confirmed',
      startDate: windowStart.toISOString(),
      endDate: windowEnd.toISOString(),
    });

    const reminderResults = [];

    for (const booking of bookings) {
      if (!booking.reminder_sent) {
        await sendCustomerReminderEmail(booking, settings);

        // Mark as sent in Supabase if live
        const supabase = createAdminSupabaseClient();
        if (supabase) {
          await supabase.from('bookings').update({ reminder_sent: true }).eq('id', booking.id);
        }
        booking.reminder_sent = true;

        reminderResults.push({ id: booking.id, email: booking.customer_email });
      }
    }

    return NextResponse.json({
      success: true,
      reminders_sent_count: reminderResults.length,
      reminders: reminderResults,
      window: {
        start: windowStart.toISOString(),
        end: windowEnd.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error executing reminder cron job:', error);
    return NextResponse.json(
      { success: false, error: 'Internal cron execution error' },
      { status: 500 }
    );
  }
}
