'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Booking, BookingStatus } from '@/lib/types';
import { formatDateLondon, formatTimeLondon } from '@/lib/dates';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Scissors,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PlusCircle,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/bookings');
      const data = await res.json();
      if (data.success) {
        setBookings(data.bookings || []);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: BookingStatus) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
        );
      }
    } catch (err) {
      console.error('Error updating booking status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter bookings
  const filteredBookings = bookings.filter((b) => {
    if (filterStatus !== 'all' && b.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = `${b.customer_first_name} ${b.customer_last_name}`.toLowerCase().includes(q);
      const matchPhone = b.customer_phone?.toLowerCase().includes(q);
      const matchService = b.service?.name?.toLowerCase().includes(q);
      const matchBarber = b.staff?.name?.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchService && !matchBarber) return false;
    }
    return true;
  });

  // Calculate Metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter((b) => b.start_time.startsWith(todayStr));
  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;
  const completedCount = bookings.filter((b) => b.status === 'completed').length;
  const totalRevenue = bookings
    .filter((b) => b.status === 'completed' || b.status === 'confirmed')
    .reduce((sum, b) => sum + (b.service?.price_gbp || 0), 0);

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
            Confirmed
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-950/80 text-blue-400 border border-blue-800">
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-950/80 text-red-400 border border-red-800">
            Cancelled
          </span>
        );
      case 'no_show':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700">
            No Show
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white font-serif tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Real-time appointment schedule &amp; customer management
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchBookings}
            disabled={loading}
            className="p-2.5 rounded-xl bg-[#1e1e1e] hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/admin/bookings/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gold-btn text-black font-bold text-xs uppercase tracking-wider shadow-lg"
          >
            <PlusCircle className="w-4 h-4" />
            Add Walk-in Booking
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1a1a1a] border border-zinc-800 rounded-2xl p-4 sm:p-5">
          <span className="text-xs uppercase font-medium text-zinc-400 block">Today&apos;s Bookings</span>
          <span className="text-2xl sm:text-3xl font-bold text-white mt-1 block">
            {todayBookings.length}
          </span>
        </div>

        <div className="bg-[#1a1a1a] border border-zinc-800 rounded-2xl p-4 sm:p-5">
          <span className="text-xs uppercase font-medium text-emerald-400 block">Confirmed Active</span>
          <span className="text-2xl sm:text-3xl font-bold text-emerald-400 mt-1 block">
            {confirmedCount}
          </span>
        </div>

        <div className="bg-[#1a1a1a] border border-zinc-800 rounded-2xl p-4 sm:p-5">
          <span className="text-xs uppercase font-medium text-blue-400 block">Completed</span>
          <span className="text-2xl sm:text-3xl font-bold text-blue-400 mt-1 block">
            {completedCount}
          </span>
        </div>

        <div className="bg-[#1a1a1a] border border-zinc-800 rounded-2xl p-4 sm:p-5">
          <span className="text-xs uppercase font-medium text-[#c9a84c] block">Estimated Revenue</span>
          <span className="text-2xl sm:text-3xl font-bold text-[#c9a84c] mt-1 block">
            £{totalRevenue}
          </span>
        </div>
      </div>

      {/* Appointments List Section */}
      <div className="bg-[#1a1a1a] border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search customer, phone, barber..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#222222] border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#c9a84c]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-zinc-500 hidden sm:block" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full sm:w-auto bg-[#222222] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c9a84c]"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>
          </div>
        </div>

        {/* Table or Cards */}
        {loading ? (
          <div className="text-center py-16 text-zinc-400 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#c9a84c] mb-2" />
            Loading appointments...
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-16 bg-[#202020] border border-zinc-800/80 rounded-xl">
            <Calendar className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-zinc-300">No appointments found</p>
            <p className="text-xs text-zinc-500 mt-1">
              {searchQuery ? 'Try adjusting your search query' : 'New bookings will show up here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 uppercase tracking-wider font-semibold">
                  <th className="pb-3 px-3">Date &amp; Time</th>
                  <th className="pb-3 px-3">Customer</th>
                  <th className="pb-3 px-3">Service</th>
                  <th className="pb-3 px-3">Barber</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredBookings.map((b) => {
                  const startDate = new Date(b.start_time);
                  const dateStr = formatDateLondon(startDate);
                  const timeStr = formatTimeLondon(startDate);

                  return (
                    <tr key={b.id} className="hover:bg-zinc-800/30 transition-colors">
                      {/* Date & Time */}
                      <td className="py-4 px-3 whitespace-nowrap">
                        <div className="font-semibold text-white text-sm">{timeStr}</div>
                        <div className="text-zinc-400 text-[11px] mt-0.5">{dateStr}</div>
                      </td>

                      {/* Customer */}
                      <td className="py-4 px-3">
                        <Link
                          href={`/admin/bookings/${b.id}`}
                          className="font-medium text-white hover:text-[#c9a84c] transition-colors block text-sm"
                        >
                          {b.customer_first_name} {b.customer_last_name}
                        </Link>
                        <div className="text-zinc-400 text-[11px] flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-zinc-500" />
                          <a href={`tel:${b.customer_phone}`} className="hover:underline">
                            {b.customer_phone}
                          </a>
                        </div>
                      </td>

                      {/* Service */}
                      <td className="py-4 px-3 whitespace-nowrap">
                        <div className="text-white font-medium">{b.service?.name || 'Haircut'}</div>
                        <div className="text-[#c9a84c] font-semibold text-[11px]">
                          £{b.service?.price_gbp} &bull; {b.service?.duration_minutes}m
                        </div>
                      </td>

                      {/* Barber */}
                      <td className="py-4 px-3 whitespace-nowrap">
                        <div className="text-zinc-300 font-medium">{b.staff?.name || 'Barber'}</div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-3 whitespace-nowrap">{getStatusBadge(b.status)}</td>

                      {/* Actions */}
                      <td className="py-4 px-3 text-right whitespace-nowrap space-x-1">
                        <Link
                          href={`/admin/bookings/${b.id}`}
                          className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-medium inline-block"
                        >
                          Details
                        </Link>

                        {b.status === 'confirmed' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(b.id, 'completed')}
                              disabled={updatingId === b.id}
                              className="px-2 py-1 rounded-lg bg-blue-950/80 hover:bg-blue-900 border border-blue-800 text-blue-300 text-[11px] font-medium"
                              title="Mark as completed"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(b.id, 'no_show')}
                              disabled={updatingId === b.id}
                              className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-[11px] font-medium"
                              title="Mark as no-show"
                            >
                              No Show
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
