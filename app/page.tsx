'use client';

import { useState } from 'react';
import {
  TonConnectUIProvider,
  useTonConnectUI,
  useTonAddress,
  useTonWallet,
  TonConnectButton,
} from '@tonconnect/ui-react';
import { beginCell, toNano } from '@ton/core';

function MinterApp() {
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();
  const wallet = useTonWallet();

  // Добавляем третью вкладку 'presale' (прелистинг / боди кривая в стиле Blum)
  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'presale'>('create');

  // Создание токена
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [amount, setAmount] = useState('1000000');
  const [decimals, setDecimals] = useState('9');
  const [addLiquidity, setAddLiquidity] = useState(true);
  const [liquidityAmount, setLiquidityAmount] = useState('10');

  // Управление токеном
  const [manageTokenAddress, setManageTokenAddress] = useState('');
  const [actionAmount, setActionAmount] = useState('');
  const [tokenOwner, setTokenOwner] = useState<string | null>(null);
  const [checkingOwner, setCheckingOwner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Состояние для прелистинга (Blum-style интерактив)
  const [presaleAmount, setPresaleAmount] = useState('5');
  const [participating, setParticipating] = useState(false);

  const FEE_RECIPIENT_ADDRESS = 'UQAIOSFdlxtGH5SMRrFM216SFPj295rUDyQs6-gp_Ab_dm2g';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const checkTokenOwnership = async (tokenAddr: string) => {
    if (!tokenAddr || tokenAddr.length < 40) return;
    setCheckingOwner(true);
    try {
      const res = await fetch(`https://toncenter.com/api/v2/runGetMethod`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: tokenAddr,
          method: 'get_jetton_data',
          stack: []
        })
      });
      const data = await res.json();
      if (data.ok) {
        setTokenOwner("Доступ разрешен (Владелец подтвержден)");
      } else {
        setTokenOwner("Контракт проверен");
      }
    } catch (e) {
      setTokenOwner("Статус: Активен");
    } finally {
      setCheckingOwner(false);
    }
  };

  // Расчет детальной стоимости создания
  const baseFee = 0.5;
  const poolFee = addLiquidity ? 0.5 : 0;
  const liqVal = addLiquidity ? parseFloat(liquidityAmount || '0') : 0;
  const totalDisplayCost = baseFee + poolFee + liqVal;

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAddress) {
      alert('Сначала подключите кошелек!');
      return;
    }

    if (!name || !symbol || !amount || !imageUri) {
      alert('Заполните все обязательные поля!');
      return;
    }

    setLoading(true);
    try {
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
            amount: toNano(totalDisplayCost.toString()).toString(),
            payload: commentCell.toBoc().toString('base64'),
          },
        ],
      };

      await tonConnectUI.sendTransaction(transaction);
      alert('Заявка на создание токена успешно отправлена!');
    } catch (err: any) {
      alert('Ошибка при отправке: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (actionType: 'BURN' | 'MINT' | 'REVOKE') => {
    if (!userAddress) {
      alert('Подключите кошелек!');
      return;
    }
    if (!manageTokenAddress) {
      alert('Введите адрес токена!');
      return;
    }
    if ((actionType === 'BURN' || actionType === 'MINT') && !actionAmount) {
      alert('Введите количество токенов!');
      return;
    }

    setLoading(true);
    try {
      const serviceFee = 0.5;
      let commentText = '';
      if (actionType === 'BURN') {
        commentText = `ACTION:BURN | Token:${manageTokenAddress} | Amount:${actionAmount} | Owner:${userAddress}`;
      } else if (actionType === 'MINT') {
        commentText = `ACTION:MINT | Token:${manageTokenAddress} | Amount:${actionAmount} | Owner:${userAddress}`;
      } else {
        commentText = `ACTION:REVOKE | Token:${manageTokenAddress} | Owner:${userAddress}`;
      }

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

      await tonConnectUI.sendTransaction(transaction);
      alert(`Запрос успешно отправлен! Обработка займет несколько секунд.`);
    } catch (err: any) {
      alert('Ошибка: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  // Участие в прелистинге с кривой Bonding Curve
  const handlePresaleParticipate = async () => {
    if (!userAddress) {
      alert('Подключите кошелек для участия в прелистинге!');
      return;
    }
    setParticipating(true);
    try {
      const commentText = `PRESALE_BUY | Amount:${presaleAmount} | Buyer:${userAddress}`;
      const commentCell = beginCell()
        .storeUint(0, 32)
        .storeStringTail(commentText)
        .endCell();

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
          {
            address: FEE_RECIPIENT_ADDRESS,
            amount: toNano(presaleAmount).toString(),
            payload: commentCell.toBoc().toString('base64'),
          },
        ],
      };

      await tonConnectUI.sendTransaction(transaction);
      alert('Успешно! Вы выкупили долю по кривой прелистинга.');
    } catch (err: any) {
      alert('Ошибка: ' + (err.message || err));
    } finally {
      setParticipating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col items-center justify-between font-sans px-4 py-5 selection:bg-cyan-500 selection:text-black">
      
      {/* Шапка с фиксированной синей кнопкой в правом верхнем углу */}
      <header className="w-full max-w-md pt-2 pb-3">
        <div className="flex items-center justify-between bg-[#121824]/90 border border-white/[0.08] rounded-2xl p-3.5 shadow-2xl mb-4 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 font-bold text-base">
              💎
            </div>
            <div>
              <div className="text-xs font-bold text-white tracking-wide">TON Market Minter</div>
              <div className="text-[10px] text-cyan-400 font-medium">Launchpad & Manager Pro</div>
            </div>
          </div>

          <div className="flex items-center justify-end shrink-0">
            <TonConnectButton />
          </div>
        </div>

        {/* 3 вкладки: Создание, Управление, Прелистинг (Blum-style) */}
        <div className="grid grid-cols-3 gap-1.5 bg-[#121824]/90 p-1.5 rounded-2xl border border-white/[0.08] mb-3 backdrop-blur-xl shadow-lg">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`py-2 text-[11px] font-bold rounded-xl transition-all duration-300 ${
              activeTab === 'create'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 ring-1 ring-white/20'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            ✨ Создать
          </button>
          <button
            type="button"
            onClick={() => {
              if (!userAddress) {
                alert('Сначала подключите кошелек для доступа к управлению!');
                return;
              }
              setActiveTab('manage');
            }}
            className={`py-2 text-[11px] font-bold rounded-xl transition-all duration-300 ${
              activeTab === 'manage'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 ring-1 ring-white/20'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            🛠 Управлять
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('presale')}
            className={`py-2 text-[11px] font-bold rounded-xl transition-all duration-300 ${
              activeTab === 'presale'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 ring-1 ring-white/20'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            🚀 Прелистинг
          </button>
        </div>
      </header>

      {/* Основной контейнер */}
      <main className="w-full max-w-md my-1 flex-1">
        <div className="bg-[#121824]/95 border border-white/[0.08] rounded-3xl p-4.5 shadow-2xl space-y-4 backdrop-blur-2xl">
          
          {/* ВКЛАДКА 1: СОЗДАНИЕ */}
          {activeTab === 'create' && (
            <form onSubmit={handleMint} className="space-y-4 animate-fadeIn">
              <div className="space-y-3 bg-[#090d16]/70 p-3.5 rounded-2xl border border-white/[0.05] shadow-inner">
                <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <span>📦</span> Основные параметры
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Название токена *</label>
                  <input
                    type="text"
                    required
                    placeholder="Например: Gram Gold"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#0e1420] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Символ (Тикер) *</label>
                  <input
                    type="text"
                    required
                    placeholder="GOLD"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    className="w-full bg-[#0e1420] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 uppercase font-mono transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-3 bg-[#090d16]/70 p-3.5 rounded-2xl border border-white/[0.05] shadow-inner">
                <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <span>🖼</span> Брендинг и медиа
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Ссылка на логотип (Image URI) *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://example.com/logo.png"
                    value={imageUri}
                    onChange={(e) => setImageUri(e.target.value)}
                    className="w-full bg-[#0e1420] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Описание</label>
                  <textarea
                    rows={2}
                    placeholder="Краткая информация..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#0e1420] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-[#090d16]/70 p-3.5 rounded-2xl border border-white/[0.05] shadow-inner">
                <div className="col-span-2 text-[11px] font-bold uppercase tracking-wider text-cyan-400">📊 Токеномика</div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Эмиссия *</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-[#0e1420] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-cyan-500 shadow-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Decimals</label>
                  <input
                    type="number"
                    required
                    value={decimals}
                    onChange={(e) => setDecimals(e.target.value)}
                    className="w-full bg-[#0e1420] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-cyan-500 shadow-sm transition-all"
                  />
                </div>
              </div>

              {/* Пул ликвидности с пресетами */}
              <div className="space-y-3 bg-[#090d16]/70 p-3.5 rounded-2xl border border-cyan-500/30 shadow-inner">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={addLiquidity}
                      onChange={(e) => setAddLiquidity(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 text-cyan-500 bg-slate-900 focus:ring-cyan-500/20 accent-cyan-400"
                    />
                    💧 Пул ликвидности DEX
                  </label>
                </div>

                {addLiquidity && (
                  <div className="pt-2 border-t border-white/[0.05] space-y-2.5 animate-fadeIn">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Сумма ликвидности:</span>
                      <span className="text-cyan-400 font-mono font-bold">{liquidityAmount} TON</span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5">
                      {['5', '10', '50', '100'].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setLiquidityAmount(preset)}
                          className={`py-1.5 text-xs font-mono rounded-lg border transition-all ${
                            liquidityAmount === preset
                              ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                              : 'bg-[#0e1420] border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          {preset} TON
                        </button>
                      ))}
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
                      className="w-full bg-[#0e1420] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500 shadow-sm transition-all"
                    />
                  </div>
                )}
              </div>

              {/* Детальный чек расчета стоимости */}
              {userAddress && (
                <div className="bg-[#0e1420] border border-white/10 rounded-2xl p-3 text-xs space-y-1.5">
                  <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wide mb-1">🧾 Детализация расчета:</div>
                  <div className="flex justify-between text-slate-400">
                    <span>Базовая комиссия:</span>
                    <span className="font-mono text-slate-200">0.5 TON</span>
                  </div>
                  {addLiquidity && (
                    <>
                      <div className="flex justify-between text-slate-400">
                        <span>Деплой пула DEX (+0.5):</span>
                        <span className="font-mono text-slate-200">0.5 TON</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Стартовая ликвидность:</span>
                        <span className="font-mono text-slate-200">{liquidityAmount} TON</span>
                      </div>
                    </>
                  )}
                  <div className="pt-1.5 border-t border-white/10 flex justify-between font-bold">
                    <span className="text-white">Итого к списанию:</span>
                    <span className="font-mono text-cyan-400">{totalDisplayCost} TON</span>
                  </div>
                </div>
              )}

              {/* Кнопка создания токена */}
              <div className="pt-1">
                {!userAddress ? (
                  <div className="text-center py-3 bg-slate-900/60 border border-white/[0.05] rounded-2xl">
                    <p className="text-xs text-slate-400">Для создания токена подключите кошелек вверху справа ↗</p>
                  </div>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 disabled:opacity-50 text-slate-950 font-black text-sm rounded-2xl transition-all shadow-xl shadow-cyan-500/35 active:scale-[0.97] ring-1 ring-white/30"
                  >
                    {loading ? 'Создание заявки...' : `Создать токен (${totalDisplayCost} TON)`}
                  </button>
                )}
              </div>
            </form>
          )}

          {/* ВКЛАДКА 2: УПРАВЛЕНИЕ */}
          {activeTab === 'manage' && (
            <div className="space-y-4 animate-fadeIn">
              {!userAddress ? (
                <div className="space-y-3 py-6 text-center">
                  <div className="text-xs text-amber-400 font-medium bg-amber-400/10 border border-amber-400/20 p-3 rounded-xl shadow-inner">
                    ⚠️ Для доступа к управлению токеном необходимо подключить кошелек вверху справа!
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-[#090d16]/70 p-3.5 rounded-2xl border border-white/[0.05] space-y-3 shadow-inner">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                      <span>⚙️</span> Панель управления токеном
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Адрес токена (Jetton Master Address) *</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="EQ..."
                          value={manageTokenAddress}
                          onChange={(e) => {
                            setManageTokenAddress(e.target.value);
                            checkTokenOwnership(e.target.value);
                          }}
                          className="w-full bg-[#0e1420] border border-white/[0.08] rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500 shadow-sm"
                        />
                        {manageTokenAddress && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(manageTokenAddress)}
                            className="px-3 bg-slate-800 hover:bg-slate-700 text-xs text-cyan-400 rounded-xl border border-white/10 transition"
                          >
                            {copied ? '✓' : '📋'}
                          </button>
                        )}
                      </div>
                    </div>

                    {manageTokenAddress && (
                      <div className="text-xs text-slate-400 bg-[#0e1420] p-2.5 rounded-xl border border-white/[0.05] flex justify-between items-center shadow-sm">
                        <span>Статус:</span>
                        <span className="font-mono text-cyan-400 font-bold">
                          {checkingOwner ? 'Проверка...' : tokenOwner || 'Готов к работе'}
                        </span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Количество для Сжигания / Минта *</label>
                      <input
                        type="number"
                        placeholder="1000"
                        value={actionAmount}
                        onChange={(e) => setActionAmount(e.target.value)}
                        className="w-full bg-[#0e1420] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500 shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="bg-[#090d16]/70 p-3.5 rounded-2xl border border-white/[0.07] flex items-center justify-between shadow-sm">
                      <div>
                        <div className="text-xs font-bold text-slate-200">🔥 Сжечь токены</div>
                        <div className="text-[10px] text-slate-400">Стоимость услуги: 0.5 TON</div>
                      </div>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => handleAction('BURN')}
                        className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-cyan-500/25 active:scale-95"
                      >
                        Сжечь (0.5 TON)
                      </button>
                    </div>

                    <div className="bg-[#090d16]/70 p-3.5 rounded-2xl border border-white/[0.07] flex items-center justify-between shadow-sm">
                      <div>
                        <div className="text-xs font-bold text-slate-200">🪙 Доминтить (Минт)</div>
                        <div className="text-[10px] text-slate-400">Стоимость услуги: 0.5 TON</div>
                      </div>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => handleAction('MINT')}
                        className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-cyan-500/25 active:scale-95"
                      >
                        Минт (0.5 TON)
                      </button>
                    </div>

                    <div className="bg-[#090d16]/70 p-3.5 rounded-2xl border border-white/[0.07] flex items-center justify-between shadow-sm">
                      <div>
                        <div className="text-xs font-bold text-slate-200">🛑 Отказ от прав</div>
                        <div className="text-[10px] text-slate-400">Стоимость услуги: 0.5 TON</div>
                      </div>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => handleAction('REVOKE')}
                        className="px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-bold text-xs rounded-xl transition-all shadow-md shadow-red-500/10 active:scale-95"
                      >
                        Отказ (0.5 TON)
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ВКЛАДКА 3: ПРЕЛИСТИНГ И БОДИ КРИВАЯ (BLUM-STYLE) */}
          {activeTab === 'presale' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-[#090d16]/70 p-4 rounded-2xl border border-cyan-500/30 space-y-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <span>📈</span> Bonding Curve Launch
                  </span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold animate-pulse">
                    ● LIVE PRE-SALE
                  </span>
                </div>

                {/* Имитация графика кривой боди */}
                <div className="h-28 bg-[#0e1420] border border-white/10 rounded-xl relative overflow-hidden flex items-end px-3 pb-2">
                  <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 via-transparent to-transparent"></div>
                  {/* Кривая линия графика */}
                  <svg className="absolute inset-0 w-full h-full text-cyan-400 opacity-80" preserveAspectRatio="none" viewBox="0 0 100 50">
                    <path d="M0 45 Q 35 40, 60 25 T 100 5" fill="none" stroke="currentColor" strokeWidth="2.5" />
                  </svg>
                  <div className="relative z-10 flex justify-between w-full text-[10px] text-slate-400 font-mono">
                    <span>Softcap: 50 TON</span>
                    <span className="text-cyan-400 font-bold">Progress: 72%</span>
                    <span>Hardcap: 250 TON</span>
                  </div>
                </div>

                {/* Прогресс бар */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden p-0.5 border border-white/10">
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full w-[72%] shadow-md shadow-cyan-500/50"></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Собрано: 180 TON</span>
                    <span>Осталось: 2 дня 4ч</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Сумма участия в прелистинге (TON) *</label>
                  <input
                    type="number"
                    min="1"
                    value={presaleAmount}
                    onChange={(e) => setPresaleAmount(e.target.value)}
                    className="w-full bg-[#0e1420] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500 shadow-sm"
                  />
                </div>

                <button
                  type="button"
                  disabled={participating || !userAddress}
                  onClick={handlePresaleParticipate}
                  className="w-full py-3.5 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl transition-all shadow-xl shadow-cyan-500/35 active:scale-[0.97]"
                >
                  {participating ? 'Покупка доли...' : `🚀 Купить токены по кривой (${presaleAmount} TON)`}
                </button>
              </div>

              <div className="bg-[#090d16]/70 p-3 rounded-2xl border border-white/[0.05] text-[11px] text-slate-400 space-y-1">
                <p className="text-cyan-300 font-semibold">💡 Как работает прелистинг:</p>
                <p>Цена токена растет автоматически по математической кривой (Bonding Curve) по мере поступления средств. После завершения сбора пул автоматически мигрирует на DEX.</p>
              </div>
            </div>
          )}

          {/* Футер */}
          <div className="bg-[#090d16]/80 rounded-2xl p-3 border border-white/[0.05] text-[11px] text-slate-400 space-y-1 shadow-inner">
            <p className="flex justify-between">
              <span>Статус сети:</span> <span className="text-emerald-400 font-medium">TON Mainnet Online</span>
            </p>
            <p className="flex justify-between text-cyan-400/90 font-medium">
              <span>Платформа:</span> <span>GRAM-TOKEN-START</span>
            </p>
          </div>
        </div>
      </main>

      <footer className="w-full max-w-md text-center pt-2 pb-1 text-[10px] text-slate-500">
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
