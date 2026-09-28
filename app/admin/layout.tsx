'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Scissors,
  LayoutDashboard,
  Calendar,
  PlusCircle,
  Users,
  Layers,
  Clock,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // If on login page, render children directly without admin sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Calendar View', href: '/admin/calendar', icon: Calendar },
    { label: 'Add Booking', href: '/admin/bookings/new', icon: PlusCircle },
    { label: 'Staff Team', href: '/admin/staff', icon: Users },
    { label: 'Services', href: '/admin/services', icon: Layers },
    { label: 'Block Time Off', href: '/admin/availability', icon: Clock },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col md:flex-row text-[#f5f5f7]">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between px-4 h-16 bg-[#181818] border-b border-zinc-800 sticky top-0 z-40">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <Scissors className="w-5 h-5 text-[#c9a84c]" />
          <span className="font-serif font-bold text-lg text-white">Fade &amp; Co.</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-zinc-800 text-zinc-300"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`${
          mobileOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-[#181818] border-r border-zinc-800/80 flex flex-col justify-between shrink-0 fixed md:sticky top-16 md:top-0 h-[calc(100vh-4rem)] md:h-screen z-30 overflow-y-auto`}
      >
        <div>
          {/* Logo Brand in Desktop Sidebar */}
          <div className="hidden md:flex items-center gap-3 px-6 h-20 border-b border-zinc-800/80">
            <div className="w-10 h-10 rounded-xl bg-[#222222] border border-[#c9a84c]/30 flex items-center justify-center">
              <Scissors className="w-5 h-5 text-[#c9a84c]" />
            </div>
            <div>
              <span className="font-serif font-bold text-lg tracking-wide text-white block">
                FADE &amp; CO.
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#c9a84c] font-semibold block">
                Admin Panel
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#c9a84c] text-black font-semibold shadow-lg shadow-[#c9a84c]/10'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-zinc-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Area */}
        <div className="p-4 border-t border-zinc-800/80 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-[#c9a84c] hover:bg-zinc-800/40 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              View Customer Booking
            </span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Admin Page Content */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 bg-[#121212] overflow-y-auto">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
