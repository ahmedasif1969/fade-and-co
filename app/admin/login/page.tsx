'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Scissors, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/admin/dashboard';

  const [email, setEmail] = useState('hello@fadeandco.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        router.push(redirectPath);
        router.refresh();
      } else {
        setError(data.error || 'Invalid credentials.');
        setLoading(false);
      }
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Branding */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-[#1c1c1c] border border-[#c9a84c]/40 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-[#c9a84c]/10">
          <Scissors className="w-7 h-7 text-[#c9a84c]" />
        </div>
        <h1 className="text-3xl font-extrabold text-white font-serif">Fade &amp; Co.</h1>
        <p className="text-xs uppercase tracking-widest text-[#c9a84c] mt-1 font-semibold">
          Admin Management Portal
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-[#1a1a1a] border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-950/40 border border-red-900/60 flex items-center gap-2.5 text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#202020] border border-zinc-800 rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#c9a84c]"
                placeholder="hello@fadeandco.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#202020] border border-zinc-800 rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#c9a84c]"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl gold-btn text-black font-bold uppercase tracking-wider text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In to Admin'
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="text-center mt-6">
        <a href="/" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          &larr; Return to Customer Booking Page
        </a>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#121212] flex flex-col justify-center items-center px-4">
      <Suspense
        fallback={
          <div className="text-center text-zinc-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#c9a84c] mb-2" />
            Loading portal...
          </div>
        }
      >
        <AdminLoginContent />
      </Suspense>
    </div>
  );
}
