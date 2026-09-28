'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Staff, Booking } from '@/lib/types';
import { formatTimeLondon, formatDateLondon } from '@/lib/dates';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  User,
  Scissors,
  Loader2,
  Clock,
  PlusCircle,
} from 'lucide-react';

export default function AdminCalendarPage() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);

  // Current week anchor date (defaults to current Monday)
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      const [staffRes, bookingsRes] = await Promise.all([
        fetch('/api/admin/staff'),
        fetch('/api/admin/bookings'),
      ]);
      const staffData = await staffRes.json();
      const bookingsData = await bookingsRes.json();

      if (staffData.success) setStaffList(staffData.staff || []);
      if (bookingsData.success) setBookings(bookingsData.bookings || []);
    } catch (err) {
      console.error('Failed to load calendar data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, []);

  // Compute 7 days of current week
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const day = new Date(currentWeekStart);
    day.setDate(day.getDate() + i);
    return day;
  });

  const prevWeek = () => {
    const prev = new Date(currentWeekStart);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekStart(prev);
  };

  const nextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + 7);
    setCurrentWeekStart(next);
  };

  const jumpToToday = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    setCurrentWeekStart(monday);
  };

  const weekEnd = new Date(currentWeekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  // Filter bookings by staff
  const displayedBookings = bookings.filter((b) => {
    if (selectedStaffId !== 'all' && b.staff_id !== selectedStaffId) return false;
    return true;
  });

  // Helper to group bookings by YYYY-MM-DD
  const getBookingsForDay = (dateObj: Date) => {
    const dateStr = dateObj.toISOString().split('T')[0];
    return displayedBookings
      .filter((b) => b.start_time.startsWith(dateStr))
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white font-serif">
            Calendar Schedule
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Weekly view of all booked slots across barbers
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Staff Filter Dropdown */}
          <select
            value={selectedStaffId}
            onChange={(e) => setSelectedStaffId(e.target.value)}
            className="bg-[#1e1e1e] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c9a84c]"
          >
            <option value="all">All Barbers</option>
            {staffList.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name}
              </option>
            ))}
          </select>

          {/* Week Navigators */}
          <div className="flex items-center bg-[#1e1e1e] border border-zinc-800 rounded-xl p-1">
            <button
              onClick={prevWeek}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 transition-colors"
              title="Previous week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={jumpToToday}
              className="px-2.5 py-1 text-xs font-semibold text-zinc-300 hover:text-white"
            >
              Today
            </button>
            <button
              onClick={nextWeek}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 transition-colors"
              title="Next week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <Link
            href="/admin/bookings/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl gold-btn text-black font-bold text-xs uppercase tracking-wider shadow-lg"
          >
            <PlusCircle className="w-4 h-4" />
            Add Booking
          </Link>
        </div>
      </div>

      {/* Week Title Range */}
      <div className="text-sm font-semibold text-zinc-300">
        Week of {formatDateLondon(currentWeekStart)} &ndash; {formatDateLondon(weekEnd)}
      </div>

      {/* Calendar Week Grid */}
      {loading ? (
        <div className="py-20 text-center text-zinc-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#c9a84c] mb-2" />
          Loading calendar appointments...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDays.map((dayDate) => {
            const dayName = new Intl.DateTimeFormat('en-GB', { weekday: 'short' }).format(dayDate);
            const dayNum = dayDate.getDate();
            const isToday = dayDate.toDateString() === new Date().toDateString();
            const dayBookings = getBookingsForDay(dayDate);

            return (
              <div
                key={dayDate.toISOString()}
                className={`bg-[#1a1a1a] border rounded-2xl flex flex-col min-h-[360px] overflow-hidden ${
                  isToday ? 'border-[#c9a84c]/60 shadow-lg shadow-[#c9a84c]/5' : 'border-zinc-800'
                }`}
              >
                {/* Day Header */}
                <div
                  className={`p-3 text-center border-b ${
                    isToday
                      ? 'bg-[#c9a84c]/10 border-[#c9a84c]/30 text-[#c9a84c]'
                      : 'bg-[#202020] border-zinc-800 text-zinc-300'
                  }`}
                >
                  <div className="text-[11px] uppercase tracking-wider font-semibold">{dayName}</div>
                  <div className={`text-lg font-bold ${isToday ? 'text-[#c9a84c]' : 'text-white'}`}>
                    {dayNum}
                  </div>
                </div>

                {/* Day Slots List */}
                <div className="p-2 flex-1 space-y-2 overflow-y-auto max-h-[480px]">
                  {dayBookings.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center p-4">
                      <span className="text-[11px] text-zinc-600">No bookings</span>
                    </div>
                  ) : (
                    dayBookings.map((b) => {
                      const timeFormatted = formatTimeLondon(new Date(b.start_time));
                      const isCancelled = b.status === 'cancelled';
                      const isCompleted = b.status === 'completed';

                      return (
                        <Link
                          key={b.id}
                          href={`/admin/bookings/${b.id}`}
                          className={`block p-2.5 rounded-xl border text-left transition-all hover:scale-[1.02] ${
                            isCancelled
                              ? 'bg-red-950/20 border-red-900/40 opacity-60'
                              : isCompleted
                              ? 'bg-blue-950/20 border-blue-900/40'
                              : 'bg-[#242424] border-zinc-700/70 hover:border-[#c9a84c]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 text-[11px]">
                            <span className="font-bold text-[#c9a84c] flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {timeFormatted}
                            </span>
                            <span
                              className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold ${
                                b.status === 'confirmed'
                                  ? 'bg-emerald-950 text-emerald-400'
                                  : b.status === 'completed'
                                  ? 'bg-blue-950 text-blue-400'
                                  : 'bg-zinc-800 text-zinc-400'
                              }`}
                            >
                              {b.status}
                            </span>
                          </div>

                          <div className="mt-1.5 font-semibold text-white text-xs truncate">
                            {b.customer_first_name} {b.customer_last_name}
                          </div>

                          <div className="text-[10px] text-zinc-400 truncate mt-0.5">
                            {b.service?.name} &bull; <strong className="text-zinc-300">{b.staff?.name}</strong>
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
