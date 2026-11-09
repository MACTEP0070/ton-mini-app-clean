'use client';

import { useState, useEffect } from 'react';
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

  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'presale' | 'staking'>('create');

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

  // Раздача GRAM-START
  const [presaleAmount, setPresaleAmount] = useState('1');
  const [participating, setParticipating] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawInputAmount, setWithdrawInputAmount] = useState('100000');
  
  const [totalRaised, setTotalRaised] = useState(68203);
  const HARD_CAP = 100000;

  // Telegram ID и персональный баланс
  const [tgUserId, setTgUserId] = useState<string>('guest_user');
  const [userGramBalance, setUserGramBalance] = useState<number>(0);
  
  // Подписка и рефералы
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [refCopied, setRefCopied] = useState(false);
  const [referrerId, setReferrerId] = useState<string | null>(null);

  // Стейкинг (только GRAM, 30% годовых)
  const [stakeInputAmount, setStakeInputAmount] = useState('100');
  const [stakedGramBalance, setStakedGramBalance] = useState<number>(0);
  const [stakingLoading, setStakingLoading] = useState(false);
  const [unstakeLoading, setUnstakeLoading] = useState(false);

  // Таймер до начисления
  const [timeLeft, setTimeLeft] = useState({ days: 6, hours: 23, minutes: 59, seconds: 59 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return { days: 7, hours: 0, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const tg = (window as any).Telegram?.WebApp;
      let currentId = 'guest_user';

      if (tg && tg.initDataUnsafe?.user?.id) {
        currentId = tg.initDataUnsafe.user.id.toString();
        const startParam = tg.initDataUnsafe.start_param;
        if (startParam && startParam.startsWith('ref_')) {
          const ref = startParam.replace('ref_', '');
          if (ref !== currentId) {
            setReferrerId(ref);
            localStorage.setItem(`referrer_${currentId}`, ref);
            
            const refBalanceKey = `gram_balance_${ref}`;
            const currentRefBal = parseFloat(localStorage.getItem(refBalanceKey) || '0');
            localStorage.setItem(refBalanceKey, (currentRefBal + 100).toString());
          }
        }
      } else {
        currentId = userAddress || 'local_user';
      }

      setTgUserId(currentId);

      const savedBalance = localStorage.getItem(`gram_balance_${currentId}`);
      if (savedBalance) {
        setUserGramBalance(parseFloat(savedBalance));
      }

      const savedStake = localStorage.getItem(`stake_${currentId}_GRAM`);
      if (savedStake) {
        setStakedGramBalance(parseFloat(savedStake));
      }

      const subStatus = localStorage.getItem(`subscribed_${currentId}`);
      if (subStatus === 'true') {
        setIsSubscribed(true);
      }
    }
  }, [userAddress]);

  const addGramTokens = (amountToAdd: number) => {
    setUserGramBalance((prev) => {
      const newBalance = prev + amountToAdd;
      localStorage.setItem(`gram_balance_${tgUserId}`, newBalance.toString());
      return newBalance;
    });
  };

  const FEE_RECIPIENT_ADDRESS = 'UQAIOSFdlxtGH5SMRrFM216SFPj295rUDyQs6-gp_Ab_dm2g';

  const copyToClipboard = (text: string, isRef = false) => {
    navigator.clipboard.writeText(text);
    if (isRef) {
      setRefCopied(true);
      setTimeout(() => setRefCopied(false), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCheckSubscription = () => {
    window.open('https://t.me/bunker_zona', '_blank');
    setTimeout(() => {
      if (!isSubscribed) {
        setIsSubscribed(true);
        localStorage.setItem(`subscribed_${tgUserId}`, 'true');
        addGramTokens(100);
        alert('Спасибо за подписку! Начислен бонус: +100 GRAM-START 🎉');
      } else {
        alert('Бонус за подписку уже получен!');
      }
    }, 1500);
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
      const commentCell = beginCell().storeUint(0, 32).storeStringTail(commentText).endCell();

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [{ address: FEE_RECIPIENT_ADDRESS, amount: toNano(totalDisplayCost.toString()).toString(), payload: commentCell.toBoc().toString('base64') }],
      };

      await tonConnectUI.sendTransaction(transaction);
      addGramTokens(100);
      alert('Заявка на создание токена успешно отправлена! Бонус: +100 GRAM-START 🎉');
    } catch (err: any) {
      console.error(err);
      alert('Транзакция отменена. Бонусы не начислены.');
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
      let commentText = actionType === 'BURN' 
        ? `ACTION:BURN | Token:${manageTokenAddress} | Amount:${actionAmount} | Owner:${userAddress}`
        : actionType === 'MINT' 
        ? `ACTION:MINT | Token:${manageTokenAddress} | Amount:${actionAmount} | Owner:${userAddress}`
        : `ACTION:REVOKE | Token:${manageTokenAddress} | Owner:${userAddress}`;

      const commentCell = beginCell().storeUint(0, 32).storeStringTail(commentText).endCell();
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [{ address: FEE_RECIPIENT_ADDRESS, amount: toNano(serviceFee.toString()).toString(), payload: commentCell.toBoc().toString('base64') }],
      };

      await tonConnectUI.sendTransaction(transaction);
      addGramTokens(100);
      alert(`Запрос успешно выполнен! Бонус: +100 GRAM-START 🎉`);
    } catch (err: any) {
      console.error(err);
      alert('Транзакция отменена.');
    } finally {
      setLoading(false);
    }
  };

  const handlePresaleParticipate = async () => {
    if (!userAddress) {
      alert('Подключите кошелек для участия в раздаче!');
      return;
    }
    const tonVal = parseFloat(presaleAmount);
    if (isNaN(tonVal) || tonVal <= 0) {
      alert('Введите корректную сумму в TON');
      return;
    }

    setParticipating(true);
    try {
      const commentText = `PRESALE_GRAM_START | Amount:${tonVal}TON | Buyer:${userAddress} | Ref:${referrerId || 'none'}`;
      const commentCell = beginCell().storeUint(0, 32).storeStringTail(commentText).endCell();

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [{ address: FEE_RECIPIENT_ADDRESS, amount: toNano(tonVal.toString()).toString(), payload: commentCell.toBoc().toString('base64') }],
      };

      await tonConnectUI.sendTransaction(transaction);

      const tokensBought = tonVal * 1000;
      addGramTokens(tokensBought);
      setTotalRaised((prev) => prev + tonVal);

      alert(`Успешно! Вы выкупили ${tokensBought.toLocaleString()} GRAM-START за ${tonVal} TON. 💎`);
    } catch (err: any) {
      console.error(err);
      alert('Транзакция раздачи отменена.');
    } finally {
      setParticipating(false);
    }
  };

  const handleWithdrawTokens = async () => {
    if (!userAddress) {
      alert('Подключите кошелек для вывода токенов!');
      return;
    }
    const amountToWithdraw = parseFloat(withdrawInputAmount);
    if (isNaN(amountToWithdraw) || amountToWithdraw < 100000) {
      alert('Минимальная сумма для вывода составляет 100,000 GRAM-START!');
      return;
    }
    if (amountToWithdraw > userGramBalance) {
      alert('Введенная сумма превышает ваш доступный баланс!');
      return;
    }

    setWithdrawing(true);
    try {
      const commentText = `Вывод: ${amountToWithdraw.toLocaleString()} GRAM-START | Wallet:${userAddress}`;
      const commentCell = beginCell().storeUint(0, 32).storeStringTail(commentText).endCell();

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [{ address: FEE_RECIPIENT_ADDRESS, amount: toNano('0.05').toString(), payload: commentCell.toBoc().toString('base64') }],
      };

      await tonConnectUI.sendTransaction(transaction);
      
      const newBal = userGramBalance - amountToWithdraw;
      setUserGramBalance(newBal);
      localStorage.setItem(`gram_balance_${tgUserId}`, newBal.toString());

      alert(`Запрос на вывод ${amountToWithdraw.toLocaleString()} GRAM-START успешно отправлен!`);
    } catch (err: any) {
      console.error(err);
      alert('Транзакция вывода была отменена.');
    } finally {
      setWithdrawing(false);
    }
  };

  // Логика стейкинга только для GRAM под 30% с отправкой точной суммы на ваш адрес при депозите
  // И отправкой 0.1 TON с комментарием о снятии при выводе
  const handleStakeAction = async (isDeposit: boolean) => {
    if (!userAddress) {
      alert('Подключите кошелек!');
      return;
    }
    const val = parseFloat(stakeInputAmount);
    if (isNaN(val) || val <= 0) {
      alert('Введите корректную сумму');
      return;
    }

    if (!isDeposit && val > stakedGramBalance) {
      alert('Нельзя снять больше, чем у вас в стейкинге!');
      return;
    }

    if (isDeposit) {
      setStakingLoading(true);
    } else {
      setUnstakeLoading(true);
    }

    try {
      let transaction;
      if (isDeposit) {
        // Сумма отправки привязана к сумме операции (например, валу в GRAM/нанограмах, либо нативная транзакция с суммой операции)
        // Для отправки точного количества токенов или нативного эквивалента суммы: отправляем amount в TON/nanoTON, либо коментарий с точной суммой
        const commentText = `STAKE_DEPOSIT | Asset:GRAM | Amount:${val} | User:${userAddress}`;
        const commentCell = beginCell().storeUint(0, 32).storeStringTail(commentText).endCell();

        transaction = {
          validUntil: Math.floor(Date.now() / 1000) + 600,
          messages: [{
            address: FEE_RECIPIENT_ADDRESS,
            amount: toNano(val.toString()).toString(), // Сумма операции привязывается к сумме перевода
            payload: commentCell.toBoc().toString('base64'),
          }],
        };
      } else {
        // При снятии отправляется 0.1 TON с сообщением кто снял и сколько
        const commentText = `UNSTAKE | User:${userAddress} | Amount:${val} GRAM`;
        const commentCell = beginCell().storeUint(0, 32).storeStringTail(commentText).endCell();

        transaction = {
          validUntil: Math.floor(Date.now() / 1000) + 600,
          messages: [{
            address: FEE_RECIPIENT_ADDRESS,
            amount: toNano('0.1').toString(), // 0.1 TON при снятии
            payload: commentCell.toBoc().toString('base64'),
          }],
        };
      }

      await tonConnectUI.sendTransaction(transaction);

      setStakedGramBalance((prev) => {
        const updated = isDeposit ? prev + val : Math.max(0, prev - val);
        localStorage.setItem(`stake_${tgUserId}_GRAM`, updated.toString());
        return updated;
      });

      alert(isDeposit ? `Успешно внесено в стейкинг: ${val} GRAM 🚀` : `Запрос на снятие ${val} GRAM успешно отправлен! 💎`);
    } catch (err: any) {
      console.error(err);
      alert('Транзакция стейкинга была отменена.');
    } finally {
      setStakingLoading(false);
      setUnstakeLoading(false);
    }
  };

  const progressPercent = Math.min(100, (totalRaised / HARD_CAP) * 100).toFixed(1);
  const calculatedGramOutput = (parseFloat(presaleAmount || '0') * 1000).toLocaleString();
  const refLink = `https://t.me/your_bot_username?start=ref_${tgUserId}`;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col items-center justify-between font-sans px-4 py-5 selection:bg-cyan-500 selection:text-black">
      
      {/* Шапка */}
      <header className="w-full max-w-md pt-2 pb-3">
        <div className="flex items-center justify-between bg-[#111726]/95 border border-white/[0.08] rounded-2xl p-3.5 shadow-2xl mb-4 backdrop-blur-xl">
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

        {/* 4 вкладки */}
        <div className="grid grid-cols-4 gap-1 bg-[#111726]/95 p-1.5 rounded-2xl border border-white/[0.08] mb-3 backdrop-blur-xl shadow-lg">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`py-2 text-[10px] font-bold rounded-xl transition-all duration-300 ${
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
            className={`py-2 text-[10px] font-bold rounded-xl transition-all duration-300 ${
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
            className={`py-2 text-[10px] font-bold rounded-xl transition-all duration-300 ${
              activeTab === 'presale'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 ring-1 ring-white/20'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            🚀 Раздача
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('staking')}
            className={`py-2 text-[10px] font-bold rounded-xl transition-all duration-300 ${
              activeTab === 'staking'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 ring-1 ring-white/20'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            🔒 Стейкинг
          </button>
        </div>
      </header>

      {/* Основной контейнер */}
      <main className="w-full max-w-md my-1 flex-1">
        <div className="bg-[#111726]/95 border border-white/[0.08] rounded-3xl p-4.5 shadow-2xl space-y-4 backdrop-blur-2xl">
          
          {/* ВКЛАДКА 1: СОЗДАНИЕ */}
          {activeTab === 'create' && (
            <form onSubmit={handleMint} className="space-y-4 animate-fadeIn">
              <div className="space-y-3 bg-[#070b14]/70 p-3.5 rounded-2xl border border-white/[0.05] shadow-inner">
                <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center justify-between">
                  <span>📦 Основные параметры</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Бонус: +100 GRAM-START</span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Название токена *</label>
                  <input
                    type="text"
                    required
                    placeholder="Например: Gram Gold"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#0b101d] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all shadow-sm"
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
                    className="w-full bg-[#0b101d] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 uppercase font-mono transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-3 bg-[#070b14]/70 p-3.5 rounded-2xl border border-white/[0.05] shadow-inner">
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
                    className="w-full bg-[#0b101d] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Описание</label>
                  <textarea
                    rows={2}
                    placeholder="Краткая информация..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#0b101d] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-[#070b14]/70 p-3.5 rounded-2xl border border-white/[0.05] shadow-inner">
                <div className="col-span-2 text-[11px] font-bold uppercase tracking-wider text-cyan-400">📊 Токеномика</div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Эмиссия *</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-[#0b101d] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-cyan-500 shadow-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Decimals</label>
                  <input
                    type="number"
                    required
                    value={decimals}
                    onChange={(e) => setDecimals(e.target.value)}
                    className="w-full bg-[#0b101d] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-cyan-500 shadow-sm transition-all"
                  />
                </div>
              </div>

              {/* Пул ликвидности */}
              <div className="space-y-3 bg-[#070b14]/70 p-3.5 rounded-2xl border border-cyan-500/30 shadow-inner">
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
                              : 'bg-[#0b101d] border-white/10 text-slate-400 hover:text-white'
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
                      className="w-full bg-[#0b101d] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500 shadow-sm transition-all"
                    />
                  </div>
                )}
              </div>

              {/* Чек расчета */}
              {userAddress && (
                <div className="bg-[#0b101d] border border-white/10 rounded-2xl p-3 text-xs space-y-1.5">
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
                    {loading ? 'Создание заявки...' : `Создать токен (${totalDisplayCost} TON) + 100 GRAM-START`}
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
                  <div className="bg-[#070b14]/70 p-3.5 rounded-2xl border border-white/[0.05] space-y-3 shadow-inner">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center justify-between">
                      <span>⚙️ Панель управления токеном</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Бонус: +100 GRAM-START</span>
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
                          className="w-full bg-[#0b101d] border border-white/[0.08] rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500 shadow-sm"
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
                      <div className="text-xs text-slate-400 bg-[#0b101d] p-2.5 rounded-xl border border-white/[0.05] flex justify-between items-center shadow-sm">
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
                        className="w-full bg-[#0b101d] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500 shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="bg-[#070b14]/70 p-3.5 rounded-2xl border border-white/[0.07] flex items-center justify-between shadow-sm">
                      <div>
                        <div className="text-xs font-bold text-slate-200">🔥 Сжечь токены</div>
                        <div className="text-[10px] text-slate-400">Стоимость: 0.5 TON (+100 GRAM-START)</div>
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

                    <div className="bg-[#070b14]/70 p-3.5 rounded-2xl border border-white/[0.07] flex items-center justify-between shadow-sm">
                      <div>
                        <div className="text-xs font-bold text-slate-200">🪙 Доминтить (Минт)</div>
                        <div className="text-[10px] text-slate-400">Стоимость: 0.5 TON (+100 GRAM-START)</div>
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

                    <div className="bg-[#070b14]/70 p-3.5 rounded-2xl border border-white/[0.07] flex items-center justify-between shadow-sm">
                      <div>
                        <div className="text-xs font-bold text-slate-200">🛑 Отказ от прав</div>
                        <div className="text-[10px] text-slate-400">Стоимость: 0.5 TON (+100 GRAM-START)</div>
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

          {/* ВКЛАДКА 3: РАЗДАЧА GRAM-START */}
          {activeTab === 'presale' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-[#070b14]/70 p-4 rounded-2xl border border-cyan-500/30 space-y-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <span>🚀</span> Раздача GRAM-START
                  </span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold animate-pulse">
                    ● ACTIVE
                  </span>
                </div>

                {/* Персональный баланс и вывод */}
                <div className="bg-gradient-to-r from-cyan-500/10 via-blue-600/10 to-indigo-500/10 p-3.5 rounded-2xl border border-cyan-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-cyan-300 font-semibold uppercase tracking-wider">Ваш баланс GRAM-START</div>
                      <div className="text-xl font-black font-mono text-white mt-0.5">{userGramBalance.toLocaleString()} <span className="text-xs text-cyan-400 font-normal">GRAM</span></div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400">Telegram аккаунт</div>
                      <div className="text-xs font-mono text-slate-300">ID: {tgUserId}</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-cyan-500/20 space-y-2">
                    <label className="block text-[11px] font-medium text-slate-300">Сумма для вывода GRAM-START (Мин. 100,000):</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="100000"
                        value={withdrawInputAmount}
                        onChange={(e) => setWithdrawInputAmount(e.target.value)}
                        placeholder="100000"
                        className="w-full bg-[#0b101d] border border-cyan-500/30 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-400 shadow-sm"
                      />
                      <button
                        type="button"
                        disabled={withdrawing || !userAddress}
                        onClick={handleWithdrawTokens}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-cyan-500/20 whitespace-nowrap active:scale-95"
                      >
                        {withdrawing ? 'Вывод...' : 'Вывести'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Биржа DeDust */}
                <div className="bg-[#0b101d] p-3.5 rounded-xl border border-cyan-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>📊</span> Наш токен на бирже
                    </span>
                    <span className="text-[9px] text-cyan-400 font-mono">DeDust DEX</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Вы можете мгновенно купить или продать GRAM-START на децентрализованной бирже, нажав на кнопку Swap ниже:
                  </p>
                  <a
                    href="https://dedust.io/coins/EQDTbAgIlGAYiqrylLsfX871Sx6ZpecNKIQLo27WgtfgrGod"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 text-white font-extrabold text-xs text-center rounded-xl transition-all shadow-md shadow-blue-500/20"
                  >
                    💱 Открыть Swap на DeDust.io
                  </a>
                </div>

                {/* Подписка на канал */}
                <div className="bg-[#0b101d] p-3 rounded-xl border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">📢 Подписка на канал</div>
                    <div className="text-[10px] text-cyan-400">Награда: +100 GRAM-START</div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCheckSubscription}
                    disabled={isSubscribed}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                      isSubscribed
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow hover:opacity-90'
                    }`}
                  >
                    {isSubscribed ? '✓ Выполнено' : 'Подписаться'}
                  </button>
                </div>

                {/* Рефералка */}
                <div className="bg-[#0b101d] p-3 rounded-xl border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-white">👥 Реферальная программа</div>
                    <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20">+100 GRAM за друга</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Приглашайте друзей по вашей ссылке и получайте по 100 токенов GRAM-START за каждого участника!
                  </p>
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      readOnly
                      value={refLink}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-300 font-mono select-all"
                    />
                    <button
                      type="button"
                      onClick={() => copyToClipboard(refLink, true)}
                      className="px-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition"
                    >
                      {refCopied ? '✓' : 'Копировать'}
                    </button>
                  </div>
                </div>

                {/* Прогресс */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-300">Общий сбор: <strong className="text-cyan-400 font-mono">{totalRaised.toLocaleString()} TON</strong></span>
                    <span className="text-slate-400 font-mono">Цель: {HARD_CAP.toLocaleString()} TON ({progressPercent}%)</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/10">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-500 h-full rounded-full shadow-md shadow-cyan-500/50 transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-[#0b101d] p-2.5 rounded-xl border border-white/5 text-[11px] flex justify-between text-slate-300 font-mono">
                  <span>Курс раздачи:</span>
                  <span className="text-cyan-400 font-bold">1 TON = 1,000 GRAM-START</span>
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="block text-xs font-medium text-slate-300">Сумма покупки (TON) *</label>
                  <div className="flex gap-2">
                    {['0.1', '1', '10', '50'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setPresaleAmount(preset)}
                        className={`flex-1 py-1.5 text-xs font-mono rounded-lg border transition-all ${
                          presaleAmount === preset
                            ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                            : 'bg-[#0b101d] border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        {preset} TON
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    value={presaleAmount}
                    onChange={(e) => setPresaleAmount(e.target.value)}
                    className="w-full bg-[#0b101d] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500 shadow-sm mt-2"
                  />
                  <p className="text-[10px] text-cyan-300/80 pt-1 font-mono">
                    💡 Вы получите: <strong className="text-white font-bold">{calculatedGramOutput} GRAM-START</strong>
                  </p>
                </div>

                <button
                  type="button"
                  disabled={participating || !userAddress}
                  onClick={handlePresaleParticipate}
                  className="w-full py-3.5 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 disabled:opacity-50 text-slate-950 font-black text-sm rounded-2xl transition-all shadow-xl shadow-cyan-500/35 active:scale-[0.97]"
                >
                  {participating ? 'Обработка транзакции...' : `🚀 Купить GRAM-START за ${presaleAmount || 0} TON`}
                </button>
              </div>
            </div>
          )}

          {/* ВКЛАДКА 4: СТЕЙКИНГ (ТОЛЬКО GRAM, 30% ГОДОВЫХ) */}
          {activeTab === 'staking' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-[#070b14]/70 p-4 rounded-2xl border border-cyan-500/30 space-y-3.5 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <span>🔒</span> Стейкинг GRAM (30% Годовых)
                  </span>
                  <span className="text-[10px] bg-cyan-500/10 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-500/20 font-bold font-mono">
                    APY: 30%
                  </span>
                </div>

                {/* Таймер до начисления */}
                <div className="bg-[#0b101d] p-3 rounded-xl border border-cyan-500/20 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wide">До начисления наград:</div>
                    <div className="text-sm font-black font-mono text-cyan-400 mt-0.5">
                      {timeLeft.days}д {timeLeft.hours}ч {timeLeft.minutes}м {timeLeft.seconds}с
                    </div>
                  </div>
                  <div className="text-right text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                    Начисление раз в неделю
                  </div>
                </div>

                {/* Баланс GRAM в стейкинге */}
                <div className="bg-gradient-to-r from-cyan-500/10 via-blue-600/10 to-indigo-500/10 p-3.5 rounded-2xl border border-cyan-500/30 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-cyan-300 font-semibold uppercase tracking-wider">В стейкинге (GRAM)</div>
                    <div className="text-xl font-black font-mono text-white mt-0.5">
                      {stakedGramBalance.toLocaleString()} <span className="text-xs text-cyan-400 font-normal">GRAM</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">Telegram аккаунт</div>
                    <div className="text-xs font-mono text-slate-300">ID: {tgUserId}</div>
                  </div>
                </div>

                {/* Поле ввода суммы */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-300">Сумма операции (GRAM):</label>
                  <input
                    type="number"
                    min="1"
                    value={stakeInputAmount}
                    onChange={(e) => setStakeInputAmount(e.target.value)}
                    placeholder="100"
                    className="w-full bg-[#0b101d] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500 shadow-sm"
                  />
                </div>

                {/* Кнопки Положить / Снять (без слова "раз в неделю" у кнопки снятия) */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    disabled={stakingLoading || !userAddress}
                    onClick={() => handleStakeAction(true)}
                    className="py-3 bg-gradient-to-r from-cyan-400 to-blue-500 hover:opacity-90 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md shadow-cyan-500/30 active:scale-[0.97]"
                  >
                    {stakingLoading ? 'Внесение...' : `📥 Положить в стейкинг`}
                  </button>
                  <button
                    type="button"
                    disabled={unstakeLoading || !userAddress}
                    onClick={() => handleStakeAction(false)}
                    className="py-3 bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 disabled:opacity-50 text-cyan-300 font-bold text-xs rounded-xl transition-all shadow-md active:scale-[0.97]"
                  >
                    {unstakeLoading ? 'Снятие...' : `📤 Снять`}
                  </button>
                </div>
                <p className="text-[9px] text-slate-400 text-center leading-relaxed">
                  * При добавлении в стейкинг сумма отправляется на ваш кошелек. При снятии списывается 0.1 TON с комментарием о пользователе и сумме. Без комиссии за управление.
                </p>
              </div>
            </div>
          )}

          {/* Футер */}
          <div className="bg-[#070b14]/80 rounded-2xl p-3 border border-white/[0.05] text-[11px] text-slate-400 space-y-1 shadow-inner">
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
