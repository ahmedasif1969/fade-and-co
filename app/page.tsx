import { getActiveServices, getActiveStaff } from '@/lib/db';
import BookingWizard from '@/components/booking/BookingWizard';
import Link from 'next/link';
import { Lock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [services, staff] = await Promise.all([
    getActiveServices(),
    getActiveStaff(),
  ]);

  return (
    <main className="min-h-screen flex flex-col justify-between relative bg-gradient-to-b from-[#121212] via-[#161616] to-[#0f0f0f]">
      {/* Top Navbar */}
      <header className="w-full border-b border-zinc-800/80 bg-[#161616]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-serif text-2xl font-bold tracking-wider text-white group-hover:text-[#c9a84c] transition-colors">
              FADE &amp; CO.
            </span>
          </Link>

          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-[#c9a84c] hover:bg-zinc-800/60 border border-transparent hover:border-zinc-700 transition-all"
          >
            <Lock className="w-3.5 h-3.5" />
            Admin Portal
          </Link>
        </div>
      </header>

      {/* Main Booking Wizard */}
      <div className="flex-1 flex flex-col justify-center">
        <BookingWizard initialServices={services} initialStaff={staff} />
      </div>
    </main>
  );
}
