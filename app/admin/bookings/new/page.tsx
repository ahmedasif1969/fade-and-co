'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Staff, Service } from '@/lib/types';
import { ChevronLeft, PlusCircle, Calendar, Clock, User, Phone, Mail, Loader2, AlertCircle } from 'lucide-react';

export default function AdminNewBookingPage() {
  const router = useRouter();

  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Form State
  const [serviceId, setServiceId] = useState('');
  const [staffId, setStaffId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [sendEmail, setSendEmail] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [staffRes, srvRes] = await Promise.all([
          fetch('/api/admin/staff'),
          fetch('/api/admin/services'),
        ]);
        const staffData = await staffRes.json();
        const srvData = await srvRes.json();

        if (staffData.success) {
          setStaffList(staffData.staff || []);
          if (staffData.staff?.length > 0) setStaffId(staffData.staff[0].id);
        }
        if (srvData.success) {
          setServices(srvData.services || []);
          if (srvData.services?.length > 0) setServiceId(srvData.services[0].id);
        }
      } catch (err) {
        console.error('Failed to load initial data:', err);
      } finally {
        setLoadingInitial(false);
      }
    }
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!firstName.trim() || !lastName.trim()) {
      setError('Please provide customer name.');
      setSubmitting(false);
      return;
    }

    try {
      // Construct UTC start_time
      const [hours, mins] = time.split(':');
      const startDateTime = new Date(`${date}T${hours}:${mins}:00Z`).toISOString();

      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: serviceId,
          staff_id: staffId,
          start_time: startDateTime,
          customer_first_name: firstName.trim(),
          customer_last_name: lastName.trim(),
          customer_phone: phone.trim() || 'Walk-in',
          customer_email: email.trim() || 'walkin@fadeandco.com',
          notes: notes.trim(),
          send_email: sendEmail,
        }),
      });

      const data = await res.json();

      if (data.success && data.booking) {
        router.push(`/admin/bookings/${data.booking.id}`);
      } else {
        setError(data.error || 'Failed to create booking.');
        setSubmitting(false);
      }
    } catch {
      setError('Failed to connect to server.');
      setSubmitting(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="py-20 text-center text-zinc-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#c9a84c] mb-2" />
        Loading services &amp; staff...
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Back button */}
      <Link
        href="/admin/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-[#c9a84c] transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif">
          Manually Add Booking
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Record a phone booking, walk-in customer, or manual appointment.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#1a1a1a] border border-zinc-800 rounded-2xl p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Service
            </label>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="w-full bg-[#202020] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#c9a84c]"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (£{s.price_gbp} &bull; {s.duration_minutes}m)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Assigned Barber
            </label>
            <select
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              className="w-full bg-[#202020] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#c9a84c]"
            >
              {staffList.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} {st.active ? '' : '(Inactive)'}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Appointment Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#202020] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#c9a84c]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Start Time (HH:MM)
            </label>
            <input
              type="time"
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-[#202020] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#c9a84c]"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-zinc-800 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#c9a84c] block">
            Customer Information
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-[#202020] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#c9a84c]"
                placeholder="Marcus"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-[#202020] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#c9a84c]"
                placeholder="Rashford"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#202020] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#c9a84c]"
                placeholder="+44 7700 900111"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#202020] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#c9a84c]"
                placeholder="customer@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">Internal Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#202020] border border-zinc-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#c9a84c]"
              placeholder="Walk-in, special fade request, etc."
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="sendEmail"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
              className="rounded bg-zinc-800 border-zinc-700 text-[#c9a84c] focus:ring-0"
            />
            <label htmlFor="sendEmail" className="text-xs text-zinc-300">
              Send confirmation email &amp; calendar invite to customer if email is provided
            </label>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 rounded-xl gold-btn text-black font-bold uppercase tracking-wider text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving Booking...
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                Create Booking
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
