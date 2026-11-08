'use client';

import { useState } from 'react';
import {
  TonConnectUIProvider,
  useTonConnectUI,
  useTonAddress,
  useTonWallet,
} from '@tonconnect/ui-react';
import { beginCell, toNano, Address } from '@ton/core';

function MinterApp() {
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();
  const wallet = useTonWallet();

  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [amount, setAmount] = useState('');
  const [decimals, setDecimals] = useState('9');
  const [loading, setLoading] = useState(false);

  // Ваш кошелек для получения комиссии 0.25 GRAM
  const FEE_RECIPIENT_ADDRESS = 'UQAIOSFdlxtGH5SMRrFM216SFPj295rUDyQs6-gp_Ab_dm2g';

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  const handleConnectWallet = () => {
    if (wallet) {
      tonConnectUI.disconnect();
    } else {
      tonConnectUI.openModal();
    }
  };

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAddress) {
      alert('Пожалуйста, сначала подключите кошелек!');
      return;
    }

    setLoading(true);
    try {
      const ownerAddr = Address.parse(userAddress);

      // Формируем полезную нагрузку (payload) для контракта токена
      const bodyCell = beginCell()
        .storeUint(21, 32) // Opcode для инициализации минта
        .storeUint(0, 64)  // Query ID
        .storeAddress(ownerAddr)
        .storeCoins(toNano(amount || '0'))
        .endCell();

      // Пакет транзакции: 0.25 вам (комиссия) + 0.25 на создание токена
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
          {
            address: FEE_RECIPIENT_ADDRESS,
            amount: toNano('0.25').toString(), // Открытая комиссия сервиса
          },
          {
            address: userAddress,
            amount: toNano('0.25').toString(), // Газ и деплой смарт-контракта токена
            payload: bodyCell.toBoc().toString('base64'),
          },
        ],
      };

      const result = await tonConnectUI.sendTransaction(transaction);
      console.log('Транзакция отправлена:', result);
      alert('Успешно! Запрос на создание токена отправлен в сеть.');
    } catch (err: any) {
      console.error(err);
      alert('Ошибка при отправке: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col items-center justify-between font-sans pb-8">
      {/* Шапка / Заголовок */}
      <header className="w-full max-w-md px-4 pt-6 pb-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
          Выпустите свой первый токен
        </h1>
        <p className="text-xs text-slate-400 leading-relaxed px-2">
          Заполните форму ниже, чтобы создать токен на базе стандарта Jetton. Процесс занимает меньше минуты.
        </p>
      </header>

      {/* Основной контейнер формы */}
      <main className="w-full max-w-md px-4 my-4 flex-1">
        <div className="bg-[#1e293b] border border-slate-700/60 rounded-2xl p-5 shadow-2xl space-y-4">
          <form onSubmit={handleMint} className="space-y-4">
            
            {/* Название токена */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Название токена <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Например: Gram Gold"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>

            {/* Символ / Тикер */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Символ (Тикер) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Например: GOLD"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>

            {/* Изображение (URL) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Ссылка на логотип (Image URI)
              </label>
              <input
                type="url"
                placeholder="https://site.com/logo.png"
                value={imageUri}
                onChange={(e) => setImageUri(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>

            {/* Описание */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Описание
              </label>
              <textarea
                rows={3}
                placeholder="Опишите назначение и особенности вашего жетона..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition resize-none"
              />
            </div>

            {/* Количество эмиссии и Decimals в сетке */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Эмиссия <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  required
                  placeholder="1000000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Decimals
                </label>
                <input
                  type="number"
                  required
                  value={decimals}
                  onChange={(e) => setDecimals(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>

            {/* Динамическая кнопка авторизации / выпуска */}
            <div className="pt-2">
              {!userAddress ? (
                <button
                  type="button"
                  onClick={handleConnectWallet}
                  className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
                >
                  Подключить кошелек
                </button>
              ) : (
                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
                  >
                    {loading ? 'Создание...' : 'Создать токен'}
                  </button>
                  <button
                    type="button"
                    onClick={handleConnectWallet}
                    className="w-full py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-400 text-xs rounded-xl transition"
                  >
                    Подключен: {formatAddress(userAddress)} (Отключить)
                  </button>
                </div>
              )}
            </div>
          </form>

          {/* Информационный блок */}
          <div className="bg-[#0f172a]/70 rounded-xl p-3.5 border border-slate-800 text-[11px] text-slate-400 space-y-2 leading-relaxed">
            <p>
              Токен появится на сайте <span className="text-cyan-400 font-semibold">GRAM-TOKEN-START</span> сразу после создания, но статистика и данные будут отображаться только после первых торгов.
            </p>
            <p className="text-amber-400/90 font-medium">
              Общая стоимость создания: 0.5 GRAM (0.25 GRAM на деплой + 0.25 GRAM комиссия сервиса).
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  const manifestUrl = 'https://ton-mini-app-clean.vercel.app/tonconnect-manifest.json';

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <MinterApp />
    </TonConnectUIProvider>
  );
}
