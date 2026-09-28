import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Fade & Co. | Barbershop Manchester',
  description: 'Book your precision haircut, skin fade, or luxury beard sculpt at Fade & Co. Manchester.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark bg-[#121212] text-[#f5f5f7]">
      <body className={`${inter.variable} ${playfair.variable} min-h-screen flex flex-col antialiased selection:bg-[#c9a84c] selection:text-black`}>
        {children}
      </body>
    </html>
  );
}
