'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export default function AdminEditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [name, setName] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('30');
  const [priceGbp, setPriceGbp] = useState('20');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadService() {
      try {
        const res = await fetch(`/api/admin/services/${id}`);
        const data = await res.json();
        if (data.success && data.service) {
          setName(data.service.name);
          setDurationMinutes(String(data.service.duration_minutes));
          setPriceGbp(String(data.service.price_gbp));
          setDescription(data.service.description || '');
          setActive(data.service.active);
        } else {
          setError('Service not found');
        }
      } catch {
        setError('Error connecting to server');
      } finally {
        setLoading(false);
      }
    }
    loadService();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a service name.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          duration_minutes: parseInt(durationMinutes, 10),
          price_gbp: parseFloat(priceGbp),
          description: description.trim() || null,
          active,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error || 'Failed to update service.');
      }
    } catch {
      setError('Network error while saving service.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-zinc-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#c9a84c] mb-2" />
        Loading service details...
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Link
        href="/admin/services"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-[#c9a84c] transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Services List
      </Link>

      <div>
        <h1 className="text-3xl font-extrabold text-white font-serif">Edit Service: {name}</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Update service name, duration, price, and customer visibility.
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
          <span>Service updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#1a1a1a] border border-zinc-800 rounded-2xl p-6 space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
            Service Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#202020] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#c9a84c]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Duration (Minutes) *
            </label>
            <input
              type="number"
              required
              min="5"
              step="5"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              className="w-full bg-[#202020] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#c9a84c]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Price (£ GBP) *
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.5"
              value={priceGbp}
              onChange={(e) => setPriceGbp(e.target.value)}
              className="w-full bg-[#202020] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#c9a84c]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-[#202020] border border-zinc-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#c9a84c]"
          />
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
            Active (Display to customers in online booking flow)
          </label>
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
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
