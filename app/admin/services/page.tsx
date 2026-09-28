'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Service } from '@/lib/types';
import { Layers, PlusCircle, Edit, Check, X, Loader2, Clock, Scissors } from 'lucide-react';

export default function AdminServicesListPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/services');
      const data = await res.json();
      if (data.success) {
        setServices(data.services || []);
      }
    } catch (err) {
      console.error('Failed to load services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleToggleActive = async (service: Service) => {
    setTogglingId(service.id);
    try {
      const newStatus = !service.active;
      const res = await fetch(`/api/admin/services/${service.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setServices((prev) =>
          prev.map((s) => (s.id === service.id ? { ...s, active: newStatus } : s))
        );
      }
    } catch (err) {
      console.error('Error toggling service active state:', err);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white font-serif">Services Management</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Configure haircuts, treatments, prices, and booking durations.
          </p>
        </div>

        <Link
          href="/admin/services/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gold-btn text-black font-bold text-xs uppercase tracking-wider shadow-lg"
        >
          <PlusCircle className="w-4 h-4" />
          Add New Service
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center text-zinc-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#c9a84c] mb-2" />
          Loading services...
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-16 bg-[#1a1a1a] border border-zinc-800 rounded-2xl">
          <Layers className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <p className="text-sm text-zinc-300 font-medium">No services found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className={`bg-[#1a1a1a] border rounded-2xl p-5 flex flex-col justify-between transition-all ${
                service.active ? 'border-zinc-800' : 'border-zinc-800/40 opacity-70 bg-zinc-950/40'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-[#c9a84c]" />
                    {service.name}
                  </h3>
                  <span className="text-lg font-bold text-[#c9a84c]">
                    £{service.price_gbp}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-zinc-400 mb-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    {service.duration_minutes} minutes
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      service.active
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {service.active ? 'Active' : 'Deactivated'}
                  </span>
                </div>

                {service.description && (
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-4">
                    {service.description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                <Link
                  href={`/admin/services/${service.id}`}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit Service
                </Link>

                <button
                  onClick={() => handleToggleActive(service)}
                  disabled={togglingId === service.id}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    service.active
                      ? 'bg-red-950/60 hover:bg-red-900 border border-red-900/80 text-red-300'
                      : 'bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-900/80 text-emerald-300'
                  }`}
                >
                  {service.active ? 'Deactivate' : 'Reactivate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
