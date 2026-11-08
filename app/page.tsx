'use client';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-900 text-white font-sans">
      <div className="max-w-md w-full bg-slate-800 p-8 rounded-2xl shadow-xl text-center border border-slate-700">
        <h1 className="text-3xl font-bold mb-3 text-cyan-400">TON Jetton Factory</h1>
        <p className="text-slate-300 mb-6 text-sm">
          Telegram Mini App успешно запущен и работает в статическом режиме!
        </p>
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 text-xs text-slate-400">
          Статус: Готов к интеграции TON Connect
        </div>
      </div>
    </main>
  );
}
