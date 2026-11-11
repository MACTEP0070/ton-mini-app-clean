'use client';

import { useState, useEffect } from 'react';
import {
  TonConnectUIProvider,
  useTonConnectUI,
  useTonAddress,
} from '@tonconnect/ui-react';
import { beginCell, toNano } from '@ton/core';

import ToastContainer from './components/ToastContainer';
import Header from './components/Header';
import CreateTab from './components/CreateTab';
import ManageTab from './components/ManageTab';
import InvestTab from './components/InvestTab';
import StakingTab from './components/StakingTab';
import GameTab from './components/GameTab';
import DailyRewardsModal from './components/DailyRewardsModal';
import LeaderboardModal from './components/LeaderboardModal';
import TonShopModal from './components/TonShopModal';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

const FEE_RECIPIENT_ADDRESS = 'UQAIOSFdlxtGH5SMRrFM216SFPj295rUDyQs6-gp_Ab_dm2g';

function MinterApp() {
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();

  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'presale' | 'staking' | 'game'>('game');
  const [isDailyOpen, setIsDailyOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);

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

  // Инвестиции (обычный GRAM)
  const [presaleAmount, setPresaleAmount] = useState('1');
  const [participating, setParticipating] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawInputAmount, setWithdrawInputAmount] = useState('100000');
  const [totalRaised, setTotalRaised] = useState(68203);
  const HARD_CAP = 100000;

  const [isSubscribed, setIsSubscribed] = useState(false);

  // Стейкинг (обычный GRAM)
  const [stakeInputAmount, setStakeInputAmount] = useState('100');
  const [stakedGramBalance, setStakedGramBalance] = useState<number>(0);
  const [stakingStartTime, setStakingStartTime] = useState<number | null>(null);
  const [stakingLoading, setStakingLoading] = useState(false);
  const [unstakeLoading, setUnstakeLoading] = useState(false);

  // Игровой баланс (GRAM-TOKEH-START) для кликера и вывода
  const [gameScore, setGameScore] = useState<number>(0);
  const [farmBalance, setFarmBalance] = useState<number>(0);
  const [autofarmExpiresAt, setAutofarmExpiresAt] = useState<number | null>(null);

  const [energy, setEnergy] = useState<number>(1000);
  const [maxEnergy, setMaxEnergy] = useState<number>(1000);
  const [tapPower, setTapPower] = useState<number>(1);
  const [multitapLevel, setMultitapLevel] = useState<number>(1);
  const [energyLimitLevel, setEnergyLimitLevel] = useState<number>(1);
  const [autoMinerLevel, setAutoMinerLevel] = useState<number>(0);
  const [critChanceLevel, setCritChanceLevel] = useState<number>(0);
  const [floatingNumbers, setFloatingNumbers] = useState<{ id: number; x: number; y: number; val: number; isCrit?: boolean }[]>([]);

  // Главный двигатель экономики
  useEffect(() => {
    const gameEngine = setInterval(() => {
      setEnergy((prev) => Math.min(maxEnergy, prev + 3));
      
      // Авто-майнер пополняет баланс GRAM-TOKEH-START
      const autoIncome = autoMinerLevel * 1.5;
      if (autoIncome > 0) {
        setGameScore((prev) => {
          const updated = prev + autoIncome;
          if (tgUser.id) {
            localStorage.setItem(`game_score_start_${tgUser.id}`, updated.toString());
          }
          return updated;
        });
      }

      // Начисление автофарма при активной подписке (30 дней)
      if (autofarmExpiresAt && Date.now() < autofarmExpiresAt) {
        setFarmBalance((prev) => {
          const updated = prev + 0.5;
          if (tgUser.id) {
            localStorage.setItem(`farm_balance_start_${tgUser.id}`, updated.toString());
          }
          return updated;
        });
      }
    }, 1000);

    return () => clearInterval(gameEngine);
  }, [maxEnergy, autoMinerLevel, autofarmExpiresAt, tgUser.id]);

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
      } else {
        currentId = userAddress || 'local_user';
        setTgUser({ id: currentId, name: 'Web User' });
      }

      const savedGameScore = localStorage.getItem(`game_score_start_${currentId}`);
      if (savedGameScore) setGameScore(parseFloat(savedGameScore));

      const savedFarm = localStorage.getItem(`farm_balance_start_${currentId}`);
      if (savedFarm) setFarmBalance(parseFloat(savedFarm));

      const savedAutofarmExp = localStorage.getItem(`autofarm_exp_${currentId}`);
      if (savedAutofarmExp) setAutofarmExpiresAt(parseInt(savedAutofarmExp, 10));

      const savedStake = localStorage.getItem(`stake_${currentId}_GRAM`);
      if (savedStake) setStakedGramBalance(parseFloat(savedStake));

      const savedStakeTime = localStorage.getItem(`stake_start_TIME_${currentId}`);
      if (savedStakeTime) setStakingStartTime(parseInt(savedStakeTime, 10));

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

      const savedAutoMiner = localStorage.getItem(`game_autominer_${currentId}`);
      if (savedAutoMiner) setAutoMinerLevel(parseInt(savedAutoMiner));

      const savedCrit = localStorage.getItem(`game_crit_${currentId}`);
      if (savedCrit) setCritChanceLevel(parseInt(savedCrit));

      const subStatus = localStorage.getItem(`subscribed_${currentId}`);
      if (subStatus === 'true') setIsSubscribed(true);
    }
  }, [userAddress]);

  const addGramTokens = (amountToAdd: number) => {
    setGameScore((prev) => {
      const newBalance = prev + amountToAdd;
      localStorage.setItem(`game_score_start_${tgUser.id}`, newBalance.toString());
      return newBalance;
    });
  };

  const handleClaimFarm = () => {
    if (farmBalance < 1) return;
    const earned = Math.floor(farmBalance);
    addGramTokens(earned);
    setFarmBalance(0);
    localStorage.setItem(`farm_balance_start_${tgUser.id}`, '0');
    showToast(`Собрано с автофарма: +${earned} GRAM-TOKEH-START! ⛏️`, 'success');
  };

  // Покупка Автофарма на 30 дней за 10 TON
  const handleBuyAutofarm = async () => {
    if (!userAddress) { showToast('Подключите кошелек TON!', 'error'); return; }

    try {
      const commentText = `AUTOFARM_30_DAYS | User:${tgUser.id}`;
      const commentCell = beginCell().storeUint(0, 32).storeStringTail(commentText).endCell();

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [{
          address: FEE_RECIPIENT_ADDRESS,
          amount: toNano('10').toString(),
          payload: commentCell.toBoc().toString('base64'),
        }],
      };

      await tonConnectUI.sendTransaction(transaction);

      const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
      setAutofarmExpiresAt(expiresAt);
      localStorage.setItem(`autofarm_exp_${tgUser.id}`, expiresAt.toString());

      showToast('Автофарм активирован на 30 дней! ⛏️🚀', 'success');
    } catch (err) {
      showToast('Оплата отменена.', 'error');
    }
  };

  // Покупка улучшений за TON
  const handlePayUpgradeInTon = async (tonCost: number, upgradeType: 'multitap' | 'energy' | 'autominer' | 'crit') => {
    if (!userAddress) { showToast('Подключите кошелек TON!', 'error'); return; }

    try {
      const commentText = `UPGRADE_${upgradeType.toUpperCase()} | Price:${tonCost}TON | User:${tgUser.id}`;
      const commentCell = beginCell().storeUint(0, 32).storeStringTail(commentText).endCell();

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [{
          address: FEE_RECIPIENT_ADDRESS,
          amount: toNano(tonCost.toString()).toString(),
          payload: commentCell.toBoc().toString('base64'),
        }],
      };

      await tonConnectUI.sendTransaction(transaction);

      if (upgradeType === 'multitap') {
        const newLvl = multitapLevel + 1;
        setMultitapLevel(newLvl);
        setTapPower(newLvl);
        localStorage.setItem(`game_multitap_${tgUser.id}`, newLvl.toString());
        showToast(`Multitap повышен до ур. ${newLvl}! ⚡`, 'success');
      } else if (upgradeType === 'energy') {
        const newLvl = energyLimitLevel + 1;
        setEnergyLimitLevel(newLvl);
        const newMax = 1000 + (newLvl - 1) * 500;
        setMaxEnergy(newMax);
        setEnergy(newMax);
        localStorage.setItem(`game_energylimit_${tgUser.id}`, newLvl.toString());
        showToast(`Energy Limit повышен до ур. ${newLvl}! 🔋`, 'success');
      } else if (upgradeType === 'autominer') {
        const newLvl = autoMinerLevel + 1;
        setAutoMinerLevel(newLvl);
        localStorage.setItem(`game_autominer_${tgUser.id}`, newLvl.toString());
        showToast(`Auto-Miner повышен до ур. ${newLvl}! 🤖`, 'success');
      } else if (upgradeType === 'crit') {
        const newLvl = critChanceLevel + 1;
        setCritChanceLevel(newLvl);
        localStorage.setItem(`game_crit_${tgUser.id}`, newLvl.toString());
        showToast(`Lucky Crit повышен до ур. ${newLvl}! 🔥`, 'success');
      }
    } catch (err) {
      showToast('Оплата отменена.', 'error');
    }
  };

  const handleBuyItemWithTon = async (tonAmount: number, rewardType: 'energy' | 'boost') => {
    if (!userAddress) { showToast('Подключите кошелек!', 'error'); return; }

    try {
      const commentText = `SHOP_BUY | Item:${rewardType} | Price:${tonAmount}TON`;
      const commentCell = beginCell().storeUint(0, 32).storeStringTail(commentText).endCell();

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [{
          address: FEE_RECIPIENT_ADDRESS,
          amount: toNano(tonAmount.toString()).toString(),
          payload: commentCell.toBoc().toString('base64'),
        }],
      };

      await tonConnectUI.sendTransaction(transaction);

      if (rewardType === 'energy') {
        setEnergy(maxEnergy);
        showToast(`Успешно! Энергия полностью восстановлена ⚡`, 'success');
      } else if (rewardType === 'boost') {
        addGramTokens(5000);
        showToast(`Успешно! +5,000 GRAM-TOKEH-START зачислено 🚀`, 'success');
      }
      setIsShopOpen(false);
    } catch (err) {
      showToast('Транзакция отменена.', 'error');
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
      
      const updatedStake = isDeposit ? stakedGramBalance + val : Math.max(0, stakedGramBalance - val);
      setStakedGramBalance(updatedStake);
      localStorage.setItem(`stake_${tgUser.id}_GRAM`, updatedStake.toString());

      if (isDeposit) {
        const now = Date.now();
        setStakingStartTime(now);
        localStorage.setItem(`stake_start_TIME_${tgUser.id}`, now.toString());
      } else if (updatedStake === 0) {
        setStakingStartTime(null);
        localStorage.removeItem(`stake_start_TIME_${tgUser.id}`);
      }

      showToast(isDeposit ? 'Успешно в стейкинге (GRAM)!' : 'Запрос на снятие отправлен!', 'success');
    } catch (err) {
      showToast('Отменено.', 'error');
    } finally {
      setStakingLoading(false);
      setUnstakeLoading(false);
    }
  };

  const handleTabChange = (tab: typeof activeTab) => {
    if ((tab === 'manage' || tab === 'create') && !userAddress) {
      showToast('Сначала подключите кошелек TON!', 'error');
      return;
    }
    setActiveTab(tab);
  };

  const handleCoinClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (energy < tapPower) {
      showToast('Недостаточно энергии!', 'info');
      return;
    }

    const containerRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - containerRect.left;
    const y = e.clientY - containerRect.top;

    const critChance = critChanceLevel * 2;
    const isCrit = Math.random() * 100 < critChance;
    const earnedVal = isCrit ? tapPower * 5 : tapPower;

    setEnergy((prev) => Math.max(0, prev - tapPower));
    addGramTokens(earnedVal);

    const newId = Date.now() + Math.random();
    setFloatingNumbers((prev) => [...prev, { id: newId, x, y, val: earnedVal, isCrit }]);
    setTimeout(() => {
      setFloatingNumbers((prev) => prev.filter((item) => item.id !== newId));
    }, 800);

    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.HapticFeedback) {
      const haptic = (window as any).Telegram.WebApp.HapticFeedback;
      if (isCrit) haptic.notificationOccurred('success');
      else haptic.impactOccurred('light');
    }
  };

  const handleCheckSubscription = () => {
    window.open('https://t.me/bunker_zona', '_blank');
    setTimeout(() => {
      if (!isSubscribed) {
        setIsSubscribed(true);
        localStorage.setItem(`subscribed_${tgUser.id}`, 'true');
        addGramTokens(100);
        showToast('Спасибо за подписку! +100 GRAM-TOKEH-START 🎉', 'success');
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
      showToast('Заявка отправлена! +100 GRAM-TOKEH-START 🎉', 'success');
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
      showToast('Успешно выполнено! +100 GRAM-TOKEH-START', 'success');
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
      const commentText = `INVEST_GRAM | Amount:${tonVal}TON | Investor:${userAddress}`;
      const commentCell = beginCell().storeUint(0, 32).storeStringTail(commentText).endCell();
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [{ address: FEE_RECIPIENT_ADDRESS, amount: toNano(tonVal.toString()).toString(), payload: commentCell.toBoc().toString('base64') }],
      };

      await tonConnectUI.sendTransaction(transaction);
      const tokensBought = tonVal * 1000;
      showToast(`Инвестиция успешна! Приобретено ${tokensBought.toLocaleString()} GRAM 💎`, 'success');
    } catch (err) {
      showToast('Отменено.', 'error');
    } finally {
      setParticipating(false);
    }
  };

  const handleWithdrawTokens = async () => {
    if (!userAddress) { showToast('Подключите кошелек!', 'error'); return; }
    const amountToWithdraw = parseFloat(withdrawInputAmount);
    if (isNaN(amountToWithdraw) || amountToWithdraw < 100000) { showToast('Минимум 100,000 GRAM-TOKEH-START', 'error'); return; }
    if (amountToWithdraw > gameScore) { showToast('Недостаточно намайненных GRAM-TOKEH-START', 'error'); return; }

    setWithdrawing(true);
    try {
      const commentText = `WITHDRAW_GRAM_TOKEH_START | Amount:${amountToWithdraw} | Wallet:${userAddress}`;
      const commentCell = beginCell().storeUint(0, 32).storeStringTail(commentText).endCell();
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [{ address: FEE_RECIPIENT_ADDRESS, amount: toNano('0.05').toString(), payload: commentCell.toBoc().toString('base64') }],
      };

      await tonConnectUI.sendTransaction(transaction);
      
      const newBal = gameScore - amountToWithdraw;
      setGameScore(newBal);
      localStorage.setItem(`game_score_start_${tgUser.id}`, newBal.toString());
      
      showToast('Запрос на вывод GRAM-TOKEH-START отправлен!', 'success');
    } catch (err) {
      showToast('Отменено.', 'error');
    } finally {
      setWithdrawing(false);
    }
  };

  const shareRefLink = () => {
    const refLink = `https://t.me/your_bot_username?start=ref_${tgUser.id}`;
    navigator.clipboard.writeText(refLink);
    showToast('Реферальная ссылка скопирована!', 'success');
  };

  const progressPercent = Math.min(100, (totalRaised / HARD_CAP) * 100).toFixed(1);
  const calculatedGramOutput = (parseFloat(presaleAmount || '0') * 1000).toLocaleString();

  return (
    <div className="min-h-screen bg-[#05070c] text-slate-100 flex flex-col items-center justify-between font-sans px-3 py-3 select-none overflow-x-hidden">
      
      <ToastContainer toasts={toasts} />

      <Header tgUser={tgUser} activeTab={activeTab} onTabChange={handleTabChange} />

      <main className="w-full max-w-md my-1 flex-1 pb-4">
        <div className="bg-[#0d121f]/95 border border-white/[0.08] rounded-[2.5rem] p-4 shadow-2xl space-y-3.5 backdrop-blur-2xl">
          
          {activeTab === 'game' && (
            <GameTab
              gameScore={gameScore}
              tapPower={tapPower}
              energy={energy}
              maxEnergy={maxEnergy}
              multitapLevel={multitapLevel}
              energyLimitLevel={energyLimitLevel}
              autoMinerLevel={autoMinerLevel}
              critChanceLevel={critChanceLevel}
              floatingNumbers={floatingNumbers}
              farmBalance={farmBalance}
              autofarmExpiresAt={autofarmExpiresAt}
              onCoinClick={handleCoinClick}
              onUpgradeMultitap={() => handlePayUpgradeInTon(0.1 * multitapLevel, 'multitap')}
              onUpgradeEnergyLimit={() => handlePayUpgradeInTon(0.1 * energyLimitLevel, 'energy')}
              onUpgradeAutoMiner={() => handlePayUpgradeInTon(0.2 * (autoMinerLevel + 1), 'autominer')}
              onUpgradeCritChance={() => handlePayUpgradeInTon(0.15 * (critChanceLevel + 1), 'crit')}
              onOpenDaily={() => setIsDailyOpen(true)}
              onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
              onOpenShop={() => setIsShopOpen(true)}
              onClaimFarm={handleClaimFarm}
              onBuyAutofarm={handleBuyAutofarm}
            />
          )}

          {activeTab === 'presale' && (
            <InvestTab
              userGramBalance={gameScore}
              withdrawInputAmount={withdrawInputAmount}
              setWithdrawInputAmount={setWithdrawInputAmount}
              withdrawing={withdrawing}
              isSubscribed={isSubscribed}
              totalRaised={totalRaised}
              progressPercent={progressPercent}
              presaleAmount={presaleAmount}
              setPresaleAmount={setPresaleAmount}
              calculatedGramOutput={calculatedGramOutput}
              participating={participating}
              userAddress={userAddress}
              onWithdrawTokens={handleWithdrawTokens}
              onCheckSubscription={handleCheckSubscription}
              onShareRefLink={shareRefLink}
              onPresaleParticipate={handlePresaleParticipate}
            />
          )}

          {activeTab === 'staking' && (
            <StakingTab
              stakedGramBalance={stakedGramBalance}
              stakeInputAmount={stakeInputAmount}
              setStakeInputAmount={setStakeInputAmount}
              stakingStartTime={stakingStartTime}
              stakingLoading={stakingLoading}
              unstakeLoading={unstakeLoading}
              userAddress={userAddress}
              onStakeAction={handleStakeAction}
            />
          )}

          {activeTab === 'manage' && (
            <ManageTab
              manageTokenAddress={manageTokenAddress}
              setManageTokenAddress={setManageTokenAddress}
              actionAmount={actionAmount}
              setActionAmount={setActionAmount}
              loading={loading}
              onCheckTokenOwnership={checkTokenOwnership}
              onAction={handleAction}
            />
          )}

          {activeTab === 'create' && (
            <CreateTab
              name={name} setName={setName}
              symbol={symbol} setSymbol={setSymbol}
              description={description} setDescription={setDescription}
              imageUri={imageUri} setImageUri={setImageUri}
              amount={amount} setAmount={setAmount}
              decimals={decimals} setDecimals={setDecimals}
              addLiquidity={addLiquidity} setAddLiquidity={setAddLiquidity}
              liquidityAmount={liquidityAmount} setLiquidityAmount={setLiquidityAmount}
              loading={loading}
              totalDisplayCost={totalDisplayCost}
              onMint={handleMint}
            />
          )}

        </div>
      </main>

      <DailyRewardsModal
        isOpen={isDailyOpen}
        onClose={() => setIsDailyOpen(false)}
        userId={tgUser.id}
        onClaimReward={(amt) => {
          addGramTokens(amt);
          showToast(`Вы получили ежедневный бонус +${amt} GRAM-TOKEH-START! 🎉`, 'success');
        }}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        userScore={gameScore}
        userName={tgUser.name}
        userId={tgUser.id}
      />

      <TonShopModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        onBuyItem={handleBuyItemWithTon}
      />

      <footer className="w-full max-w-md text-center pb-1 text-[9px] text-slate-500">
        TON Launchpad • Secure Smart Contracts
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
