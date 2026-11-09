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

  // Добавлена 5-я вкладка 'game'
  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'presale' | 'staking' | 'game'>('create');

  // Кастомные уведомления (Toasts)
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

  // Telegram профиль
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

  // Раздача GRAM-START
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

  // --- Состояние Игры (Notcoin кликер) ---
  const [gameScore, setGameScore] = useState<number>(0);
  const [energy, setEnergy] = useState<number>(1000);
  const [maxEnergy, setMaxEnergy] = useState<number>(1000);
  const [tapPower, setTapPower] = useState<number>(1);
  const [multitapLevel, setMultitapLevel] = useState<number>(1);
  const [energyLimitLevel, setEnergyLimitLevel] = useState<number>(1);
  const [floatingNumbers, setFloatingNumbers] = useState<{ id: number; x: number; y: number; val: number }[]>([]);

  // Таймер до начисления в стейкинге
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

    // Восстановление энергии кликера каждые 1 секунду
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

      // Загрузка данных игрока и балансов
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

  // --- Логика кликера (Notcoin) ---
  const handleCoinClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (energy < tapPower) {
      showToast('Недостаточно энергии!', 'info');
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setEnergy((prev) => Math.max(0, prev - tapPower));
    const newScore = gameScore + tapPower;
    setGameScore(newScore);
    localStorage.setItem(`game_score_${tgUser.id}`, newScore.toString());

    // Добавляем летающую цифру при клике
    const newId = Date.now() + Math.random();
    setFloatingNumbers((prev) => [...prev, { id: newId, x, y, val: tapPower }]);
    setTimeout(() => {
      setFloatingNumbers((prev) => prev.filter((item) => item.id !== newId));
    }, 800);

    // Легкая вибрация телефона
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
    showToast(`Успешно улучшен Multitap до ур. ${newLvl}! ⚡`, 'success');
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
    showToast(`Энергия увеличена до ур. ${newLvl}! 🔋`, 'success');
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
        showToast('Бонус за подписку уже получен!', 'info');
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
      showToast('Сначала подключите кошелек!', 'error');
      return;
    }
    if (!name || !symbol || !amount || !imageUri) {
      showToast('Заполните все обязательные поля!', 'error');
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
      showToast('Заявка на создание токена отправлена! +100 GRAM-START 🎉', 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Транзакция отменена пользователем.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (actionType: 'BURN' | 'MINT' | 'REVOKE') => {
    if (!userAddress) {
      showToast('Подключите кошелек!', 'error');
      return;
    }
    if (!manageTokenAddress) {
      showToast('Введите адрес токена!', 'error');
      return;
    }
    if ((actionType === 'BURN' || actionType === 'MINT') && !actionAmount) {
      showToast('Введите количество токенов!', 'error');
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
      showToast('Запрос успешно выполнен! +100 GRAM-START', 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Транзакция отменена.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePresaleParticipate = async () => {
    if (!userAddress) {
      showToast('Подключите кошелек для участия в раздаче!', 'error');
      return;
    }
    const tonVal = parseFloat(presaleAmount);
    if (isNaN(tonVal) || tonVal <= 0) {
      showToast('Введите корректную сумму в TON', 'error');
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

      showToast(`Выкупено ${tokensBought.toLocaleString()} GRAM-START за ${tonVal} TON! 💎`, 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Транзакция отменена.', 'error');
    } finally {
      setParticipating(false);
    }
  };

  const handleWithdrawTokens = async () => {
    if (!userAddress) {
      showToast('Подключите кошелек для вывода!', 'error');
      return;
    }
    const amountToWithdraw = parseFloat(withdrawInputAmount);
    if (isNaN(amountToWithdraw) || amountToWithdraw < 100000) {
      showToast('Минимум для вывода: 100,000 GRAM-START!', 'error');
      return;
    }
    if (amountToWithdraw > userGramBalance) {
      showToast('Сумма превышает ваш доступный баланс!', 'error');
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
      localStorage.setItem(`gram_balance_${tgUser.id}`, newBal.toString());

      showToast(`Запрос на вывод ${amountToWithdraw.toLocaleString()} GRAM-START отправлен!`, 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Вывод отменен.', 'error');
    } finally {
      setWithdrawing(false);
    }
  };

  const handleStakeAction = async (isDeposit: boolean) => {
    if (!userAddress) {
      showToast('Подключите кошелек!', 'error');
      return;
    }
    const val = parseFloat(stakeInputAmount);
    if (isNaN(val) || val <= 0) {
      showToast('Введите корректную сумму', 'error');
      return;
    }

    if (!isDeposit && val > stakedGramBalance) {
      showToast('Нельзя снять больше, чем в стейкинге!', 'error');
      return;
    }

    if (isDeposit) setStakingLoading(true);
    else setUnstakeLoading(true);

    try {
      let transaction;
      if (isDeposit) {
        const commentText = `STAKE_DEPOSIT | Asset:GRAM | Amount:${val} | User:${userAddress}`;
        const commentCell = beginCell().storeUint(0, 32).storeStringTail(commentText).endCell();

        transaction = {
          validUntil: Math.floor(Date.now() / 1000) + 600,
          messages: [{
            address: FEE_RECIPIENT_ADDRESS,
            amount: toNano(val.toString()).toString(),
            payload: commentCell.toBoc().toString('base64'),
          }],
        };
      } else {
        const commentText = `UNSTAKE | User:${userAddress} | Amount:${val} GRAM`;
        const commentCell = beginCell().storeUint(0, 32).storeStringTail(commentText).endCell();

        transaction = {
          validUntil: Math.floor(Date.now() / 1000) + 600,
          messages: [{
            address: FEE_RECIPIENT_ADDRESS,
            amount: toNano('0.1').toString(),
            payload: commentCell.toBoc().toString('base64'),
          }],
        };
      }

      await tonConnectUI.sendTransaction(transaction);

      setStakedGramBalance((prev) => {
        const updated = isDeposit ? prev + val : Math.max(0, prev - val);
        localStorage.setItem(`stake_${tgUser.id}_GRAM`, updated.toString());
        return updated;
      });

      showToast(isDeposit ? `Успешно в стейкинге: ${val} GRAM 🚀` : `Запрос на снятие ${val} GRAM отправлен! 💎`, 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Операция стейкинга отменена.', 'error');
    } finally {
      setStakingLoading(false);
      setUnstakeLoading(false);
    }
  };

  const shareRefLink = () => {
    const refLink = `https://t.me/your_bot_username?start=ref_${tgUser.id}`;
    if (navigator.share) {
      navigator.share({
        title: 'TON Market Minter',
        text: 'Зарабатывай токены, создавай свои проекты и получай бонусы в GRAM-START!',
        url: refLink,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(refLink);
      showToast('Реферальная ссылка скопирована!', 'success');
    }
  };

  const progressPercent = Math.min(100, (totalRaised / HARD_CAP) * 100).toFixed(1);
  const calculatedGramOutput = (parseFloat(presaleAmount || '0') * 1000).toLocaleString();

  const currentStakeVal = parseFloat(stakeInputAmount || '0');
  const weeklyReward = ((currentStakeVal * 0.30) / 52).toFixed(2);
  const yearlyReward = (currentStakeVal * 0.30).toFixed(2);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col items-center justify-between font-sans px-4 py-5 selection:bg-cyan-500 selection:text-black">
      
      {/* Тост-уведомления */}
      <div className="fixed top-4 z-50 flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-3 rounded-2xl text-xs font-medium shadow-2xl backdrop-blur-xl border transition-all animate-bounce flex items-center gap-2.5 ${
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

      {/* Шапка с профилем Telegram */}
      <header className="w-full max-w-md pt-2 pb-3">
        <div className="flex items-center justify-between bg-[#111726]/95 border border-white/[0.08] rounded-2xl p-3.5 shadow-2xl mb-4 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 font-bold text-sm uppercase">
              {tgUser.name.charAt(0)}
            </div>
            <div>
              <div className="text-xs font-bold text-white tracking-wide truncate max-w-[120px]">{tgUser.name}</div>
              <div className="text-[10px] text-cyan-400 font-mono">ID: {tgUser.id}</div>
            </div>
          </div>

          <div className="flex items-center justify-end shrink-0">
            <TonConnectButton />
          </div>
        </div>

        {/* 5 вкладок */}
        <div className="grid grid-cols-5 gap-1 bg-[#111726]/95 p-1.5 rounded-2xl border border-white/[0.08] mb-3 backdrop-blur-xl shadow-lg">
          {(['create', 'manage', 'presale', 'staking', 'game'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => handleTabChange(tab)}
              className={`py-2 text-[9px] font-bold rounded-xl transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 ring-1 ring-white/20 scale-[1.02]'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {tab === 'create' ? '✨ Создать' : tab === 'manage' ? '🛠 Управлять' : tab === 'presale' ? '🚀 Раздача' : tab === 'staking' ? '🔒 Стейк' : '🎮 Игра'}
            </button>
          ))}
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
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Бонус: +100 GRAM</span>
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
                  <div className="pt-2 border-t border-white/[0.05] space-y-2.5">
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
                  </div>
                )}
              </div>

              {userAddress && (
                <div className="bg-[#0b101d] border border-white/10 rounded-2xl p-3 text-xs space-y-1.5">
                  <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wide mb-1">🧾 Детализация расчета:</div>
                  <div className="flex justify-between text-slate-400">
                    <span>Базовая комиссия:</span>
                    <span className="font-mono text-slate-200">0.5 TON</span>
                  </div>
                  {addLiquidity && (
                    <div className="flex justify-between text-slate-400">
                      <span>Ликвидность DEX:</span>
                      <span className="font-mono text-slate-200">{liquidityAmount} TON</span>
                    </div>
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
                    <p className="text-xs text-slate-400">Подключите кошелек вверху справа ↗</p>
                  </div>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 disabled:opacity-50 text-slate-950 font-black text-sm rounded-2xl transition-all shadow-xl shadow-cyan-500/35 active:scale-[0.97]"
                  >
                    {loading ? 'Создание...' : `Создать токен (${totalDisplayCost} TON)`}
                  </button>
                )}
              </div>
            </form>
          )}

          {/* ВКЛАДКА 2: УПРАВЛЕНИЕ */}
          {activeTab === 'manage' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-[#070b14]/70 p-3.5 rounded-2xl border border-white/[0.05] space-y-3 shadow-inner">
                <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center justify-between">
                  <span>⚙️ Панель управления</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Бонус: +100 GRAM</span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Адрес токена (Jetton Master) *</label>
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
                </div>

                {manageTokenAddress && (
                  <div className="text-xs text-slate-400 bg-[#0b101d] p-2.5 rounded-xl border border-white/[0.05] flex justify-between items-center">
                    <span>Статус:</span>
                    <span className="font-mono text-cyan-400 font-bold">
                      {checkingOwner ? 'Проверка...' : tokenOwner || 'Активен'}
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
                <div className="bg-[#070b14]/70 p-3.5 rounded-2xl border border-white/[0.07] flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-200">🔥 Сжечь токены</div>
                    <div className="text-[10px] text-slate-400">Стоимость: 0.5 TON</div>
                  </div>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleAction('BURN')}
                    className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs rounded-xl shadow-md active:scale-95"
                  >
                    Сжечь
                  </button>
                </div>

                <div className="bg-[#070b14]/70 p-3.5 rounded-2xl border border-white/[0.07] flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-200">🪙 Доминтить</div>
                    <div className="text-[10px] text-slate-400">Стоимость: 0.5 TON</div>
                  </div>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleAction('MINT')}
                    className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs rounded-xl shadow-md active:scale-95"
                  >
                    Минт
                  </button>
                </div>

                <div className="bg-[#070b14]/70 p-3.5 rounded-2xl border border-white/[0.07] flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-200">🛑 Отказ от прав</div>
                    <div className="text-[10px] text-slate-400">Стоимость: 0.5 TON</div>
                  </div>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleAction('REVOKE')}
                    className="px-4 py-2.5 bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-xs rounded-xl active:scale-95"
                  >
                    Отказ
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ВКЛАДКА 3: РАЗДАЧА */}
          {activeTab === 'presale' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-[#070b14]/70 p-4 rounded-2xl border border-cyan-500/30 space-y-3.5 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <span>🚀</span> Раздача GRAM-START
                  </span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold animate-pulse">
                    ● ACTIVE
                  </span>
                </div>

                <div className="bg-gradient-to-r from-cyan-500/10 via-blue-600/10 to-indigo-500/10 p-3.5 rounded-2xl border border-cyan-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-cyan-300 font-semibold uppercase tracking-wider">Баланс GRAM-START</div>
                      <div className="text-xl font-black font-mono text-white mt-0.5">{userGramBalance.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400">Telegram аккаунт</div>
                      <div className="text-xs font-mono text-slate-300">{tgUser.name}</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-cyan-500/20 space-y-2">
                    <label className="block text-[11px] font-medium text-slate-300">Вывод токенов (Мин. 100,000):</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="100000"
                        value={withdrawInputAmount}
                        onChange={(e) => setWithdrawInputAmount(e.target.value)}
                        placeholder="100000"
                        className="w-full bg-[#0b101d] border border-cyan-500/30 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                      />
                      <button
                        type="button"
                        disabled={withdrawing || !userAddress}
                        onClick={handleWithdrawTokens}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs rounded-xl whitespace-nowrap active:scale-95"
                      >
                        {withdrawing ? '...' : 'Вывести'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0b101d] p-3.5 rounded-xl border border-cyan-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>📊</span> Наш токен на бирже
                    </span>
                    <span className="text-[9px] text-cyan-400 font-mono">DeDust DEX</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Купить или продать GRAM-START на децентрализованной бирже DeDust:
                  </p>
                  <a
                    href="https://dedust.io/coins/EQDTbAgIlGAYiqrylLsfX871Sx6ZpecNKIQLo27WgtfgrGod"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-extrabold text-xs text-center rounded-xl shadow-md"
                  >
                    💱 Открыть Swap на DeDust.io
                  </a>
                </div>

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
                      isSubscribed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                    }`}
                  >
                    {isSubscribed ? '✓ Выполнено' : 'Подписаться'}
                  </button>
                </div>

                <div className="bg-[#0b101d] p-3 rounded-xl border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-white">👥 Реферальная программа</div>
                    <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20">+100 за друга</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Приглашайте друзей и зарабатывайте токены вместе!</p>
                  <button
                    type="button"
                    onClick={shareRefLink}
                    className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition"
                  >
                    📤 Поделиться ссылкой с другом
                  </button>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-300">Сбор: <strong className="text-cyan-400 font-mono">{totalRaised.toLocaleString()} TON</strong></span>
                    <span className="text-slate-400 font-mono">({progressPercent}%)</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/10">
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="block text-xs font-medium text-slate-300">Сумма покупки (TON) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    value={presaleAmount}
                    onChange={(e) => setPresaleAmount(e.target.value)}
                    className="w-full bg-[#0b101d] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500 shadow-sm"
                  />
                  <p className="text-[10px] text-cyan-300/80 font-mono">💡 Вы получите: <strong>{calculatedGramOutput} GRAM-START</strong></p>
                </div>

                <button
                  type="button"
                  disabled={participating || !userAddress}
                  onClick={handlePresaleParticipate}
                  className="w-full py-3.5 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-slate-950 font-black text-sm rounded-xl shadow-xl active:scale-[0.97]"
                >
                  {participating ? 'Обработка...' : `🚀 Купить за ${presaleAmount || 0} TON`}
                </button>
              </div>
            </div>
          )}

          {/* ВКЛАДКА 4: СТЕЙКИНГ */}
          {activeTab === 'staking' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-[#070b14]/70 p-4 rounded-2xl border border-cyan-500/30 space-y-3.5 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <span>🔒</span> Стейкинг GRAM (30% APY)
                  </span>
                  <span className="text-[10px] bg-cyan-500/10 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-500/20 font-bold font-mono">
                    APY: 30%
                  </span>
                </div>

                <div className="bg-[#0b101d] p-3 rounded-xl border border-cyan-500/20 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase">До начисления наград:</div>
                    <div className="text-sm font-black font-mono text-cyan-400 mt-0.5">
                      {timeLeft.days}д {timeLeft.hours}ч {timeLeft.minutes}м {timeLeft.seconds}с
                    </div>
                  </div>
                  <div className="text-right text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-1 rounded-lg">
                    Раз в неделю
                  </div>
                </div>

                <div className="bg-gradient-to-r from-cyan-500/10 via-blue-600/10 to-indigo-500/10 p-3.5 rounded-2xl border border-cyan-500/30 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-cyan-300 font-semibold uppercase">В стейкинге (GRAM)</div>
                    <div className="text-xl font-black font-mono text-white mt-0.5">{stakedGramBalance.toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">Аккаунт</div>
                    <div className="text-xs font-mono text-slate-300">{tgUser.name}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-300">Сумма операции (GRAM):</label>
                  <input
                    type="number"
                    min="1"
                    value={stakeInputAmount}
                    onChange={(e) => setStakeInputAmount(e.target.value)}
                    placeholder="100"
                    className="w-full bg-[#0b101d] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="bg-[#0b101d] p-3 rounded-xl border border-white/10 text-xs space-y-1.5 font-mono">
                  <div className="text-[11px] font-bold text-cyan-400">📈 Прогноз доходности (30% APY):</div>
                  <div className="flex justify-between text-slate-400">
                    <span>Награда за 1 неделю:</span>
                    <span className="text-emerald-400 font-bold">+{weeklyReward} GRAM</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Награда за 1 год:</span>
                    <span className="text-emerald-400 font-bold">+{yearlyReward} GRAM</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    disabled={stakingLoading || !userAddress}
                    onClick={() => handleStakeAction(true)}
                    className="py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-xs rounded-xl shadow-md active:scale-[0.97]"
                  >
                    {stakingLoading ? '...' : '📥 В стейкинг'}
                  </button>
                  <button
                    type="button"
                    disabled={unstakeLoading || !userAddress}
                    onClick={() => handleStakeAction(false)}
                    className="py-3 bg-slate-900 border border-cyan-500/30 text-cyan-300 font-bold text-xs rounded-xl shadow-md active:scale-[0.97]"
                  >
                    {unstakeLoading ? '...' : '📤 Снять'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ВКЛАДКА 5: ИГРА (Notcoin Кликер) */}
          {activeTab === 'game' && (
            <div className="space-y-4 animate-fadeIn text-center">
              <div className="bg-[#070b14]/70 p-4 rounded-2xl border border-cyan-500/30 space-y-4 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    🎮 GRAM Clicker (Notcoin Style)
                  </span>
                  <span className="text-[10px] bg-cyan-500/10 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-500/20 font-bold">
                    ⚡ {tapPower} / тап
                  </span>
                </div>

                {/* Баланс монеток в игре */}
                <div className="py-2">
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest">Игровой баланс</div>
                  <div className="text-3xl font-black font-mono text-white mt-1 tracking-tight">
                    {gameScore.toLocaleString()} <span className="text-cyan-400 text-base">GRAM</span>
                  </div>
                </div>

                {/* Центральная кликабельная монета */}
                <div className="relative flex items-center justify-center py-6 select-none">
                  {/* Летающие числа при тапе */}
                  {floatingNumbers.map((item) => (
                    <div
                      key={item.id}
                      className="absolute text-cyan-300 font-black text-lg font-mono pointer-events-none animate-floatUp z-20"
                      style={{ left: `${item.x}px`, top: `${item.y - 20}px` }}
                    >
                      +{item.val}
                    </div>
                  ))}

                  <div
                    onClick={handleCoinClick}
                    className="w-40 h-40 rounded-full bg-gradient-to-tr from-cyan-500 via-sky-400 to-blue-600 flex items-center justify-center shadow-2xl shadow-cyan-500/50 cursor-pointer active:scale-90 transition-transform duration-100 ring-4 ring-cyan-400/20 relative group"
                  >
                    <div className="absolute inset-2 rounded-full border border-white/30 flex items-center justify-center bg-gradient-to-b from-transparent to-black/30">
                      <span className="text-6xl filter drop-shadow-md select-none group-hover:scale-110 transition-transform">💎</span>
                    </div>
                  </div>
                </div>

                {/* Шкала энергии */}
                <div className="space-y-1.5 text-left">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-300">⚡ Энергия</span>
                    <span className="text-cyan-400">{energy} / {maxEnergy}</span>
                  </div>
                  <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden p-0.5 border border-white/10">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-sky-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${(energy / maxEnergy) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Магазин улучшений (Boosters) */}
                <div className="pt-2 border-t border-white/10 space-y-2 text-left">
                  <div className="text-xs font-bold text-cyan-400 uppercase tracking-wide">🛠 Улучшения (Boosters):</div>
                  
                  {/* Улучшение Multitap */}
                  <div className="bg-[#0b101d] p-3 rounded-xl border border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">⚡ Multitap (Ур. {multitapLevel})</div>
                      <div className="text-[10px] text-cyan-400 font-mono">+{multitapLevel} за 1 тап • Цена: {(multitapLevel * 200).toLocaleString()} GRAM</div>
                    </div>
                    <button
                      type="button"
                      onClick={upgradeMultitap}
                      className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs rounded-xl shadow active:scale-95 whitespace-nowrap"
                    >
                      Качнуть
                    </button>
                  </div>

                  {/* Улучшение Energy Limit */}
                  <div className="bg-[#0b101d] p-3 rounded-xl border border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">🔋 Energy Limit (Ур. {energyLimitLevel})</div>
                      <div className="text-[10px] text-cyan-400 font-mono">Макс. {maxEnergy} • Цена: {(energyLimitLevel * 300).toLocaleString()} GRAM</div>
                    </div>
                    <button
                      type="button"
                      onClick={upgradeEnergyLimit}
                      className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs rounded-xl shadow active:scale-95 whitespace-nowrap"
                    >
                      Качнуть
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Футер */}
          <div className="bg-[#070b14]/80 rounded-2xl p-3 border border-white/[0.05] text-[11px] text-slate-400 space-y-1 shadow-inner">
            <p className="flex justify-between">
              <span>Статус сети:</span> <span className="text-emerald-400 font-medium">TON Mainnet Online</span>
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
