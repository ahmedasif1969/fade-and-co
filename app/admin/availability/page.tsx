'use client';

import React, { useState, useEffect } from 'react';
import { Staff, BlockedSlot } from '@/lib/types';
import { Clock, PlusCircle, Trash2, Calendar, User, AlertCircle, Loader2, CheckCircle } from 'lucide-react';

export default function AdminAvailabilityPage() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [loading, setLoading] = useState(true);

  // Block form
  const [selectedStaffId, setSelectedStaffId] = useState<string>('all');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isFullDay, setIsFullDay] = useState(false);
  const [startTime, setStartTime] = useState('12:00');
  const [endTime, setEndTime] = useState('14:00');
  const [reason, setReason] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stRes, blkRes] = await Promise.all([
        fetch('/api/admin/staff'),
        fetch('/api/admin/availability'),
      ]);
      const stData = await stRes.json();
      const blkData = await blkRes.json();

      if (stData.success) setStaffList(stData.staff || []);
      if (blkData.success) setBlockedSlots(blkData.blocked_slots || []);
    } catch (err) {
      console.error('Failed to load availability data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/admin/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staff_id: selectedStaffId === 'all' ? null : selectedStaffId,
          date,
          start_time: isFullDay ? '00:00:00' : `${startTime}:00`,
          end_time: isFullDay ? '23:59:59' : `${endTime}:00`,
          is_full_day: isFullDay,
          reason: reason.trim() || null,
        }),
      });

      const data = await res.json();
      if (data.success && data.blocked_slot) {
        setBlockedSlots((prev) => [data.blocked_slot, ...prev]);
        setSuccess('Time off blocked successfully.');
        setReason('');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Failed to block slot.');
      }
    } catch {
      setError('Network error while blocking slot.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBlock = async (id: string) => {
    if (!confirm('Are you sure you want to remove this blocked time off?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/availability/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setBlockedSlots((prev) => prev.filter((b) => b.id !== id));
      }
    } catch (err) {
      console.error('Error deleting block:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-extrabold text-white font-serif">Block Time Off</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Block vacations, breaks, holidays, or maintenance. Blocked times will not appear in the customer booking flow.
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
          <span>{success}</span>
        </div>
      )}

      {/* Block Creation Form */}
      <form onSubmit={handleCreateBlock} className="bg-[#1a1a1a] border border-zinc-800 rounded-2xl p-6 space-y-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#c9a84c] flex items-center gap-2">
          <PlusCircle className="w-4 h-4" />
          Add Blocked Time
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Target Barber / Scope
            </label>
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="w-full bg-[#202020] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#c9a84c]"
            >
              <option value="all">Entire Shop / All Barbers</option>
              {staffList.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#202020] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#c9a84c]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="fullDayCheckbox"
            checked={isFullDay}
            onChange={(e) => setIsFullDay(e.target.checked)}
            className="rounded bg-zinc-800 border-zinc-700 text-[#c9a84c] focus:ring-0"
          />
          <label htmlFor="fullDayCheckbox" className="text-xs text-zinc-300 font-semibold cursor-pointer">
            Block Entire Day
          </label>
        </div>

        {!isFullDay && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Start Time</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-[#202020] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#c9a84c]"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1">End Time</label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-[#202020] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#c9a84c]"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs text-zinc-400 mb-1">Reason / Note (Optional)</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full bg-[#202020] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#c9a84c]"
            placeholder="e.g. Lunch break, Bank Holiday, Barber holiday"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 px-4 rounded-xl gold-btn text-black font-bold uppercase tracking-wider text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving Block...
            </>
          ) : (
            'Block Time Off'
          )}
        </button>
      </form>

      {/* List of active blocked slots */}
      <div className="bg-[#1a1a1a] border border-zinc-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Currently Blocked Slots
        </h2>

        {loading ? (
          <div className="py-12 text-center text-zinc-400 text-xs">
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#c9a84c] mb-2" />
            Loading blocked times...
          </div>
        ) : blockedSlots.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 text-xs">
            No time off blocks currently configured.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/80">
            {blockedSlots.map((block) => (
              <div
                key={block.id}
                className="py-3.5 flex items-center justify-between gap-4 flex-wrap hover:bg-zinc-800/20 px-2 rounded-xl transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Calendar className="w-4 h-4 text-[#c9a84c]" />
                    <span>{block.date}</span>
                    <span className="text-zinc-400 font-normal">
                      ({block.start_time.slice(0, 5)} - {block.end_time.slice(0, 5)})
                    </span>
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5">
                    <strong>Target:</strong>{' '}
                    {block.staff ? block.staff.name : <span className="text-[#c9a84c]">All Staff (Shop-wide)</span>}
                    {block.reason && <span className="ml-2 text-zinc-300">&bull; {block.reason}</span>}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteBlock(block.id)}
                  disabled={deletingId === block.id}
                  className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-900/60 text-red-300 text-xs font-medium flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Remove block"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
