'use client';

import React, { useState, useEffect } from 'react';
import { BookingSettings } from '@/lib/types';
import { Settings, Save, Loader2, CheckCircle, AlertCircle, Clock, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<BookingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data.success && data.settings) {
          setSettings(data.settings);
        } else {
          setError('Failed to load settings');
        }
      } catch {
        setError('Error connecting to settings server');
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error || 'Failed to save settings.');
      }
    } catch {
      setError('Network error while saving settings.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-zinc-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#c9a84c] mb-2" />
        Loading shop settings...
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="py-20 text-center text-zinc-400">
        Unable to load settings.
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white font-serif">Booking &amp; Shop Settings</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Configure appointment rules, buffer durations, owner notification emails, and contact details.
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
          <span>Settings saved successfully! New rules take effect immediately.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Booking Rules Card */}
        <div className="bg-[#1a1a1a] border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#c9a84c] flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Booking Rules &amp; Buffers
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Buffer Time (Minutes)
              </label>
              <input
                type="number"
                min="0"
                step="5"
                value={settings.buffer_minutes}
                onChange={(e) =>
                  setSettings({ ...settings, buffer_minutes: parseInt(e.target.value, 10) || 0 })
                }
                className="w-full bg-[#202020] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#c9a84c]"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">Cleaning &amp; prep between cuts</span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Min Advance (Hours)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={settings.min_advance_hours}
                onChange={(e) =>
                  setSettings({ ...settings, min_advance_hours: parseInt(e.target.value, 10) || 0 })
                }
                className="w-full bg-[#202020] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#c9a84c]"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">Earliest customer can book</span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Max Advance (Days)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={settings.max_advance_days}
                onChange={(e) =>
                  setSettings({ ...settings, max_advance_days: parseInt(e.target.value, 10) || 30 })
                }
                className="w-full bg-[#202020] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#c9a84c]"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">Calendar horizon open</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="autoConfirmCheckbox"
              checked={settings.auto_confirm}
              onChange={(e) => setSettings({ ...settings, auto_confirm: e.target.checked })}
              className="rounded bg-zinc-800 border-zinc-700 text-[#c9a84c] focus:ring-0"
            />
            <label htmlFor="autoConfirmCheckbox" className="text-xs text-zinc-300 font-semibold cursor-pointer">
              Auto-confirm bookings (Instant confirmation without manual approval)
            </label>
          </div>
        </div>

        {/* Notifications & Shop Details */}
        <div className="bg-[#1a1a1a] border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#c9a84c] flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Notifications &amp; Contact Details
          </h2>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Owner Notification Email
            </label>
            <input
              type="email"
              required
              value={settings.notification_email}
              onChange={(e) => setSettings({ ...settings, notification_email: e.target.value })}
              className="w-full bg-[#202020] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#c9a84c]"
            />
            <span className="text-[10px] text-zinc-500 mt-1 block">
              Where new booking notifications will be delivered
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Shop Phone
              </label>
              <input
                type="tel"
                value={settings.shop_phone}
                onChange={(e) => setSettings({ ...settings, shop_phone: e.target.value })}
                className="w-full bg-[#202020] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#c9a84c]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Shop Address
              </label>
              <input
                type="text"
                value={settings.shop_address}
                onChange={(e) => setSettings({ ...settings, shop_address: e.target.value })}
                className="w-full bg-[#202020] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#c9a84c]"
              />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-6 rounded-xl gold-btn text-black font-bold uppercase tracking-wider text-xs shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating Settings...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save All Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
