'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Booking, BookingStatus } from '@/lib/types';
import { formatDateLondon, formatTimeLondon } from '@/lib/dates';
import {
  ChevronLeft,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Scissors,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Loader2,
  Trash2,
} from 'lucide-react';

export default function AdminBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    async function loadBooking() {
      try {
        const res = await fetch(`/api/admin/bookings/${id}`);
        const data = await res.json();
        if (data.success) {
          setBooking(data.booking);
        } else {
          setMessage({ text: data.error || 'Booking not found', type: 'error' });
        }
      } catch {
        setMessage({ text: 'Error connecting to server', type: 'error' });
      } finally {
        setLoading(false);
      }
    }
    loadBooking();
  }, [id]);

  const handleUpdateStatus = async (status: BookingStatus) => {
    setUpdating(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (data.success && data.booking) {
        setBooking(data.booking);
        setMessage({
          text:
            status === 'cancelled'
              ? 'Booking cancelled and cancellation notice sent to customer.'
              : `Booking marked as ${status}.`,
          type: 'success',
        });
      } else {
        setMessage({ text: data.error || 'Failed to update booking status', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Failed to update status', type: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-zinc-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#c9a84c] mb-3" />
        Loading booking details...
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="py-20 text-center">
        <p className="text-zinc-400">Booking not found or removed.</p>
        <Link
          href="/admin/dashboard"
          className="mt-4 inline-flex items-center gap-1.5 text-xs text-[#c9a84c] hover:underline"
        >
          &larr; Back to Dashboard
        </Link>
      </div>
    );
  }

  const startDate = new Date(booking.start_time);
  const formattedDate = formatDateLondon(startDate);
  const formattedTime = formatTimeLondon(startDate);

  return (
    <div className="max-w-3xl space-y-6">
      {/* Back button */}
      <Link
        href="/admin/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-[#c9a84c] transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif">
              Booking #{booking.id.slice(0, 8)}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                booking.status === 'confirmed'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : booking.status === 'completed'
                  ? 'bg-blue-950 text-blue-400 border border-blue-800'
                  : booking.status === 'cancelled'
                  ? 'bg-red-950 text-red-400 border border-red-800'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {booking.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Created on {new Date(booking.created_at || '').toLocaleString()}
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
              : 'bg-red-950/60 border border-red-800 text-red-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Grid of details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Info Card */}
        <div className="bg-[#1a1a1a] border border-zinc-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#c9a84c]">
            Customer Information
          </h2>

          <div className="space-y-2.5 text-sm">
            <div className="flex items-center gap-2 text-white font-medium">
              <User className="w-4 h-4 text-zinc-500" />
              <span>
                {booking.customer_first_name} {booking.customer_last_name}
              </span>
            </div>

            <div className="flex items-center gap-2 text-zinc-300">
              <Phone className="w-4 h-4 text-zinc-500" />
              <a href={`tel:${booking.customer_phone}`} className="hover:text-[#c9a84c] underline">
                {booking.customer_phone}
              </a>
            </div>

            <div className="flex items-center gap-2 text-zinc-300">
              <Mail className="w-4 h-4 text-zinc-500" />
              <a href={`mailto:${booking.customer_email}`} className="hover:text-[#c9a84c] underline">
                {booking.customer_email}
              </a>
            </div>

            {booking.notes && (
              <div className="pt-2 border-t border-zinc-800">
                <span className="text-xs text-zinc-500 block mb-1">Customer Notes:</span>
                <p className="text-xs text-zinc-300 bg-[#222222] p-2.5 rounded-lg border border-zinc-800/80">
                  {booking.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Treatment Info Card */}
        <div className="bg-[#1a1a1a] border border-zinc-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#c9a84c]">
            Appointment &amp; Service
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Service:</span>
              <span className="font-semibold text-white">{booking.service?.name}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Assigned Barber:</span>
              <span className="font-semibold text-white">{booking.staff?.name}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Date:</span>
              <span className="text-zinc-200 font-medium">{formattedDate}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Time:</span>
              <span className="text-[#c9a84c] font-bold text-base">{formattedTime}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Duration:</span>
              <span className="text-zinc-300">{booking.service?.duration_minutes} minutes</span>
            </div>

            <div className="pt-2 border-t border-zinc-800 flex justify-between items-center">
              <span className="font-semibold text-white">Price:</span>
              <span className="text-xl font-bold text-[#c9a84c]">
                £{booking.service?.price_gbp}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Management Actions */}
      <div className="bg-[#1a1a1a] border border-zinc-800 rounded-2xl p-5 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Manage Appointment Status
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          {booking.status !== 'completed' && (
            <button
              onClick={() => handleUpdateStatus('completed')}
              disabled={updating}
              className="px-4 py-2.5 rounded-xl bg-blue-950 hover:bg-blue-900 border border-blue-700 text-blue-200 font-semibold text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              Mark as Completed
            </button>
          )}

          {booking.status !== 'confirmed' && (
            <button
              onClick={() => handleUpdateStatus('confirmed')}
              disabled={updating}
              className="px-4 py-2.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-emerald-200 font-semibold text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              Set to Confirmed
            </button>
          )}

          {booking.status !== 'no_show' && (
            <button
              onClick={() => handleUpdateStatus('no_show')}
              disabled={updating}
              className="px-4 py-2.5 rounded-xl bg-[#222222] hover:bg-zinc-700 border border-zinc-700 text-zinc-300 font-semibold text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <AlertTriangle className="w-4 h-4" />
              Mark as No-Show
            </button>
          )}

          {booking.status !== 'cancelled' && (
            <button
              onClick={() => {
                if (
                  confirm(
                    'Are you sure you want to cancel this booking? A cancellation email will be automatically sent to the customer.'
                  )
                ) {
                  handleUpdateStatus('cancelled');
                }
              }}
              disabled={updating}
              className="px-4 py-2.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-200 font-semibold text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              Cancel Booking &amp; Notify Customer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
