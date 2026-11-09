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

  // Переключение вкладок: 'create' или 'manage'
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');

  // Состояния формы создания
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [amount, setAmount] = useState('1000000');
  const [decimals, setDecimals] = useState('9');
  const [addLiquidity, setAddLiquidity] = useState(true);
  const [liquidityAmount, setLiquidityAmount] = useState('1000');

  // Состояния для управления сторонним/существующим токеном
  const [manageTokenAddress, setManageTokenAddress] = useState('');

  const [loading, setLoading] = useState(false);

  // Ваш мастер-кошелек
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

  // Обработка создания токена
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
      alert('Заявка на создание токена и настройку ликвидности успешно отправлена!');
    } catch (err: any) {
      console.error(err);
      alert('Ошибка при отправке: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  // Обработка запросов на управление (Сжигание, Минт, Отказ от прав)
  const handleAction = async (actionType: string) => {
    if (!userAddress) {
      alert('Пожалуйста, сначала подключите кошелек!');
      return;
    }
    if (!manageTokenAddress) {
      alert('Введите адрес токена (Jetton Master Address)!');
      return;
    }

    setLoading(true);
    try {
      const serviceFee = 0.5; // Фиксированная стоимость действия в TON/GRAM
      const commentText = `ACTION:${actionType} | Token:${manageTokenAddress} | Owner:${userAddress}`;

      const commentCell = beginCell()
        .storeUint(0, 32)
        .storeStringTail(commentText)
        .endCell();

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
          {
            address: FEE_RECIPIENT_ADDRESS,
            amount: toNano(serviceFee.toString()).toString(),
            payload: commentCell.toBoc().toString('base64'),
          },
        ],
      };

      const result = await tonConnectUI.sendTransaction(transaction);
      console.log('Транзакция отправлена:', result);
      alert(`Запрос на "${actionType}" успешно отправлен! Ожидайте выполнения администратором.`);
    } catch (err: any) {
      console.error(err);
      alert('Ошибка при отправке: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const totalDisplayCost = 0.5 + (addLiquidity ? parseFloat(liquidityAmount || '0') : 0);

  return (
    <div className="min-h-screen bg-[#121212] text-zinc-100 flex flex-col items-center justify-between font-sans px-4 py-5 selection:bg-cyan-500 selection:text-white">
      
      {/* Шапка в стиле Маркета */}
      <header className="w-full max-w-md pt-2 pb-3">
        <div className="flex items-center justify-between bg-[#1a1a1a] border border-zinc-800/80 rounded-2xl p-3 shadow-md mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xs">
              💎
            </div>
            <div>
              <div className="text-xs font-semibold text-zinc-200">TON Market Minter</div>
              <div className="text-[10px] text-zinc-400">Launchpad & Manager</div>
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-xl text-xs font-mono text-cyan-400 flex items-center gap-1.5">
            <span>⚡️</span> Pro
          </div>
        </div>

        {/* Переключатель вкладок (Создание / Управление) */}
        <div className="grid grid-cols-2 gap-2 bg-[#18181b] p-1.5 rounded-2xl border border-zinc-800 mb-3">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'create'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            ✨ Создать токен
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manage')}
            className={`py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'manage'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            🛠 Управление
          </button>
        </div>
      </header>

      {/* Основная форма карточки */}
      <main className="w-full max-w-md my-1 flex-1">
        <div className="bg-[#18181b] border border-zinc-800 rounded-3xl p-4 shadow-2xl space-y-4">
          
          {/* ВКЛАДКА 1: СОЗДАНИЕ ТОКЕНА */}
          {activeTab === 'create' && (
            <form onSubmit={handleMint} className="space-y-4">
              
              {/* Основные параметры */}
              <div className="space-y-3 bg-[#121212] p-3.5 rounded-2xl border border-zinc-800/80">
                <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <span>📦</span> Основные параметры
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Название токена <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Например: Gram Gold"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-zinc-700/60 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Символ (Тикер) <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Например: GOLD"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    className="w-full bg-[#1a1a1a] border border-zinc-700/60 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500 transition uppercase font-mono"
                  />
                </div>
              </div>

              {/* Медиа и Описание */}
              <div className="space-y-3 bg-[#121212] p-3.5 rounded-2xl border border-zinc-800/80">
                <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <span>🖼</span> Брендинг и медиа
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Ссылка на логотип (Image URI) <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://example.com/logo.png"
                    value={imageUri}
                    onChange={(e) => setImageUri(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-zinc-700/60 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500 transition"
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
                    className="w-full bg-[#1a1a1a] border border-zinc-700/60 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500 transition resize-none"
                  />
                </div>
              </div>

              {/* Токеномика */}
              <div className="grid grid-cols-2 gap-3 bg-[#121212] p-3.5 rounded-2xl border border-zinc-800/80">
                <div className="col-span-2 text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <span>📊</span> Токеномика
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Эмиссия <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="1000000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-zinc-700/60 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500 transition font-mono"
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
                    className="w-full bg-[#1a1a1a] border border-zinc-700/60 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500 transition font-mono"
                  />
                </div>
              </div>

              {/* Пул ликвидности */}
              <div className="space-y-3 bg-[#121212] p-3.5 rounded-2xl border border-cyan-500/30">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={addLiquidity}
                      onChange={(e) => setAddLiquidity(e.target.checked)}
                      className="w-4 h-4 rounded border-zinc-700 text-cyan-500 focus:ring-cyan-500/20 bg-zinc-900 accent-cyan-400"
                    />
                    💧 Пул ликвидности DEX
                  </label>
                  <span className="text-[10px] bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded-lg border border-cyan-500/20">
                    DEX Ready
                  </span>
                </div>

                {addLiquidity && (
                  <div className="pt-2 border-t border-zinc-800 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-400">Сумма ликвидности:</span>
                      <span className="text-cyan-400 font-mono font-bold">{liquidityAmount} TON</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="100000"
                      step="1"
                      value={liquidityAmount}
                      onChange={(e) => setLiquidityAmount(e.target.value)}
                      className="w-full accent-cyan-400 bg-zinc-900 cursor-pointer"
                    />
                    <input
                      type="number"
                      min="1"
                      max="100000"
                      value={liquidityAmount}
                      onChange={(e) => setLiquidityAmount(e.target.value)}
                      placeholder="Введите сумму от 1 до 100000"
                      className="w-full bg-[#1a1a1a] border border-zinc-700/60 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Кнопка отправки создания или подключения кошелька */}
              <div className="pt-1">
                {!userAddress ? (
                  <button
                    type="button"
                    onClick={handleConnectWallet}
                    className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm rounded-2xl transition shadow-lg shadow-cyan-500/25 active:scale-[0.98]"
                  >
                    Подключить кошелек
                  </button>
                ) : (
                  <div className="space-y-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 disabled:opacity-50 text-zinc-950 font-black text-sm rounded-2xl transition shadow-xl shadow-cyan-500/30 active:scale-[0.98]"
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
          )}

          {/* ВКЛАДКА 2: УПРАВЛЕНИЕ ТОКЕНОМ (МЕНЕДЖЕР) */}
          {activeTab === 'manage' && (
            <div className="space-y-4">
              <div className="bg-[#121212] p-3.5 rounded-2xl border border-zinc-800/80 space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <span>⚙️</span> Панель администратора токена
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Управляйте токеном, созданным как у нас, так и на любой другой платформе. Каждое действие стоит <strong className="text-cyan-400">0.5 TON</strong>.
                </p>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Адрес токена (Jetton Master Address) <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="EQ..."
                    value={manageTokenAddress}
                    onChange={(e) => setManageTokenAddress(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-zinc-700/60 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500 font-mono transition"
                  />
                </div>
              </div>

              {/* Кнопки действий */}
              <div className="grid grid-cols-1 gap-2.5">
                <div className="bg-[#121212] p-3 rounded-2xl border border-zinc-800/80 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-zinc-200">🔥 Сжечь токены (Burn)</div>
                    <div className="text-[10px] text-zinc-400">Уменьшить эмиссию в обращении</div>
                  </div>
                  <button
                    type="button"
                    disabled={loading || !userAddress}
                    onClick={() => handleAction('BURN')}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shadow"
                  >
                    Сжечь (0.5 TON)
                  </button>
                </div>

                <div className="bg-[#121212] p-3 rounded-2xl border border-zinc-800/80 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-zinc-200">🪙 Доминтить (Mint)</div>
                    <div className="text-[10px] text-zinc-400">Выпустить дополнительные монеты</div>
                  </div>
                  <button
                    type="button"
                    disabled={loading || !userAddress}
                    onClick={() => handleAction('MINT')}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shadow"
                  >
                    Минт (0.5 TON)
                  </button>
                
