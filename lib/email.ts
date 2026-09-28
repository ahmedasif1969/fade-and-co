import { Resend } from 'resend';
import { Booking, BookingSettings } from './types';
import { generateIcsContent } from './ics';
import { formatDateLondon, formatTimeLondon } from './dates';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const fromEmail = process.env.RESEND_FROM_EMAIL || 'Fade & Co. <bookings@fadeandco.com>';

// Shared HTML styling wrapper for luxury black and gold theme
function wrapEmailTemplate(title: string, bodyContent: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0f0f0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f3f4f6;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f0f0f; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 30px; text-align: center; border-bottom: 1px solid #2d2d2d; background: linear-gradient(180deg, #222222 0%, #1a1a1a 100%);">
              <h1 style="margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 2px; color: #c9a84c; text-transform: uppercase;">FADE & CO.</h1>
              <p style="margin: 6px 0 0 0; font-size: 12px; letter-spacing: 3px; color: #888888; text-transform: uppercase;">Manchester</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 36px 30px;">
              ${bodyContent}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 30px; background-color: #141414; border-top: 1px solid #222222; text-align: center; font-size: 13px; color: #777777; line-height: 1.6;">
              <p style="margin: 0 0 8px 0; color: #aaaaaa; font-weight: 500;">Fade & Co. Barbershop</p>
              <p style="margin: 0;">47 King Street, Manchester, UK</p>
              <p style="margin: 4px 0 0 0;">Tel: +44 7700 900123 &bull; hello@fadeandco.com</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * 1. Send Customer Confirmation Email
 */
export async function sendCustomerConfirmationEmail(booking: Booking, settings?: BookingSettings) {
  const startDate = new Date(booking.start_time);
  const formattedDate = formatDateLondon(startDate);
  const formattedTime = formatTimeLondon(startDate);
  const shopPhone = settings?.shop_phone || '+44 7700 900123';
  const shopAddress = settings?.shop_address || '47 King Street, Manchester, UK';

  const body = `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #ffffff;">Your Booking is Confirmed</h2>
    <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #cccccc;">
      Hi ${booking.customer_first_name}, thank you for booking with Fade & Co. We've reserved your appointment.
    </p>

    <div style="background-color: #222222; border: 1px solid #333333; border-radius: 8px; padding: 20px; margin-bottom: 28px;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td style="padding-bottom: 12px; color: #888888; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Service</td>
          <td style="padding-bottom: 12px; text-align: right; color: #ffffff; font-weight: 600; font-size: 15px;">${booking.service?.name || 'Haircut'}</td>
        </tr>
        <tr>
          <td style="padding-bottom: 12px; color: #888888; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Barber</td>
          <td style="padding-bottom: 12px; text-align: right; color: #ffffff; font-weight: 600; font-size: 15px;">${booking.staff?.name || 'Assigned Barber'}</td>
        </tr>
        <tr>
          <td style="padding-bottom: 12px; color: #888888; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Date & Time</td>
          <td style="padding-bottom: 12px; text-align: right; color: #c9a84c; font-weight: 600; font-size: 15px;">${formattedDate} at ${formattedTime}</td>
        </tr>
        <tr>
          <td style="padding-bottom: 12px; color: #888888; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Duration</td>
          <td style="padding-bottom: 12px; text-align: right; color: #ffffff; font-size: 14px;">${booking.service?.duration_minutes || 30} mins</td>
        </tr>
        <tr>
          <td style="color: #888888; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Price</td>
          <td style="text-align: right; color: #c9a84c; font-weight: 700; font-size: 16px;">£${booking.service?.price_gbp || 0}</td>
        </tr>
      </table>
    </div>

    <div style="background-color: #171717; border-left: 3px solid #c9a84c; padding: 14px 16px; margin-bottom: 24px;">
      <p style="margin: 0; font-size: 13px; color: #bbbbbb; line-height: 1.5;">
        <strong style="color: #ffffff;">Location:</strong> ${shopAddress}<br>
        <strong style="color: #ffffff;">Need to change?</strong> Call us at ${shopPhone}
      </p>
    </div>

    <p style="margin: 0; font-size: 13px; color: #777777; text-align: center;">
      A calendar invite (.ics) is attached to this email.
    </p>
  `;

  const html = wrapEmailTemplate('Your booking at Fade & Co. is confirmed', body);
  const ics = generateIcsContent(booking);

  if (resend) {
    try {
      await resend.emails.send({
        from: fromEmail,
        to: booking.customer_email,
        subject: 'Your booking at Fade & Co. is confirmed',
        html,
        attachments: [
          {
            filename: 'fade-and-co-appointment.ics',
            content: Buffer.from(ics).toString('base64'),
          },
        ],
      });
      return true;
    } catch (err) {
      console.error('Failed to send customer confirmation email via Resend:', err);
    }
  } else {
    console.log('[Email Mock] Customer Confirmation Email sent to:', booking.customer_email);
  }
  return true;
}

/**
 * 2. Send Customer Reminder Email (24h before)
 */
export async function sendCustomerReminderEmail(booking: Booking, settings?: BookingSettings) {
  const startDate = new Date(booking.start_time);
  const formattedDate = formatDateLondon(startDate);
  const formattedTime = formatTimeLondon(startDate);
  const shopAddress = settings?.shop_address || '47 King Street, Manchester, UK';
  const shopPhone = settings?.shop_phone || '+44 7700 900123';

  const body = `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #ffffff;">Appointment Reminder</h2>
    <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #cccccc;">
      Hi ${booking.customer_first_name}, this is a friendly reminder of your appointment tomorrow at Fade & Co.
    </p>

    <div style="background-color: #222222; border: 1px solid #333333; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #c9a84c;">${booking.service?.name || 'Haircut'} with ${booking.staff?.name || 'Barber'}</p>
      <p style="margin: 0 0 8px 0; font-size: 15px; color: #ffffff;"><strong>Tomorrow:</strong> ${formattedDate} at <strong>${formattedTime}</strong></p>
      <p style="margin: 0; font-size: 13px; color: #999999;">Address: ${shopAddress}</p>
    </div>

    <p style="margin: 0; font-size: 13px; color: #888888; line-height: 1.5;">
      If you need to reschedule or cancel, please notify us as early as possible by calling ${shopPhone}. We look forward to seeing you.
    </p>
  `;

  const html = wrapEmailTemplate('Reminder: your appointment at Fade & Co. tomorrow', body);

  if (resend) {
    try {
      await resend.emails.send({
        from: fromEmail,
        to: booking.customer_email,
        subject: 'Reminder: your appointment at Fade & Co. tomorrow',
        html,
      });
      return true;
    } catch (err) {
      console.error('Failed to send customer reminder email:', err);
    }
  } else {
    console.log('[Email Mock] Reminder Email sent to:', booking.customer_email);
  }
  return true;
}

/**
 * 3. Send Owner Notification Email
 */
export async function sendOwnerNotificationEmail(booking: Booking, targetEmail: string) {
  const startDate = new Date(booking.start_time);
  const formattedDate = formatDateLondon(startDate);
  const formattedTime = formatTimeLondon(startDate);

  const subject = `New booking — ${booking.customer_first_name} ${booking.customer_last_name} — ${booking.service?.name || 'Haircut'} — ${formattedDate} ${formattedTime}`;

  const body = `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #c9a84c;">New Online Booking Received</h2>
    <p style="margin: 0 0 20px 0; font-size: 15px; color: #cccccc;">
      A new appointment has just been booked online.
    </p>

    <div style="background-color: #222222; border: 1px solid #333333; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td style="padding-bottom: 10px; color: #888888; font-size: 13px;">Customer</td>
          <td style="padding-bottom: 10px; text-align: right; color: #ffffff; font-weight: 600;">${booking.customer_first_name} ${booking.customer_last_name}</td>
        </tr>
        <tr>
          <td style="padding-bottom: 10px; color: #888888; font-size: 13px;">Phone</td>
          <td style="padding-bottom: 10px; text-align: right; color: #ffffff;"><a href="tel:${booking.customer_phone}" style="color: #c9a84c; text-decoration: none;">${booking.customer_phone}</a></td>
        </tr>
        <tr>
          <td style="padding-bottom: 10px; color: #888888; font-size: 13px;">Email</td>
          <td style="padding-bottom: 10px; text-align: right; color: #ffffff;">${booking.customer_email}</td>
        </tr>
        <tr>
          <td style="padding-bottom: 10px; color: #888888; font-size: 13px;">Service</td>
          <td style="padding-bottom: 10px; text-align: right; color: #ffffff; font-weight: 600;">${booking.service?.name || 'Haircut'} (£${booking.service?.price_gbp || 0})</td>
        </tr>
        <tr>
          <td style="padding-bottom: 10px; color: #888888; font-size: 13px;">Barber</td>
          <td style="padding-bottom: 10px; text-align: right; color: #ffffff; font-weight: 600;">${booking.staff?.name || 'Barber'}</td>
        </tr>
        <tr>
          <td style="color: #888888; font-size: 13px;">Date & Time</td>
          <td style="text-align: right; color: #c9a84c; font-weight: 600;">${formattedDate} at ${formattedTime}</td>
        </tr>
      </table>
    </div>

    ${
      booking.notes
        ? `<div style="background-color: #171717; border-left: 3px solid #c9a84c; padding: 12px 14px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 13px; color: #cccccc;"><strong style="color: #ffffff;">Customer Note:</strong> ${booking.notes}</p>
          </div>`
        : ''
    }
  `;

  const html = wrapEmailTemplate(subject, body);

  if (resend) {
    try {
      await resend.emails.send({
        from: fromEmail,
        to: targetEmail,
        subject,
        html,
      });
      return true;
    } catch (err) {
      console.error('Failed to send owner notification email:', err);
    }
  } else {
    console.log('[Email Mock] Owner Notification sent to:', targetEmail, subject);
  }
  return true;
}

/**
 * 4. Send Cancellation Email
 */
export async function sendCancellationEmail(booking: Booking) {
  const startDate = new Date(booking.start_time);
  const formattedDate = formatDateLondon(startDate);
  const formattedTime = formatTimeLondon(startDate);

  const body = `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #e57373;">Booking Cancelled</h2>
    <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #cccccc;">
      Hi ${booking.customer_first_name}, your appointment at Fade & Co. for <strong>${booking.service?.name || 'Haircut'}</strong> on <strong>${formattedDate} at ${formattedTime}</strong> has been cancelled.
    </p>

    <div style="background-color: #222222; border: 1px solid #333333; border-radius: 8px; padding: 20px; margin-bottom: 24px; text-align: center;">
      <p style="margin: 0 0 16px 0; font-size: 14px; color: #aaaaaa;">
        We apologize for any inconvenience caused. Would you like to pick a new date?
      </p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://fadeandco.com'}" style="display: inline-block; background-color: #c9a84c; color: #1a1a1a; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
        Book Another Appointment
      </a>
    </div>

    <p style="margin: 0; font-size: 13px; color: #777777; text-align: center;">
      If you have questions, please reach out directly at +44 7700 900123 or reply to this email.
    </p>
  `;

  const html = wrapEmailTemplate('Your Fade & Co. booking has been cancelled', body);

  if (resend) {
    try {
      await resend.emails.send({
        from: fromEmail,
        to: booking.customer_email,
        subject: 'Your Fade & Co. booking has been cancelled',
        html,
      });
      return true;
    } catch (err) {
      console.error('Failed to send cancellation email:', err);
    }
  } else {
    console.log('[Email Mock] Cancellation Email sent to:', booking.customer_email);
  }
  return true;
}
