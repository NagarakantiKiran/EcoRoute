import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: 'EcoRoute — Every trip. Lighter footprint.',
  description: 'Find the greenest route to your destination and track your carbon savings.',
  keywords: ['eco friendly route', 'carbon footprint', 'green commute', 'sustainable travel'],
  openGraph: {
    title: 'EcoRoute',
    description: 'Find the greenest route to your destination.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body>{children}</body>
    </html>
  );
}
