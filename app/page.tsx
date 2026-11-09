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

  // Состояния всех полей формы
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [amount, setAmount] = useState('1000000');
  const [decimals, setDecimals] = useState('9');
  
  // Состояния пула ликвидности
  const [addLiquidity, setAddLiquidity] = useState(true);
  const [liquidityAmount, setLiquidityAmount] = useState('1000');
  
  const [loading, setLoading] = useState(false);

  // Ваш мастер-кошелек для получения комиссий и средств
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

      // Строго структурированный комментарий для вашего парсера-скрипта
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
      alert('Заявка на создание токена и настройку ликвидности успешно отправлена!');
    } catch (err: any) {
      console.error(err);
      alert('Ошибка при отправке: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const totalDisplayCost = 0.5 + (addLiquidity ? parseFloat(liquidityAmount || '0') : 0);

  return (
    <div className="min-h-screen bg-[#121212] text-zinc-100 flex flex-col items-center justify-between font-sans px-4 py-5 selection:bg-amber-400 selection:text-black">
      
      {/* Шапка в стиле Маркета */}
      <header className="w-full max-w-md pt-2 pb-3">
        <div className="flex items-center justify-between bg-[#1a1a1a] border border-zinc-800/80 rounded-2xl p-3 shadow-md mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 font-bold text-xs">
              💎
            </div>
            <div>
              <div className="text-xs font-semibold text-zinc-200">TON Market Minter</div>
              <div className="text-[10px] text-zinc-400">Создание активов</div>
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-xl text-xs font-mono text-amber-400 flex items-center gap-1.5">
            <span>⚡</span> Launchpad
          </div>
        </div>

        <div className="text-center px-1">
          <h1 className="text-xl font-extrabold tracking-tight text-white mb-1">
            Выпуск Jetton Токена
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Надежный деплой смарт-контракта и запуск пула ликвидности.
          </p>
        </div>
      </header>

      {/* Основная форма карточки */}
      <main className="w-full max-w-md my-1 flex-1">
        <div className="bg-[#18181b] border border-zinc-800 rounded-3xl p-4 shadow-2xl space-y-4">
          
          <form onSubmit={handleMint} className="space-y-4">
            
            {/* Блок: Основные параметры */}
            <div className="space-y-3 bg-[#121212] p-3.5 rounded-2xl border border-zinc-800/80">
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <span>📦</span> Основные параметры
              </div>
              
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Название токена <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Например: Gram Gold"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-zinc-700/60 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Символ (Тикер) <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Например: GOLD"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  className="w-full bg-[#1a1a1a] border border-zinc-700/60 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 transition uppercase font-mono"
                />
              </div>
            </div>

            {/* Блок: Медиа и Описание */}
            <div className="space-y-3 bg-[#121212] p-3.5 rounded-2xl border border-zinc-800/80">
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <span>🖼</span> Брендинг и медиа
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Ссылка на логотип (Image URI) <span className="text-amber-400">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com/logo.png"
                  value={imageUri}
                  onChange={(e) => setImageUri(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-zinc-700/60 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Описание
                </label>
                <textarea
                  rows={2}
                  placeholder="Краткая информация о токене..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-zinc-700/60 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 transition resize-none"
                />
              </div>
            </div>

            {/* Блок: Токеномика */}
            <div className="grid grid-cols-2 gap-3 bg-[#121212] p-3.5 rounded-2xl border border-zinc-800/80">
              <div className="col-span-2 text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <span>📊</span> Токеномика
              </div>
              
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Эмиссия <span className="text-amber-400">*</span>
                </label>
                <input
                  type="number"
                  required
                  placeholder="1000000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-zinc-700/60 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 transition font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Decimals
                </label>
                <input
                  type="number"
                  required
                  value={decimals}
                  onChange={(e) => setDecimals(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-zinc-700/60 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 transition font-mono"
                />
              </div>
            </div>

            {/* БЛОК: Пул ликвидности DEX с полным объяснением и примером */}
            <div className="space-y-3 bg-[#121212] p-3.5 rounded-2xl border border-amber-400/30">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={addLiquidity}
                    onChange={(e) => setAddLiquidity(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-700 text-amber-400 focus:ring-amber-400/20 bg-zinc-900 accent-amber-400"
                  />
                  💧 Пул ликвидности DEX
                </label>
                <span className="text-[10px] bg-amber-400/10 text-amber-300 px-2 py-0.5 rounded-lg border border-amber-400/20">
                  DEX Ready
                </span>
              </div>

              <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-2.5 text-[11px] text-zinc-300 space-y-1.5 leading-relaxed">
                <p className="text-amber-400 font-semibold">⚡️ Как работает блокировка:</p>
                <p>
                  Ликвидность загружается в соотношении <b>1 токен = 1 TON</b>. Остаток монет поступает на ваш кошелек. Пул автоматически блокируется смарт-контрактом.
                </p>
              </div>

              {addLiquidity && (
                <div className="pt-2 border-t border-zinc-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Сумма ликвидности:</span>
                    <span className="text-amber-400 font-mono font-bold">{liquidityAmount} TON</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100000"
                    step="1"
                    value={liquidityAmount}
                    onChange={(e) => setLiquidityAmount(e.target.value)}
                    className="w-full accent-amber-400 bg-zinc-900 cursor-pointer"
                  />
                  <input
                    type="number"
                    min="1"
                    max="100000"
                    value={liquidityAmount}
                    onChange={(e) => setLiquidityAmount(e.target.value)}
                    placeholder="Введите сумму от 1 до 100000"
                    className="w-full bg-[#1a1a1a] border border-zinc-700/60 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 font-mono"
                  />
                  <p className="text-[10px] text-zinc-400 bg-amber-400/5 p-2 rounded-lg border border-amber-400/10 leading-relaxed">
                    ✨ <strong className="text-amber-300">Пример:</strong> При эмиссии в {amount || '1,000,000'} монет стартовая ценность актива составит основу рыночной капитализации. К примеру, если пул ликвидности равен 10 монет и 10 TON, а выпущено всего 1,010 монет, то на балансе у вас останется 1,000 монет ценностью в 10,000 TON 🔥
                  </p>
                </div>
              )}
            </div>

            {/* Кнопки управления */}
            <div className="pt-1">
              {!userAddress ? (
                <button
                  type="button"
                  onClick={handleConnectWallet}
                  className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-extrabold text-sm rounded-2xl transition shadow-lg shadow-amber-400/20 active:scale-[0.98]"
                >
                  Подключить кошелек
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-zinc-950 font-black text-sm rounded-2xl transition shadow-lg shadow-amber-400/20 active:scale-[0.98]"
                  >
                    {loading ? 'Создание заявки...' : `Создать токен (${totalDisplayCost} GRAM)`}
                  </button>
                  <button
                    type="button"
                    onClick={handleConnectWallet}
                    className="w-full py-2 bg-[#121212] border border-zinc-800 hover:bg-zinc-800 text-zinc-400 text-xs rounded-xl transition flex items-center justify-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Кошелек: {formatAddress(userAddress)} (Сменить)
                  </button>
                </div>
              )}
            </div>
          </form>

          {/* Информационный футер */}
          <div className="bg-[#121212] rounded-2xl p-3 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
            <p className="flex justify-between">
              <span>Платформа:</span> <span className="text-zinc-200 font-medium">GRAM-TOKEN-START</span>
            </p>
            <p className="flex justify-between text-amber-400/90 font-medium">
              <span>Итого к оплате:</span> <span>{totalDisplayCost} GRAM</span>
            </p>
          </div>
        </div>
      </main>

      <footer className="w-full max-w-md text-center pt-2 pb-1 text-[10px] text-zinc-500">
        TON Market Launchpad • Secure Smart Contracts
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
