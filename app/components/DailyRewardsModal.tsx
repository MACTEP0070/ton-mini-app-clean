'use client';

import { useState, useEffect } from 'react';

interface DailyRewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimReward: (amount: number) => void;
  userId: string;
}

export default function DailyRewardsModal({
  isOpen,
  onClose,
  onClaimReward,
  userId,
}: DailyRewardsModalProps) {
  const [day, setDay] = useState<number>(1);
  const [canClaim, setCanClaim] = useState<boolean>(true);

  const rewards = [
    { day: 1, amount: 100 },
    { day: 2, amount: 250 },
    { day: 3, amount: 500 },
    { day: 4, amount: 1000 },
    { day: 5, amount: 2000 },
    { day: 6, amount: 3500 },
    { day: 7, amount: 5000 },
  ];

  useEffect(() => {
    if (!isOpen) return;
    const lastClaimDate = localStorage.getItem(`last_claim_date_${userId}`);
    const savedDay = localStorage.getItem(`claim_day_${userId}`);
    
    const today = new Date().toDateString();

    if (savedDay) {
      setDay(parseInt(savedDay));
    }

    if (lastClaimDate === today) {
      setCanClaim(false);
    } else {
      setCanClaim(true);
    }
  }, [isOpen, userId]);

  const handleClaim = () => {
    if (!canClaim) return;

    const currentReward = rewards[(day - 1) % rewards.length].amount;
    onClaimReward(currentReward);

    const today = new Date().toDateString();
    localStorage.setItem(`last_claim_date_${userId}`, today);

    const nextDay = (day % rewards.length) + 1;
    setDay(nextDay);
    localStorage.setItem(`claim_day_${userId}`, nextDay.toString());
    setCanClaim(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-[#111726] border border-cyan-500/40 rounded-3xl p-5 w-full max-w-sm space-y-4 shadow-2xl text-center">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-extrabold uppercase text-cyan-400 tracking-wide">🎁 Ежедневные награды</h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white text-base font-bold px-2 py-1"
          >
            ✕
          </button>
        </div>

        <p className="text-[11px] text-slate-300">
          Заходите каждый день, забирайте GRAM-монеты и увеличивайте свою серию!
        </p>

        <div className="grid grid-cols-4 gap-2">
          {rewards.map((r, idx) => {
            const isCurrent = idx + 1 === ((day - 1) % 7) + 1;
            const isPassed = idx + 1 < ((day - 1) % 7) + 1;

            return (
              <div
                key={r.day}
                className={`p-2 rounded-2xl border flex flex-col items-center justify-center text-xs font-mono ${
                  isCurrent 
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/20 scale-105' 
                    : isPassed 
                    ? 'bg-slate-900/40 border-white/5 text-slate-500' 
                    : 'bg-[#070b14] border-white/10 text-slate-300'
                }`}
              >
                <span className="text-[9px] opacity-70">День {r.day}</span>
                <span className="font-bold text-[11px] mt-1">+{r.amount}</span>
                <span className="text-[10px] mt-0.5">{isPassed ? '✅' : '🪙'}</span>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          disabled={!canClaim}
          onClick={handleClaim}
          className={`w-full py-3 rounded-2xl font-black text-xs shadow-lg transition-all ${
            canClaim 
              ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 active:scale-95' 
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          {canClaim ? 'Забрать награду' : 'Награда уже получена сегодня ⏳'}
        </button>
      </div>
    </div>
  );
}
