'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { StaffWithHours } from '@/lib/types';
import { Users, PlusCircle, Edit, UserCheck, UserX, Loader2, Clock, User } from 'lucide-react';

export default function AdminStaffListPage() {
  const [staffList, setStaffList] = useState<StaffWithHours[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/staff');
      const data = await res.json();
      if (data.success) {
        setStaffList(data.staff || []);
      }
    } catch (err) {
      console.error('Failed to load staff list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleToggleActive = async (barber: StaffWithHours) => {
    setTogglingId(barber.id);
    try {
      const newStatus = !barber.active;
      const res = await fetch(`/api/admin/staff/${barber.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setStaffList((prev) =>
          prev.map((s) => (s.id === barber.id ? { ...s, active: newStatus } : s))
        );
      }
    } catch (err) {
      console.error('Error toggling staff active state:', err);
    } finally {
      setTogglingId(null);
    }
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white font-serif">Staff Management</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage barbers, profile photos, working schedules, and active status.
          </p>
        </div>

        <Link
          href="/admin/staff/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gold-btn text-black font-bold text-xs uppercase tracking-wider shadow-lg"
        >
          <PlusCircle className="w-4 h-4" />
          Add Staff Member
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center text-zinc-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#c9a84c] mb-2" />
          Loading barbers...
        </div>
      ) : staffList.length === 0 ? (
        <div className="text-center py-16 bg-[#1a1a1a] border border-zinc-800 rounded-2xl">
          <Users className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <p className="text-sm text-zinc-300 font-medium">No barbers configured yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staffList.map((barber) => {
            const openDays = (barber.working_hours || [])
              .filter((h) => h.is_open)
              .map((h) => dayNames[h.day_of_week])
              .join(', ');

            return (
              <div
                key={barber.id}
                className={`bg-[#1a1a1a] border rounded-2xl p-5 flex flex-col justify-between transition-all ${
                  barber.active ? 'border-zinc-800' : 'border-zinc-800/40 opacity-70 bg-zinc-950/40'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-zinc-700 bg-zinc-800 shrink-0">
                        {barber.photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={barber.photo_url}
                            alt={barber.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-500">
                            <User className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">{barber.name}</h3>
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mt-1 ${
                            barber.active
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {barber.active ? 'Active on booking' : 'Deactivated'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Working Days Summary */}
                  <div className="bg-[#202020] rounded-xl p-3 border border-zinc-800/80 text-xs space-y-1.5 mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#c9a84c] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Working Days
                    </span>
                    <p className="text-zinc-300 font-medium">
                      {openDays || 'No active working days'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                  <Link
                    href={`/admin/staff/${barber.id}`}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit Hours
                  </Link>

                  <button
                    onClick={() => handleToggleActive(barber)}
                    disabled={togglingId === barber.id}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      barber.active
                        ? 'bg-red-950/60 hover:bg-red-900 border border-red-900/80 text-red-300'
                        : 'bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-900/80 text-emerald-300'
                    }`}
                  >
                    {barber.active ? (
                      <>
                        <UserX className="w-3.5 h-3.5" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        Reactivate
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
