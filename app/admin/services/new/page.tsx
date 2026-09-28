'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, PlusCircle, Loader2, AlertCircle } from 'lucide-react';

export default function AdminNewServicePage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('30');
  const [priceGbp, setPriceGbp] = useState('20');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a service name.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/services', {
        method: 'POST',
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
        router.push('/admin/services');
      } else {
        setError(data.error || 'Failed to create service.');
        setSubmitting(false);
      }
    } catch {
      setError('Network error while saving service.');
      setSubmitting(false);
    }
  };

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
        <h1 className="text-3xl font-extrabold text-white font-serif">Add New Service</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Create a haircut or treatment option for online booking.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
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
            placeholder="e.g. Skin Fade + Hot Towel"
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
              placeholder="30"
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
              placeholder="25"
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
            placeholder="Detailed description of what is included in this service..."
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
                Saving Service...
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                Create Service
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
