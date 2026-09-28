import { Booking } from './types';

function formatToIcsDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Generates an iCalendar (.ics) string for a booking
 */
export function generateIcsContent(booking: Booking): string {
  const dtStart = formatToIcsDate(booking.start_time);
  const dtEnd = formatToIcsDate(booking.end_time);
  const dtStamp = formatToIcsDate(new Date().toISOString());
  const uid = `${booking.id}@fadeandco.com`;
  const summary = `Fade & Co. - ${booking.service?.name || 'Barbershop Appointment'}`;
  const description = `Appointment with ${booking.staff?.name || 'your barber'}.\\nService: ${booking.service?.name || 'Haircut'}\\nCustomer: ${booking.customer_first_name} ${booking.customer_last_name}\\nShop Phone: +44 7700 900123`;
  const location = '47 King Street, Manchester, UK';

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Fade & Co.//Barbershop Booking System//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: Fade & Co. appointment in 1 hour',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Generates a direct Google Calendar add link
 */
export function generateGoogleCalendarUrl(booking: Booking): string {
  const dtStart = formatToIcsDate(booking.start_time);
  const dtEnd = formatToIcsDate(booking.end_time);
  const title = encodeURIComponent(`Fade & Co. - ${booking.service?.name || 'Haircut'}`);
  const details = encodeURIComponent(
    `Barber: ${booking.staff?.name || 'Barber'}\nService: ${booking.service?.name || 'Haircut'}\nPrice: £${booking.service?.price_gbp || ''}\nPhone: +44 7700 900123`
  );
  const location = encodeURIComponent('47 King Street, Manchester, UK');

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dtStart}/${dtEnd}&details=${details}&location=${location}`;
}
