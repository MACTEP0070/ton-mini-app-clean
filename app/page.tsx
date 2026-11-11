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
import ArenaTab from './components/ArenaTab';
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

  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'presale' | 'staking' | 'game' | 'arena'>('game');
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

  // Инвестиции
  const [presaleAmount, setPresaleAmount] = useState('1');
  const [participating, setParticipating] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawInputAmount, setWithdrawInputAmount] = useState('100000');
  const [totalRaised, setTotalRaised] = useState(68203);
  const HARD_CAP = 100000;

  const [userGramBalance, setUserGramBalance] = useState<number>(0);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Стейкинг
  const [stakeInputAmount, setStakeInputAmount] = useState('100');
  const [stakedGramBalance, setStakedGramBalance] = useState<number>(0);
  const [stakingLoading, setStakingLoading] = useState(false);
  const [unstakeLoading, setUnstakeLoading] = useState(false);

  // Игра и Авто-фарм
  const [gameScore, setGameScore] = useState<number>(0);
  const [farmBalance, setFarmBalance] = useState<number>(0);
  const [energy, setEnergy] = useState<number>(1000);
  const [maxEnergy, setMaxEnergy] = useState<number>(1000);
  const [tapPower, setTapPower] = useState<number>(1);
  const [multitapLevel, setMultitapLevel] = useState<number>(1);
  const [energyLimitLevel, setEnergyLimitLevel] = useState<number>(1);
  const [floatingNumbers, setFloatingNumbers] = useState<{ id: number; x: number; y: number; val: number }[]>([]);
  const [isTapped, setIsTapped] = useState<boolean>(false);

  // Арена (PvP / Ставки TON)
  const [userTonBalance, setUserTonBalance] = useState<number>(12.5);
  const [activeBattles, setActiveBattles] = useState([
    { id: '1', title: 'Эксклюзивный NFT-подарок Snoop Dog', prize: 'Telegram Gift #77', totalPot: 15.0, timeLeft: '04:12', myChance: 25 },
    { id: '2', title: 'Быстрый банк TON', prize: '10 TON', totalPot: 8.5, timeLeft: '01:45', myChance: 40 },
  ]);

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

    const gameEngine = setInterval(() => {
      setEnergy((prev) => Math.min(maxEnergy, prev + 3));
      setFarmBalance((prev) => {
        const updated = prev + 0.5;
        if (tgUser.id) {
          localStorage.setItem(`farm_balance_${tgUser.id}`, updated.toString());
        }
        return updated;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(gameEngine);
    };
  }, [maxEnergy, tgUser.id]);

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

      const savedBalance = localStorage.getItem(`gram_balance_${currentId}`);
      if (savedBalance) setUserGramBalance(parseFloat(savedBalance));

      const savedStake = localStorage.getItem(`stake_${currentId}_GRAM`);
      if (savedStake) setStakedGramBalance(parseFloat(savedStake));

      const savedGameScore = localStorage.getItem(`game_score_${currentId}`);
      if (savedGameScore) setGameScore(parseFloat(savedGameScore));

      const savedFarm = localStorage.getItem(`farm_balance_${currentId}`);
      if (savedFarm) setFarmBalance(parseFloat(savedFarm));

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

  const handleClaimFarm = () => {
    if (farmBalance < 1) return;
    const earned = Math.floor(farmBalance);
    const newScore = gameScore + earned;
    setGameScore(newScore);
    setFarmBalance(0);
    localStorage.setItem(`game_score_${tgUser.id}`, newScore.toString());
    localStorage.setItem(`farm_balance_${tgUser.id}`, '0');
    showToast(`Собрано с шахты: +${earned} GRAM! ⛏️`, 'success');
  };

  const handleTopUpTon = async (tonAmount: number) => {
    if (!userAddress) {
      showToast('Подключите кошелек TON!', 'error');
      return;
    }

    try {
      const commentText = `ARENA_TOPUP | User:${tgUser.id}`;
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
      setUserTonBalance((prev) => prev + tonAmount);
      showToast(`Баланс успешно пополнен на +${tonAmount} TON! 💎`, 'success');
    } catch (err) {
      showToast('Транзакция отменена.', 'error');
    }
  };

  const handleJoinBattle = (battleId: string, betAmount: number) => {
    if (userTonBalance < betAmount) {
      showToast('Недостаточно TON на балансе арены!', 'error');
      return;
    }

    setUserTonBalance((prev) => prev - betAmount);
    setActiveBattles((prev) =>
      prev.map((b) => {
        if (b.id === battleId) {
          const newPot = b.totalPot + betAmount;
          const newChance = Math.min(95, b.myChance + Math.round(betAmount * 3));
          return { ...b, totalPot: newPot, myChance: newChance };
        }
        return b;
      })
    );
    showToast(`Ставка в ${betAmount} TON принята! Шанс победы вырос 🔥`, 'success');
  };

  const handleBuyItemWithTon = async (tonAmount: number, rewardType: 'energy' | 'boost') => {
    if (!userAddress) {
      showToast('Подключите кошелек для покупки!', 'error');
      return;
    }

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
        const newScore = gameScore + 5000;
        setGameScore(newScore);
        localStorage.setItem(`game_score_${tgUser.id}`, newScore.toString());
        showToast(`Успешно! +5,000 GRAM зачислено 🚀`, 'success');
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

  const handleTabChange = (tab: typeof activeTab) => {
    if ((tab === 'manage' || tab === 'arena' || tab === 'create') && !userAddress) {
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

    setEnergy((prev) => Math.max(0, prev - tapPower));
    const newScore = gameScore + tapPower;
    setGameScore(newScore);
    localStorage.setItem(`game_score_${tgUser.id}`, newScore.toString());

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
      const commentText = `INVEST_GRAM_START | Amount:${tonVal}TON | Investor:${userAddress}`;
      const commentCell = beginCell().storeUint(0, 32).storeStringTail(commentText).endCell();
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [{ address: FEE_RECIPIENT_ADDRESS, amount: toNano(tonVal.toString()).toString(), payload: commentCell.toBoc().toString('base64') }],
      };

      await tonConnectUI.sendTransaction(transaction);
      const tokensBought = tonVal * 1000;
      addGramTokens(tokensBought);
      setTotalRaised((prev) => prev + tonVal);
      showToast(`Инвестиция успешна! +${tokensBought.toLocaleString()} GRAM 💎`, 'success');
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
              floatingNumbers={floatingNumbers}
              isTapped={isTapped}
              farmBalance={farmBalance}
              onCoinClick={handleCoinClick}
              onUpgradeMultitap={upgradeMultitap}
              onUpgradeEnergyLimit={upgradeEnergyLimit}
              onOpenDaily={() => setIsDailyOpen(true)}
              onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
              onOpenShop={() => setIsShopOpen(true)}
              onClaimFarm={handleClaimFarm}
            />
          )}

          {activeTab === 'arena' && (
            <ArenaTab
              userTonBalance={userTonBalance}
              onTopUpTon={handleTopUpTon}
              activeBattles={activeBattles}
              onJoinBattle={handleJoinBattle}
            />
          )}

          {activeTab === 'presale' && (
            <InvestTab
              userGramBalance={userGramBalance}
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
              timeLeft={timeLeft}
              stakedGramBalance={stakedGramBalance}
              stakeInputAmount={stakeInputAmount}
              setStakeInputAmount={setStakeInputAmount}
              weeklyReward={((parseFloat(stakeInputAmount || '0') * 0.30) / 52).toFixed(2)}
              yearlyReward={(parseFloat(stakeInputAmount || '0') * 0.30).toFixed(2)}
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
          showToast(`Вы получили ежедневный бонус +${amt} GRAM! 🎉`, 'success');
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
        TON Snoop Arena • Secure Smart Contracts
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
