'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Save, Loader2, Clock, AlertCircle, CheckCircle } from 'lucide-react';

export default function AdminEditStaffPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [name, setName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [workingHours, setWorkingHours] = useState(
    dayNames.map((_, idx) => ({
      day_of_week: idx,
      is_open: false,
      start_time: '09:00:00',
      end_time: '18:00:00',
    }))
  );

  useEffect(() => {
    async function loadStaff() {
      try {
        const res = await fetch(`/api/admin/staff/${id}`);
        const data = await res.json();
        if (data.success && data.staff) {
          const st = data.staff;
          setName(st.name);
          setPhotoUrl(st.photo_url || '');
          setActive(st.active);

          // Populate working hours map
          if (st.working_hours && st.working_hours.length > 0) {
            setWorkingHours(
              dayNames.map((_, idx) => {
                const existing = st.working_hours.find(
                  (h: { day_of_week: number }) => h.day_of_week === idx
                );
                return (
                  existing || {
                    day_of_week: idx,
                    is_open: false,
                    start_time: '09:00:00',
                    end_time: '18:00:00',
                  }
                );
              })
            );
          }
        } else {
          setError('Staff member not found');
        }
      } catch {
        setError('Error loading staff details');
      } finally {
        setLoading(false);
      }
    }
    loadStaff();
  }, [id]);

  const handleDayToggle = (dayIdx: number) => {
    setWorkingHours((prev) =>
      prev.map((d) => (d.day_of_week === dayIdx ? { ...d, is_open: !d.is_open } : d))
    );
  };

  const handleTimeChange = (dayIdx: number, field: 'start_time' | 'end_time', value: string) => {
    const formatted = value.length === 5 ? `${value}:00` : value;
    setWorkingHours((prev) =>
      prev.map((d) => (d.day_of_week === dayIdx ? { ...d, [field]: formatted } : d))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a barber name.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`/api/admin/staff/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          photo_url: photoUrl.trim() || null,
          active,
          working_hours: workingHours,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error || 'Failed to update staff member.');
      }
    } catch {
      setError('Network error while saving staff.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-zinc-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#c9a84c] mb-2" />
        Loading barber details...
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        href="/admin/staff"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-[#c9a84c] transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Staff List
      </Link>

      <div>
        <h1 className="text-3xl font-extrabold text-white font-serif">Edit Barber: {name}</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Update profile info and working hours per day of the week.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Barber profile and working hours saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Card */}
        <div className="bg-[#1a1a1a] border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#c9a84c]">
            Staff Profile Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Barber Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#202020] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#c9a84c]"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1">Photo Image URL</label>
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className="w-full bg-[#202020] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#c9a84c]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="activeCheckbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="rounded bg-zinc-800 border-zinc-700 text-[#c9a84c] focus:ring-0"
            />
            <label htmlFor="activeCheckbox" className="text-xs text-zinc-300">
              Active (Visible in customer booking flow)
            </label>
          </div>
        </div>

        {/* Working Hours Schedule Card */}
        <div className="bg-[#1a1a1a] border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#c9a84c] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Working Hours Schedule
          </h2>

          <div className="space-y-3 pt-2">
            {workingHours.map((schedule) => {
              const dayName = dayNames[schedule.day_of_week];

              return (
                <div
                  key={schedule.day_of_week}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border transition-all ${
                    schedule.is_open
                      ? 'bg-[#202020] border-zinc-800'
                      : 'bg-zinc-950/40 border-zinc-900 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3 w-36">
                    <input
                      type="checkbox"
                      id={`day-${schedule.day_of_week}`}
                      checked={schedule.is_open}
                      onChange={() => handleDayToggle(schedule.day_of_week)}
                      className="rounded bg-zinc-800 border-zinc-700 text-[#c9a84c] focus:ring-0"
                    />
                    <label
                      htmlFor={`day-${schedule.day_of_week}`}
                      className="text-xs font-semibold text-white cursor-pointer"
                    >
                      {dayName}
                    </label>
                  </div>

                  {schedule.is_open ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={schedule.start_time.slice(0, 5)}
                        onChange={(e) =>
                          handleTimeChange(schedule.day_of_week, 'start_time', e.target.value)
                        }
                        className="bg-[#2a2a2a] border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white"
                      />
                      <span className="text-xs text-zinc-500">to</span>
                      <input
                        type="time"
                        value={schedule.end_time.slice(0, 5)}
                        onChange={(e) =>
                          handleTimeChange(schedule.day_of_week, 'end_time', e.target.value)
                        }
                        className="bg-[#2a2a2a] border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white"
                      />
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-500 italic">Day Off / Closed</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 px-6 rounded-xl gold-btn text-black font-bold uppercase tracking-wider text-xs shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Updating Barber...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </form>
    </div>
  );
}
