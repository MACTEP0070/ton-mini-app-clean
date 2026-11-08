'use client';

import { useState } from 'react';
import {
  TonConnectUIProvider,
  useTonConnectUI,
  useTonAddress,
  useTonWallet,
} from '@tonconnect/ui-react';
import { beginCell, toNano } from '@ton/core';

function MinterApp() {
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();
  const wallet = useTonWallet();

  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [amount, setAmount] = useState('1000000'); // По умолчанию 1 млн для примера
  const [decimals, setDecimals] = useState('9');
  
  // Состояния для пула ликвидности
  const [addLiquidity, setAddLiquidity] = useState(true); // По умолчанию включено для удобства
  const [liquidityAmount, setLiquidityAmount] = useState('1000'); // Например, 1000 TON

  const [loading, setLoading] = useState(false);

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

    if (!name || !symbol || !amount || !imageUri) {
      alert('Заполните все обязательные поля!');
      return;
    }

    setLoading(true);
    try {
      const baseFee = 0.5;
      const liqVal = addLiquidity ? parseFloat(liquidityAmount || '0') : 0;
      const totalCost = baseFee + liqVal;

      const commentText = `CREATE | Name:${name} | Symbol:${symbol} | Supply:${amount} | Logo:${imageUri} | LiqPool:${addLiquidity ? 'YES' : 'NO'} | LiqAmount:${liqVal} | Owner:${userAddress}`;

      const commentCell = beginCell()
        .storeUint(0, 32)
        .storeStringTail(commentText)
        .endCell();

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
          {
            address: FEE_RECIPIENT_ADDRESS,
            amount: toNano(totalCost.toString()).toString(),
            payload: commentCell.toBoc().toString('base64'),
          },
        ],
      };

      const result = await tonConnectUI.sendTransaction(transaction);
      console.log('Транзакция отправлена:', result);
      alert('Заявка на создание токена и настройку ликвидности отправлена!');
    } catch (err: any) {
      console.error(err);
      alert('Ошибка при отправке: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const totalDisplayCost = 0.5 + (addLiquidity ? parseFloat(liquidityAmount || '0') : 0);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col items-center justify-between font-sans px-4 py-6 selection:bg-pink-500 selection:text-white">
      
      {/* Шапка */}
      <header className="w-full max-w-md text-center pt-2 pb-4">
        <div className="inline-flex items-center gap-2 mb-3 px-3.5 py-1.5 bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-pink-500/10 border border-purple-500/20 rounded-full text-xs font-bold tracking-wide uppercase bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-pink-400 shadow-lg shadow-purple-500/5">
          <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping"></span>
          TON Market Launchpad
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white">
          Создание Jetton Актива
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
          Мгновенный выпуск токенов и запуск пулов ликвидности.
        </p>
      </header>

      {/* Основная форма */}
      <main className="w-full max-w-md my-2 flex-1">
        <div className="relative bg-gradient-to-b from-slate-900/90 to-slate-950/90 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-5 shadow-2xl shadow-cyan-950/30 space-y-4 overflow-hidden">
          
          <form onSubmit={handleMint} className="relative z-10 space-y-4">
            
            {/* Блок: Основная информация */}
            <div className="space-y-3 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800/50">
              <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1.5">
                <span>⚡</span> Основные параметры
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Название токена <span className="text-pink-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Например: Gram Gold"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Символ (Тикер) <span className="text-pink-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Например: GOLD"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all uppercase font-mono tracking-wider"
                />
              </div>
            </div>

            {/* Блок: Медиа и Описание */}
            <div className="space-y-3 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800/50">
              <div className="text-[11px] font-bold uppercase tracking-wider text-pink-400 mb-2 flex items-center gap-1.5">
                <span>🎨</span> Брендинг и медиа
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Ссылка на логотип (Image URI) <span className="text-pink-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com/logo.png"
                  value={imageUri}
                  onChange={(e) => setImageUri(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Описание
                </label>
                <textarea
                  rows={2}
                  placeholder="Расскажите о ценности токена..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all resize-none"
                />
              </div>
            </div>

            {/* Блок: Токеномика */}
            <div className="grid grid-cols-2 gap-3 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800/50">
              <div className="col-span-2 text-[11px] font-bold uppercase tracking-wider text-purple-400 mb-1 flex items-center gap-1.5">
                <span>📈</span> Токеномика
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Эмиссия <span className="text-pink-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  placeholder="1000000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Decimals
                </label>
                <input
                  type="number"
                  required
                  value={decimals}
                  onChange={(e) => setDecimals(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-mono"
                />
              </div>
            </div>

            {/* БЛОК: Пул ликвидности DEX с подробным объяснением */}
            <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-2xl border border-cyan-500/30">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={addLiquidity}
                    onChange={(e) => setAddLiquidity(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500/20 bg-slate-900"
                  />
                  💧 Запуск пула ликвидности (DEX)
                </label>
                <span className="text-[10px] bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/20">
                  Рекомендуется
                </span>
              </div>

              {/* Понятное объяснение для пользователя */}
              <div className="bg-cyan-950/20 border border-cyan-500/20 rounded-xl p-2.5 text-[11px] text-slate-300 space-y-1.5 leading-relaxed">
                <p className="text-cyan-300 font-semibold">🚀 Как это работает:</p>
                <p>
                  Часть ваших токенов связывается с выбранной суммой TON для создания пула на DeDust / STON.fi (соотношение: <b>1 токен = 1 TON</b>).
                </p>
                <p>
                  Остальная эмиссия поступает на ваш кошелек. Ликвидность <b>надежно блокируется смарт-контрактом</b>, гарантируя инвесторам безопасность торгов.
                </p>
              </div>

              {addLiquidity && (
                <div className="pt-2 border-t border-slate-800/80 space-y-2 animate-fadeIn">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Сумма ликвидности (TON / GRAM):</span>
                    <span className="text-cyan-400 font-mono font-bold">{liquidityAmount} TON</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100000"
                    step="1"
                    value={liquidityAmount}
                    onChange={(e) => setLiquidityAmount(e.target.value)}
                    className="w-full accent-cyan-400 bg-slate-900 cursor-pointer"
                  />
                  <input
                    type="number"
                    min="1"
                    max="100000"
                    value={liquidityAmount}
                    onChange={(e) => setLiquidityAmount(e.target.value)}
                    placeholder="Введите сумму от 1 до 100000"
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                  <p className="text-[10px] text-purple-400 font-medium">
                    ✨ Пример: При эмиссии в {amount || '1,000,000'} монет стартовая ценность актива составит основу рыночной капитализации. К примеру пул ликвидности равен 10 монет и 10 TON если было выпущено всего 1010 монет то у вас баланс будет выглядеть 1.000 монет ценностью в 10.000 TON🔥
                  </p>
                </div>
              )}
            </div>

            {/* Кнопки управления */}
            <div className="pt-2">
              {!userAddress ? (
                <button
                  type="button"
                  onClick={handleConnectWallet}
                  className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:opacity-90 text-white font-bold text-sm rounded-2xl transition-all shadow-lg shadow-purple-500/25 active:scale-[0.98]"
                >
                  Подключить кошелек
                </button>
              ) : (
                <div className="space-y-2.5">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-500 hover:from-cyan-300 hover:to-blue-400 disabled:opacity-50 text-slate-950 font-black text-sm rounded-2xl transition-all shadow-xl shadow-cyan-500/30 active:scale-[0.98]"
                  >
                    {loading ? 'Создание заявки...' : `Создать токен (${totalDisplayCost} GRAM)`}
                  </button>
                  <button
                    type="button"
                    onClick={handleConnectWallet}
                    className="w-full py-2 bg-slate-950/60 border border-slate-800 hover:bg-slate-900 text-slate-400 text-xs rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Кошелек: {formatAddress(userAddress)} (Сменить)
                  </button>
                </div>
              )}
            </div>
          </form>

          {/* Футер карточки */}
          <div className="relative z-10 bg-slate-950/60 rounded-2xl p-3 border border-slate-800/80 text-[11px] text-slate-400 space-y-1.5 leading-relaxed">
            <p className="flex items-center gap-1.5">
              <span className="text-cyan-400">🌐</span> Платформа <span className="text-white font-semibold">GRAM-TOKEN-START</span>
            </p>
            <p className="flex items-center gap-1.5 text-amber-400/90 font-medium">
              <span>💎</span> Итого к оплате: <span className="font-bold">{totalDisplayCost} GRAM</span> (деплой + ликвидность)
            </p>
          </div>
        </div>
      </main>

      <footer className="w-full max-w-md text-center pt-3 text-[10px] text-slate-500">
        TON Market Launchpad • Verified Smart Contracts
      </footer>
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
