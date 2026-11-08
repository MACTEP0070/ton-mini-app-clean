'use client';

import { useState } from 'react';
import { TonConnectUIProvider, TonConnectButton, useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';

function MintForm() {
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();

  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [decimals, setDecimals] = useState('9');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAddress) {
      alert('Пожалуйста, сначала подключите кошелек TON!');
      return;
    }

    setLoading(true);
    try {
      // Здесь на следующем шаге будет подключаться смарт-контракт Jetton Minter
      console.log('Параметры токена:', { name, symbol, decimals, amount, description, imageUri });
      alert(`Готово к деплою! Токен: ${name} (${symbol}), Эмиссия: ${amount}`);
    } catch (err: any) {
      console.error(err);
      alert('Ошибка подготовки транзакции: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg w-full bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700">
      <h1 className="text-3xl font-bold mb-2 text-cyan-400 text-center">TON Jetton Deployer</h1>
      <p className="text-slate-300 mb-6 text-sm text-center">
        Заполните параметры для выпуска собственного токена на TON
      </p>

      <div className="flex justify-center mb-6">
        <TonConnectButton />
      </div>

      {userAddress ? (
        <form onSubmit={handleMint} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Название токена (Name)</label>
            <input
              type="text"
              required
              placeholder="например, My Super Jetton"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Символ / Тикер</label>
              <input
                type="text"
                required
                placeholder="JETTON"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Десятичные (Decimals)</label>
              <input
                type="number"
                required
                value={decimals}
                onChange={(e) => setDecimals(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Общая эмиссия (Total Supply)</label>
            <input
              type="number"
              required
              placeholder="1000000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Описание (Description)</label>
            <textarea
              placeholder="Краткое описание жетона..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 h-20 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Ссылка на логотип (Image URL)</label>
            <input
              type="url"
              placeholder="https://example.com/logo.png"
              value={imageUri}
              onChange={(e) => setImageUri(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 font-bold rounded-xl text-white hover:opacity-90 transition cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Подготовка...' : 'Выпустить Jetton'}
          </button>
        </form>
      ) : (
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 text-center text-xs text-slate-400">
          Подключите кошелек вверху, чтобы разблокировать форму настройки жетона
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const manifestUrl = 'https://ton-mini-app-clean.vercel.app/tonconnect-manifest.json';

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-slate-900 text-white font-sans">
        <MintForm />
      </main>
    </TonConnectUIProvider>
  );
}
