'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Booking } from '@/lib/types';
import { generateGoogleCalendarUrl, generateIcsContent } from '@/lib/ics';
import { formatDateLondon, formatTimeLondon } from '@/lib/availability';
import {
  CheckCircle,
  Calendar as CalendarIcon,
  Download,
  ExternalLink,
  MapPin,
  Phone,
  ArrowRight,
  Scissors,
  Clock,
  User,
  Loader2,
} from 'lucide-react';

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking_id');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // 1. Try to read from sessionStorage for instant state
    const cached = sessionStorage.getItem('last_fade_booking');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (!bookingId || parsed.id === bookingId) {
          setBooking(parsed);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error('Error parsing session booking:', err);
      }
    }

    // 2. Fetch if available via public endpoint / state
    if (bookingId) {
      fetch(`/api/admin/bookings/${bookingId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.booking) {
            setBooking(data.booking);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [bookingId]);

  const handleDownloadIcs = () => {
    if (!booking) return;
    const icsString = generateIcsContent(booking);
    const blob = new Blob([icsString], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `fade-and-co-${booking.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const googleCalUrl = booking ? generateGoogleCalendarUrl(booking) : '#';

  const formattedDate = booking ? formatDateLondon(new Date(booking.start_time)) : '';
  const formattedTime = booking ? formatTimeLondon(new Date(booking.start_time)) : '';

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Success Card */}
      <div className="bg-[#1a1a1a] border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-2xl text-center relative overflow-hidden">
        {/* Subtle Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-[#c9a84c] to-transparent" />

        {/* Success Icon */}
        <div className="w-20 h-20 bg-[#c9a84c]/10 border-2 border-[#c9a84c] rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[#c9a84c]/10 animate-fade-in">
          <CheckCircle className="w-10 h-10 text-[#c9a84c]" />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-[#c9a84c]">
          Booking Confirmed
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-serif mt-2">
          You&apos;re All Set!
        </h1>
        <p className="text-sm text-zinc-400 mt-2 max-w-sm mx-auto">
          A confirmation email and calendar invite have been sent to{' '}
          <strong className="text-zinc-200">{booking?.customer_email || 'your email'}</strong>.
        </p>

        {/* Booking Summary Box */}
        {loading ? (
          <div className="py-8 text-center text-zinc-400 text-xs">
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#c9a84c] mb-2" />
            Loading booking details...
          </div>
        ) : booking ? (
          <div className="bg-[#202020] border border-zinc-800 rounded-2xl p-5 my-8 text-left space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <span className="text-xs uppercase font-medium text-zinc-400">Booking Reference</span>
              <span className="font-mono text-xs font-semibold text-[#c9a84c]">{booking.id}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-zinc-500 block">Service</span>
                <span className="text-sm font-semibold text-white flex items-center gap-1.5 mt-0.5">
                  <Scissors className="w-3.5 h-3.5 text-[#c9a84c]" />
                  {booking.service?.name || 'Haircut'}
                </span>
              </div>
              <div>
                <span className="text-xs text-zinc-500 block">Barber</span>
                <span className="text-sm font-semibold text-white flex items-center gap-1.5 mt-0.5">
                  <User className="w-3.5 h-3.5 text-[#c9a84c]" />
                  {booking.staff?.name || 'Barber'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <span className="text-xs text-zinc-500 block">Date</span>
                <span className="text-sm font-semibold text-white flex items-center gap-1.5 mt-0.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-[#c9a84c]" />
                  {formattedDate}
                </span>
              </div>
              <div>
                <span className="text-xs text-zinc-500 block">Time</span>
                <span className="text-sm font-bold text-[#c9a84c] flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-[#c9a84c]" />
                  {formattedTime}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800 text-xs text-zinc-400 flex items-center justify-between">
              <span>Total to pay in shop:</span>
              <span className="text-base font-bold text-[#c9a84c]">
                £{booking.service?.price_gbp || 0}
              </span>
            </div>
          </div>
        ) : null}

        {/* Action Buttons */}
        <div className="space-y-3">
          <a
            href={googleCalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-xl bg-[#282828] hover:bg-[#303030] border border-zinc-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 group"
          >
            <ExternalLink className="w-4 h-4 text-[#c9a84c] group-hover:scale-110 transition-transform" />
            Add to Google Calendar
          </a>

          <button
            type="button"
            onClick={handleDownloadIcs}
            className="w-full py-3 px-4 rounded-xl bg-[#202020] hover:bg-[#282828] border border-zinc-800 text-zinc-300 font-medium text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-zinc-400" />
            Download .ICS Calendar File
          </button>

          <div className="pt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#c9a84c] hover:underline"
            >
              Book another appointment <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Shop Location & Contact reminder */}
        <div className="mt-8 pt-6 border-t border-zinc-800/80 text-xs text-zinc-500 space-y-1">
          <p className="flex items-center justify-center gap-1.5 text-zinc-400">
            <MapPin className="w-3.5 h-3.5 text-[#c9a84c]" />
            47 King Street, Manchester, UK
          </p>
          <p className="flex items-center justify-center gap-1.5 text-zinc-400">
            <Phone className="w-3.5 h-3.5 text-[#c9a84c]" />
            +44 7700 900123
          </p>
        </div>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#121212] via-[#161616] to-[#0f0f0f] py-12 px-4 flex items-center justify-center">
      <Suspense
        fallback={
          <div className="text-center text-zinc-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#c9a84c] mb-2" />
            Loading booking confirmation...
          </div>
        }
      >
        <BookingSuccessContent />
      </Suspense>
    </div>
  );
}
