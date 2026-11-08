import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TON Jetton App',
  description: 'Telegram Mini App',
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
      <body className="antialiased bg-slate-900 text-white m-0 p-0">
        {children}
      </body>
    </html>
  );
}
