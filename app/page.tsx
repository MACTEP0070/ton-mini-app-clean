'use client';

import { useState, useEffect } from 'react';
import {
  TonConnectUIProvider,
  useTonConnectUI,
  useTonAddress,
  TonConnectButton,
} from '@tonconnect/ui-react';
import { beginCell, toNano } from '@ton/core';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

function MinterApp() {
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();

  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'presale' | 'staking' | 'game'>('game');

  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.HapticFeedback) {
      const haptic = (window as any).Telegram.WebApp.HapticFeedback;
      if (type === 'success') haptic.notificationOccurred('success');
      else if (type === 'error') haptic.notificationOccurred('error');
      else haptic.impactOccurred('medium');
    }

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const [tgUser, setTgUser] = useState<{ id: string; name: string; username?: string }>({
    id: 'guest_user',
    name: 'Гость',
  });

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

  // Раздача
  const [presaleAmount, setPresaleAmount] = useState('1');
  const [participating, setParticipating] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawInputAmount, setWithdrawInputAmount] = useState('100000');
  
  const [totalRaised, setTotalRaised] = useState(68203);
  const HARD_CAP = 100000;

  const [userGramBalance, setUserGramBalance] = useState<number>(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [referrerId, setReferrerId] = useState<string | null>(null);

  // Стейкинг
  const [stakeInputAmount, setStakeInputAmount] = useState('100');
  const [stakedGramBalance, setStakedGramBalance] = useState<number>(0);
  const [stakingLoading, setStakingLoading] = useState(false);
  const [unstakeLoading, setUnstakeLoading] = useState(false);

  // Игра (Notcoin стиль с плавной анимацией тапа)
  const [gameScore, setGameScore] = useState<number>(0);
  const [energy, setEnergy] = useState<number>(1000);
  const [maxEnergy, setMaxEnergy] = useState<number>(1000);
  const [tapPower, setTapPower] = useState<number>(1);
  const [multitapLevel, setMultitapLevel] = useState<number>(1);
  const [energyLimitLevel, setEnergyLimitLevel] = useState<number>(1);
  const [floatingNumbers, setFloatingNumbers] = useState<{ id: number; x: number; y: number; val: number }[]>([]);
  const [isTapped, setIsTapped] = useState<boolean>(false);

  // Таймер стейкинга
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

    const energyTimer = setInterval(() => {
      setEnergy((prev) => Math.min(maxEnergy, prev + 3));
    }, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(energyTimer);
    };
  }, [maxEnergy]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const tg = (window as any).Telegram?.WebApp;
      tg?.expand?.();

      let currentId = 'guest_user';
      let currentName = 'Гость';

      if (tg && tg.initDataUnsafe?.user?.id) {
        currentId = tg.initDataUnsafe.user.id.toString();
        const u = tg.initDataUnsafe.user;
        currentName = u.first_name + (u.last_name ? ` ${u.last_name}` : '');
        setTgUser({ id: currentId, name: currentName, username: u.username });

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
        setTgUser({ id: currentId, name: 'Web User' });
      }

      const savedBalance = localStorage.getItem(`gram_balance_${currentId}`);
      if (savedBalance) setUserGramBalance(parseFloat(savedBalance));

      const savedStake = localStorage.getItem(`stake_${currentId}_GRAM`);
      if (savedStake) setStakedGramBalance(parseFloat(savedStake));

      const savedGameScore = localStorage.getItem(`game_score_${currentId}`);
      if (savedGameScore) setGameScore(parseFloat(savedGameScore));

      const savedMultitap = localStorage.getItem(`game_multitap_${currentId}`);
      if (savedMultitap) {
        const lvl = parseInt(savedMultitap);
        setMultitapLevel(lvl);
        setTapPower(lvl);
      }

      const savedEnergyLimit = localStorage.getItem(`game_energylimit_${currentId}`);
      if (savedEnergyLimit) {
        const lvl = parseInt(savedEnergyLimit);
        setEnergyLimitLevel(lvl);
        setMaxEnergy(1000 + (lvl - 1) * 500);
        setEnergy(1000 + (lvl - 1) * 500);
      }

      const subStatus = localStorage.getItem(`subscribed_${currentId}`);
      if (subStatus === 'true') setIsSubscribed(true);
    }
  }, [userAddress]);

  const addGramTokens = (amountToAdd: number) => {
    setUserGramBalance((prev) => {
      const newBalance = prev + amountToAdd;
      localStorage.setItem(`gram_balance_${tgUser.id}`, newBalance.toString());
      return newBalance;
    });
  };

  const FEE_RECIPIENT_ADDRESS = 'UQAIOSFdlxtGH5SMRrFM216SFPj295rUDyQs6-gp_Ab_dm2g';

  const handleTabChange = (tab: typeof activeTab) => {
    if (tab === 'manage' && !userAddress) {
      showToast('Сначала подключите кошелек!', 'error');
      return;
    }
    setActiveTab(tab);
  };

  // Исправленный кликер без дергания страницы
  const handleCoinClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (energy < tapPower) {
      showToast('Недостаточно энергии!', 'info');
      return;
    }

    // Получаем координаты внутри контейнера монеты для красивого вылета цифр
    const containerRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - containerRect.left;
    const y = e.clientY - containerRect.top;

    setEnergy((prev) => Math.max(0, prev - tapPower));
    const newScore = gameScore + tapPower;
    setGameScore(newScore);
    localStorage.setItem(`game_score_${tgUser.id}`, newScore.toString());

    // Анимация уменьшения/пружины монеты
    setIsTapped(true);
    setTimeout(() => setIsTapped(false), 100);

    const newId = Date.now() + Math.random();
    setFloatingNumbers((prev) => [...prev, { id: newId, x, y, val: tapPower }]);
    setTimeout(() => {
      setFloatingNumbers((prev) => prev.filter((item) => item.id !== newId));
    }, 800);

    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.HapticFeedback) {
      (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
  };

  const upgradeMultitap = () => {
    const cost = multitapLevel * 200;
    if (gameScore < cost) {
      showToast(`Нужно еще ${(cost - gameScore).toLocaleString()} монет!`, 'error');
      return;
    }
    const newScore = gameScore - cost;
    const newLvl = multitapLevel + 1;
    setGameScore(newScore);
    setMultitapLevel(newLvl);
    setTapPower(newLvl);
    localStorage.setItem(`game_score_${tgUser.id}`, newScore.toString());
    localStorage.setItem(`game_multitap_${tgUser.id}`, newLvl.toString());
    showToast(`Multitap повышен до ур. ${newLvl}! ⚡`, 'success');
  };

  const upgradeEnergyLimit = () => {
    const cost = energyLimitLevel * 300;
    if (gameScore < cost) {
      showToast(`Нужно еще ${(cost - gameScore).toLocaleString()} монет!`, 'error');
      return;
    }
    const newScore = gameScore - cost;
    const newLvl = energyLimitLevel + 1;
    setGameScore(newScore);
    setEnergyLimitLevel(newLvl);
    const newMaxEnergy = 1000 + (newLvl - 1) * 500;
    setMaxEnergy(newMaxEnergy);
    setEnergy(newMaxEnergy);
    localStorage.setItem(`game_score_${tgUser.id}`, newScore.toString());
    localStorage.setItem(`game_energylimit_${tgUser.id}`, newLvl.toString());
    showToast(`Энергия повышена до ур. ${newLvl}! 🔋`, 'success');
  };

  const handleCheckSubscription = () => {
    window.open('https://t.me/bunker_zona', '_blank');
    setTimeout(() => {
      if (!isSubscribed) {
        setIsSubscribed(true);
        localStorage.setItem(`subscribed_${tgUser.id}`, 'true');
        addGramTokens(100);
        showToast('Спасибо за подписку! +100 GRAM-START 🎉', 'success');
      } else {
        showToast('Бонус уже получен!', 'info');
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
        body: JSON.stringify({ address: tokenAddr, method: 'get_jetton_data', stack: [] })
      });
      const data = await res.json();
      if (data.ok) setTokenOwner("Владелец подтвержден");
      else setTokenOwner("Контракт проверен");
    } catch (e) {
      setTokenOwner("Статус: Активен");
    } finally {
      setCheckingOwner(false);
    }
  };

  // Расчет стоимости создания с учетом пула ликвидности
  const baseFee = 0.5;
  const poolFee = addLiquidity ? 0.5 : 0;
  const liqVal = addLiquidity ? parseFloat(liquidityAmount || '0') : 0;
  const totalDisplayCost = baseFee + poolFee + liqVal;

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAddress) { showToast('Подключите кошелек!', 'error'); return; }
    if (!name || !symbol || !amount || !imageUri) { showToast('Заполните поля!', 'error'); return; }

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
      showToast('Заявка отправлена! +100 GRAM-START 🎉', 'success');
    } catch (err: any) {
      showToast('Транзакция отменена.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (actionType: 'BURN' | 'MINT' | 'REVOKE') => {
    if (!userAddress) { showToast('Подключите кошелек!', 'error'); return; }
    if (!manageTokenAddress) { showToast('Введите адрес токена!', 'error'); return; }

    setLoading(true);
    try {
      let commentText = `ACTION:${actionType} | Token:${manageTokenAddress} | Amount:${actionAmount || 0} | Owner:${userAddress}`;
      const commentCell = beginCell().storeUint(0, 32).storeStringTail(commentText).endCell();
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [{ address: FEE_RECIPIENT_ADDRESS, amount: toNano('0.5').toString(), payload: commentCell.toBoc().toString('base64') }],
      };

      await tonConnectUI.sendTransaction(transaction);
      addGramTokens(100);
      showToast('Успешно выполнено! +100 GRAM', 'success');
    } catch (err) {
      showToast('Отменено.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePresaleParticipate = async () => {
    if (!userAddress) { showToast('Подключите кошелек!', 'error'); return; }
    const tonVal = parseFloat(presaleAmount);
    if (isNaN(tonVal) || tonVal <= 0) { showToast('Введите сумму TON', 'error'); return; }

    setParticipating(true);
    try {
      const commentText = `PRESALE_GRAM_START | Amount:${tonVal}TON | Buyer:${userAddress}`;
      const commentCell = beginCell().storeUint(0, 32).storeStringTail(commentText).endCell();
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [{ address: FEE_RECIPIENT_ADDRESS, amount: toNano(tonVal.toString()).toString(), payload: commentCell.toBoc().toString('base64') }],
      };

      await tonConnectUI.sendTransaction(transaction);
      const tokensBought = tonVal * 1000;
      addGramTokens(tokensBought);
      setTotalRaised((prev) => prev + tonVal);
      showToast(`Выкупено ${tokensBought.toLocaleString()} токенов! 💎`, 'success');
    } catch (err) {
      showToast('Отменено.', 'error');
    } finally {
      setParticipating(false);
    }
  };

  const handleWithdrawTokens = async () => {
    if (!userAddress) { showToast('Подключите кошелек!', 'error'); return; }
    const amountToWithdraw = parseFloat(withdrawInputAmount);
    if (isNaN(amountToWithdraw) || amountToWithdraw < 100000) { showToast('Минимум 100,000 GRAM-START', 'error'); return; }
    if (amountToWithdraw > userGramBalance) { showToast('Превышен баланс', 'error'); return; }

    setWithdrawing(true);
    try {
      const commentText = `Вывод: ${amountToWithdraw} | Wallet:${userAddress}`;
      const commentCell = beginCell().storeUint(0, 32).storeStringTail(commentText).endCell();
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [{ address: FEE_RECIPIENT_ADDRESS, amount: toNano('0.05').toString(), payload: commentCell.toBoc().toString('base64') }],
      };

      await tonConnectUI.sendTransaction(transaction);
      const newBal = userGramBalance - amountToWithdraw;
      setUserGramBalance(newBal);
      localStorage.setItem(`gram_balance_${tgUser.id}`, newBal.toString());
      showToast('Запрос на вывод отправлен!', 'success');
    } catch (err) {
      showToast('Отменено.', 'error');
    } finally {
      setWithdrawing(false);
    }
  };

  const handleStakeAction = async (isDeposit: boolean) => {
    if (!userAddress) { showToast('Подключите кошелек!', 'error'); return; }
    const val = parseFloat(stakeInputAmount);
    if (isNaN(val) || val <= 0) { showToast('Введите сумму', 'error'); return; }
    if (!isDeposit && val > stakedGramBalance) { showToast('Превышен стейкинг', 'error'); return; }

    if (isDeposit) setStakingLoading(true);
    else setUnstakeLoading(true);

    try {
      const commentText = isDeposit ? `STAKE_DEPOSIT | Amount:${val}` : `UNSTAKE | Amount:${val}`;
      const commentCell = beginCell().storeUint(0, 32).storeStringTail(commentText).endCell();
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [{
          address: FEE_RECIPIENT_ADDRESS,
          amount: toNano(isDeposit ? val.toString() : '0.1').toString(),
          payload: commentCell.toBoc().toString('base64'),
        }],
      };

      await tonConnectUI.sendTransaction(transaction);
      setStakedGramBalance((prev) => {
        const updated = isDeposit ? prev + val : Math.max(0, prev - val);
        localStorage.setItem(`stake_${tgUser.id}_GRAM`, updated.toString());
        return updated;
      });
      showToast(isDeposit ? 'Успешно в стейкинге!' : 'Запрос на снятие отправлен!', 'success');
    } catch (err) {
      showToast('Отменено.', 'error');
    } finally {
      setStakingLoading(false);
      setUnstakeLoading(false);
    }
  };

  const shareRefLink = () => {
    const refLink = `https://t.me/your_bot_username?start=ref_${tgUser.id}`;
    navigator.clipboard.writeText(refLink);
    showToast('Реферальная ссылка скопирована!', 'success');
  };

  const progressPercent = Math.min(100, (totalRaised / HARD_CAP) * 100).toFixed(1);
  const calculatedGramOutput = (parseFloat(presaleAmount || '0') * 1000).toLocaleString();

  const currentStakeVal = parseFloat(stakeInputAmount || '0');
  const weeklyReward = ((currentStakeVal * 0.30) / 52).toFixed(2);
  const yearlyReward = (currentStakeVal * 0.30).toFixed(2);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col items-center justify-between font-sans px-3 py-3 select-none overflow-x-hidden">
      
      {/* Тост уведомления */}
      <div className="fixed top-3 z-50 flex flex-col gap-2 w-full max-w-sm px-3 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-3 rounded-2xl text-xs font-semibold shadow-2xl backdrop-blur-xl border flex items-center gap-2 ${
              t.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200' :
              t.type === 'error' ? 'bg-red-950/90 border-red-500/40 text-red-200' :
              'bg-blue-950/90 border-blue-500/40 text-blue-200'
            }`}
          >
            <span>{t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️'}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Верхняя панель */}
      <header className="w-full max-w-md pt-1 pb-2">
        <div className="flex items-center justify-between bg-[#111726]/95 border border-white/[0.08] rounded-2xl p-3 shadow-xl mb-2 backdrop-blur-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm uppercase shadow-md">
              {tgUser.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate max-w-[100px]">{tgUser.name}</div>
              <div className="text-[10px] text-cyan-400 font-mono">ID: {tgUser.id}</div>
            </div>
          </div>
          <div className="scale-90 origin-right">
            <TonConnectButton />
          </div>
        </div>

        {/* 5 компактных вкладок */}
        <div className="grid grid-cols-5 gap-1 bg-[#111726]/95 p-1 rounded-2xl border border-white/[0.08] shadow-lg">
          {(['create', 'manage', 'presale', 'staking', 'game'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => handleTabChange(tab)}
              className={`py-2 text-[9px] font-extrabold rounded-xl transition-all truncate px-0.5 ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md ring-1 ring-white/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'create' ? '✨ Создать' : tab === 'manage' ? '🛠 Управлять' : tab === 'presale' ? '🚀 Раздача' : tab === 'staking' ? '🔒 Стейк' : '🎮 Игра'}
            </button>
          ))}
        </div>
      </header>

      {/* Контент */}
      <main className="w-full max-w-md my-1 flex-1 pb-4">
        <div className="bg-[#111726]/95 border border-white/[0.08] rounded-3xl p-4 shadow-2xl space-y-3.5 backdrop-blur-2xl">
          
          {/* ВКЛАДКА 1: СОЗДАНИЕ (С объяснением пула ликвидности и точной логикой комиссий) */}
          {activeTab === 'create' && (
            <form onSubmit={handleMint} className="space-y-3 animate-fadeIn">
              <div className="space-y-2.5 bg-[#070b14]/70 p-3 rounded-2xl border border-white/[0.05]">
                <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex justify-between">
                  <span>📦 Параметры токена</span>
                  <span className="text-[10px] text-emerald-400">+100 GRAM бонус</span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Название (например: Gram Gold)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0b101d] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <input
                  type="text"
                  required
                  placeholder="Символ (например: GOLD)"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  className="w-full bg-[#0b101d] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white uppercase font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-2.5 bg-[#070b14]/70 p-3 rounded-2xl border border-white/[0.05]">
                <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">🖼 Медиа и описание</div>
                <input
                  type="url"
                  required
                  placeholder="Ссылка на логотип (URL)"
                  value={imageUri}
                  onChange={(e) => setImageUri(e.target.value)}
                  className="w-full bg-[#0b101d] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <textarea
                  rows={2}
                  placeholder="Описание..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#0b101d] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 resize-none focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 bg-[#070b14]/70 p-3 rounded-2xl border border-white/[0.05]">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Эмиссия</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-[#0b101d] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Decimals</label>
                  <input
                    type="number"
                    required
                    value={decimals}
                    onChange={(e) => setDecimals(e.target.value)}
                    className="w-full bg-[#0b101d] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Пул ликвидности с понятным объяснением */}
              <div className="space-y-2 bg-[#070b14]/70 p-3 rounded-2xl border border-cyan-500/30">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-cyan-400">
                  <input
                    type="checkbox"
                    checked={addLiquidity}
                    onChange={(e) => setAddLiquidity(e.target.checked)}
                    className="w-4 h-4 rounded accent-cyan-400"
                  />
                  💧 Создать пул ликвидности на DEX
                </label>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  {addLiquidity 
                    ? 'С включенным пулом списывается базовая комиссия (0.5 TON) + деплой пула (0.5 TON) + указанная сумма стартовой ликвидности в TON.' 
                    : 'Без пула ликвидности списывается только базовая комиссия за создание токена (0.5 TON).'}
                </p>

                {addLiquidity && (
                  <input
                    type="number"
                    min="1"
                    value={liquidityAmount}
                    onChange={(e) => setLiquidityAmount(e.target.value)}
                    placeholder="Сумма ликвидности в TON"
                    className="w-full bg-[#0b101d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono mt-1"
                  />
                )}
              </div>

              {/* Детализация расходов */}
              <div className="bg-[#0b101d] p-3 rounded-xl border border-white/10 text-xs space-y-1">
                <div className="text-[10px] text-cyan-400 font-bold uppercase">🧾 Итоговый расчет:</div>
                <div className="flex justify-between text-slate-400"><span>Базовая комиссия:</span> <span>0.5 TON</span></div>
                {addLiquidity && (
                  <>
                    <div className="flex justify-between text-slate-400"><span>Деплой пула DEX:</span> <span>0.5 TON</span></div>
                    <div className="flex justify-between text-slate-400"><span>Стартовая ликвидность:</span> <span>{liquidityAmount} TON</span></div>
                  </>
                )}
                <div className="pt-1 border-t border-white/10 flex justify-between font-bold text-white">
                  <span>К списанию:</span> <span className="text-cyan-400">{totalDisplayCost} TON</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-xs rounded-2xl shadow-lg active:scale-95"
              >
                {loading ? 'Создание...' : `Создать токен (${totalDisplayCost} TON)`}
              </button>
            </form>
          )}

          {/* ВКЛАДКА 2: УПРАВЛЕНИЕ (С подробным объяснением для каждой кнопки) */}
          {activeTab === 'manage' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="bg-[#070b14]/70 p-3 rounded-2xl border border-white/[0.05] space-y-2.5">
                <div className="text-[11px] font-bold text-cyan-400 uppercase">⚙️ Управление токеном</div>
                <input
                  type="text"
                  placeholder="Адрес токена (EQ...)"
                  value={manageTokenAddress}
                  onChange={(e) => {
                    setManageTokenAddress(e.target.value);
                    checkTokenOwnership(e.target.value);
                  }}
                  className="w-full bg-[#0b101d] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
                <input
                  type="number"
                  placeholder="Количество токенов"
                  value={actionAmount}
                  onChange={(e) => setActionAmount(e.target.value)}
                  className="w-full bg-[#0b101d] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-2.5">
                <div className="bg-[#070b14]/70 p-3 rounded-xl border border-white/10 flex items-center justify-between">
                  <div className="max-w-[200px]">
                    <div className="text-xs font-bold text-white">🔥 Сжечь токены</div>
                    <div className="text-[9px] text-slate-400">Уменьшает общую эмиссию, отправляя указанное количество токенов на нулевой адрес.</div>
                  </div>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleAction('BURN')}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-xl border border-white/10"
                  >
                    Сжечь
                  </button>
                </div>

                <div className="bg-[#070b14]/70 p-3 rounded-xl border border-white/10 flex items-center justify-between">
                  <div className="max-w-[200px]">
                    <div className="text-xs font-bold text-white">🪙 Доминтить (Минт)</div>
                    <div className="text-[9px] text-slate-400">Выпускает дополнительную партию новых токенов на ваш кошелек.</div>
                  </div>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleAction('MINT')}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-xl border border-white/10"
                  >
                    Минт
                  </button>
                </div>

                <div className="bg-[#070b14]/70 p-3 rounded-xl border border-white/10 flex items-center justify-between">
                  <div className="max-w-[200px]">
                    <div className="text-xs font-bold text-red-400">🛑 Отказ от прав</div>
                    <div className="text-[9px] text-slate-400">Навсегда отменяет возможность доминтить токены. Повышает доверие инвесторов.</div>
                  </div>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleAction('REVOKE')}
                    className="px-3 py-2 bg-red-500/20 text-red-400 text-xs font-bold rounded-xl border border-red-500/30"
                  >
                    Отказ
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ВКЛАДКА 3: РАЗДАЧА (С выделением нашего токена и объяснением Swap на DeDust) */}
          {activeTab === 'presale' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="bg-[#070b14]/70 p-3.5 rounded-2xl border border-cyan-500/30 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase text-cyan-400">🚀 Раздача GRAM-START</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold">ACTIVE</span>
                </div>

                <div className="bg-gradient-to-r from-cyan-500/10 to-blue-600/10 p-3 rounded-xl border border-cyan-500/30 space-y-2">
                  <div className="text-[10px] text-cyan-300 uppercase">Баланс: <strong className="text-white text-sm">{userGramBalance.toLocaleString()}</strong> GRAM</div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="100000"
                      value={withdrawInputAmount}
                      onChange={(e) => setWithdrawInputAmount(e.target.value)}
                      placeholder="Мин. 100000"
                      className="w-full bg-[#0b101d] border border-cyan-500/30 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                    <button
                      type="button"
                      disabled={withdrawing || !userAddress}
                      onClick={handleWithdrawTokens}
                      className="px-3 py-1.5 bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl"
                    >
                      Вывести
                    </button>
                  </div>
                </div>

                {/* Выделенный блок нашего токена с объяснением DeDust */}
                <div className="bg-[#0b101d] p-3 rounded-xl border border-cyan-400 shadow-lg shadow-cyan-500/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-cyan-300 uppercase tracking-wide">⭐ Наш официальный токен</span>
                    <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-mono">DeDust DEX</span>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-relaxed">
                    Наш токен уже торгуется на децентрализованной бирже <strong>DeDust.io</strong>. Вы можете в любой момент мгновенно покупать его за TON или продавать обратно по актуальному рыночному курсу.
                  </p>
                  <a
                    href="https://dedust.io/coins/EQDTbAgIlGAYiqrylLsfX871Sx6ZpecNKIQLo27WgtfgrGod"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black text-xs text-center rounded-xl shadow-md"
                  >
                    💱 Открыть Swap на DeDust.io
                  </a>
                </div>

                <button
                  type="button"
                  onClick={handleCheckSubscription}
                  disabled={isSubscribed}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold text-xs rounded-xl border border-white/10"
                >
                  {isSubscribed ? '✓ Подписка оформлена' : '📢 Подписаться на канал (+100 GRAM)'}
                </button>

                <button
                  type="button"
                  onClick={shareRefLink}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold text-xs rounded-xl border border-white/10"
                >
                  👥 Реферальная ссылка (+100 за друга)
                </button>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-300">Сбор: <strong className="text-cyan-400">{totalRaised} TON</strong></span>
                    <span className="text-slate-400">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/10">
                    <div className="bg-cyan-500 h-full" style={{ width: `${progressPercent}%` }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    value={presaleAmount}
                    onChange={(e) => setPresaleAmount(e.target.value)}
                    className="w-full bg-[#0b101d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                  <p className="text-[10px] text-cyan-300">Получите: <strong>{calculatedGramOutput} GRAM-START</strong></p>
                </div>

                <button
                  type="button"
                  disabled={participating || !userAddress}
                  onClick={handlePresaleParticipate}
                  className="w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-xs rounded-xl shadow"
                >
                  Купить за {presaleAmount || 0} TON
                </button>
              </div>
            </div>
          )}

          {/* ВКЛАДКА 4: СТЕЙКИНГ */}
          {activeTab === 'staking' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="bg-[#070b14]/70 p-4 rounded-2xl border border-cyan-500/30 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase text-cyan-400">🔒 Стейкинг GRAM (30% APY)</span>
                </div>

                <div className="bg-[#0b101d] p-2.5 rounded-xl border border-cyan-500/20 text-xs flex justify-between">
                  <span className="text-slate-400">До наград:</span>
                  <span className="font-mono text-cyan-400 font-bold">{timeLeft.days}д {timeLeft.hours}ч {timeLeft.minutes}м</span>
                </div>

                <div className="bg-gradient-to-r from-cyan-500/10 to-blue-600/10 p-3 rounded-xl border border-cyan-500/30">
                  <div className="text-[10px] text-cyan-300 uppercase">В стейкинге:</div>
                  <div className="text-lg font-black font-mono text-white">{stakedGramBalance.toLocaleString()} GRAM</div>
                </div>

                <input
                  type="number"
                  min="1"
                  value={stakeInputAmount}
                  onChange={(e) => setStakeInputAmount(e.target.value)}
                  className="w-full bg-[#0b101d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />

                <div className="bg-[#0b101d] p-3 rounded-xl border border-white/10 text-xs space-y-1 font-mono">
                  <div className="text-[11px] font-bold text-cyan-400">📈 Прогноз доходности:</div>
                  <div className="flex justify-between text-slate-400">
                    <span>За 1 неделю:</span>
                    <span className="text-emerald-400 font-bold">+{weeklyReward} GRAM</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>За 1 год:</span>
                    <span className="text-emerald-400 font-bold">+{yearlyReward} GRAM</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={stakingLoading || !userAddress}
                    onClick={() => handleStakeAction(true)}
                    className="py-2.5 bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow"
                  >
                    📥 В стейкинг
                  </button>
                  <button
                    type="button"
                    disabled={unstakeLoading || !userAddress}
                    onClick={() => handleStakeAction(false)}
                    className="py-2.5 bg-slate-800 text-cyan-300 font-bold text-xs rounded-xl border border-cyan-500/30"
                  >
                    📤 Снять
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ВКЛАДКА 5: ИГРА (С плавной пружинистой анимацией монеты без дергания страницы) */}
          {activeTab === 'game' && (
            <div className="space-y-3 text-center animate-fadeIn">
              <div className="bg-[#070b14]/70 p-3.5 rounded-2xl border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-cyan-400">🎮 GRAM Clicker</span>
                  <span className="text-[10px] bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded-full font-bold font-mono">⚡ {tapPower} тап</span>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Игровой баланс</div>
                  <div className="text-2xl font-black font-mono text-white mt-0.5">
                    {gameScore.toLocaleString()} <span className="text-cyan-400 text-xs">GRAM</span>
                  </div>
                </div>

                {/* Центральная монета с плавной анимацией сжатия вместо смещения */}
                <div className="relative flex items-center justify-center py-6 select-none h-44">
                  {floatingNumbers.map((item) => (
                    <div
                      key={item.id}
                      className="absolute text-cyan-300 font-black text-base font-mono pointer-events-none animate-floatUp z-20"
                      style={{ left: `${item.x}px`, top: `${item.y}px` }}
                    >
                      +{item.val}
                    </div>
                  ))}

                  <div
                    onClick={handleCoinClick}
                    className={`w-36 h-36 rounded-full bg-gradient-to-tr from-cyan-500/20 via-sky-500/20 to-blue-600/20 flex items-center justify-center shadow-2xl shadow-cyan-500/40 cursor-pointer transition-transform duration-75 p-2 border-2 border-cyan-500/40 relative group ${
                      isTapped ? 'scale-90' : 'scale-100 hover:scale-105'
                    }`}
                  >
                    <img 
                      src="https://cdn.dedust.io/images/jetton:0:d36c08089460188aaaf294bb1f5fcef54b1e99a5e70d28840ba36ed682d7e0ac.webp?v=1794238582" 
                      alt="GRAM Coin" 
                      className="w-28 h-28 object-contain rounded-full drop-shadow-2xl select-none pointer-events-none"
                    />
                  </div>
                </div>

                {/* Энергия */}
                <div className="space-y-1 text-left">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-300">⚡ Энергия</span>
                    <span className="text-cyan-400">{energy} / {maxEnergy}</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-white/10">
                    <div className="bg-gradient-to-r from-cyan-500 to-sky-400 h-full transition-all duration-300" style={{ width: `${(energy / maxEnergy) * 100}%` }}></div>
                  </div>
                </div>

                {/* Бустеры */}
                <div className="pt-2 border-t border-white/10 space-y-2 text-left">
                  <div className="text-[11px] font-bold text-cyan-400 uppercase">🛠 Улучшения:</div>
                  
                  <div className="bg-[#0b101d] p-2.5 rounded-xl border border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">⚡ Multitap (Ур. {multitapLevel})</div>
                      <div className="text-[9px] text-cyan-400">Цена: {(multitapLevel * 200).toLocaleString()} GRAM</div>
                    </div>
                    <button
                      type="button"
                      onClick={upgradeMultitap}
                      className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs rounded-lg active:scale-95"
                    >
                      Качнуть
                    </button>
                  </div>

                  <div className="bg-[#0b101d] p-2.5 rounded-xl border border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">🔋 Energy Limit (Ур. {energyLimitLevel})</div>
                      <div className="text-[9px] text-cyan-400">Цена: {(energyLimitLevel * 300).toLocaleString()} GRAM</div>
                    </div>
                    <button
                      type="button"
                      onClick={upgradeEnergyLimit}
                      className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs rounded-lg active:scale-95"
                    >
                      Качнуть
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      <footer className="w-full max-w-md text-center pb-1 text-[9px] text-slate-500">
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
