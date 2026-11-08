'use client';

import { TonConnectUIProvider, TonConnectButton } from '@tonconnect/ui-react';

export default function Home() {
  // Манифест с метаданными вашего приложения для TON Connect
  const manifestUrl = 'https://ton-mini-app-clean.vercel.app/tonconnect-manifest.json';

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-900 text-white font-sans">
        <div className="max-w-md w-full bg-slate-800 p-8 rounded-2xl shadow-xl text-center border border-slate-700">
          <h1 className="text-3xl font-bold mb-2 text-cyan-400">TON Jetton Factory</h1>
          <p className="text-slate-300 mb-6 text-sm">
            Telegram Mini App для создания и управления токенами в сети TON
          </p>

          {/* Кнопка подключения кошелька */}
          <div className="flex justify-center mb-6">
            <TonConnectButton />
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 text-xs text-slate-400">
            Подключите кошелек, чтобы приступить к созданию токена
          </div>
        </div>
      </main>
    </TonConnectUIProvider>
  );
}
