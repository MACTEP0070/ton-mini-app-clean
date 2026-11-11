'use client';

interface StakingTabProps {
  timeLeft: { days: number; hours: number; minutes: number; seconds: number };
  stakedGramBalance: number;
  stakeInputAmount: string;
  setStakeInputAmount: (v: string) => void;
  weeklyReward: string;
  yearlyReward: string;
  stakingLoading: boolean;
  unstakeLoading: boolean;
  userAddress: string;
  onStakeAction: (isDeposit: boolean) => void;
}

export default function StakingTab({
  timeLeft,
  stakedGramBalance,
  stakeInputAmount,
  setStakeInputAmount,
  weeklyReward,
  yearlyReward,
  stakingLoading,
  unstakeLoading,
  userAddress,
  onStakeAction,
}: StakingTabProps) {
  return (
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
            onClick={() => onStakeAction(true)}
            className="py-2.5 bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow"
          >
            📥 В стейкинг
          </button>
          <button
            type="button"
            disabled={unstakeLoading || !userAddress}
            onClick={() => onStakeAction(false)}
            className="py-2.5 bg-slate-800 text-cyan-300 font-bold text-xs rounded-xl border border-cyan-500/30"
          >
            📤 Снять
          </button>
        </div>
      </div>
    </div>
  );
}
