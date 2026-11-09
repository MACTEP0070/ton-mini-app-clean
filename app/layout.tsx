import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TON Market Minter & Manager',
  description: 'Professional TON Launchpad',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js" async />
      </head>
      <body className="antialiased bg-[#0e121b] text-slate-100 selection:bg-cyan-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
