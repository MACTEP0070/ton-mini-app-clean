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
  userAddress: string | null;
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
    <div className="space-y-4 animate-fadeIn text-left">
      <div className="glass-card p-4 rounded-3xl space-y-4 relative overflow-hidden">
        
        {/* Фоновое свечение */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div>
          <h2 className="text-sm font-black uppercase text-cyan-400 tracking-wider flex items-center gap-1.5">
            <span>🔒</span> GRAM Стейкинг
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Замораживайте токены под фиксированные 30% годовых (APY).
          </p>
        </div>

        {/* Таймер события */}
        <div className="bg-[#070b14]/70 p-3 rounded-2xl border border-cyan-500/20 flex items-center justify-around text-center font-mono">
          <div>
            <div className="text-base font-black text-cyan-400">{timeLeft.days}</div>
            <div className="text-[9px] text-slate-400 uppercase">Дней</div>
          </div>
          <span className="text-cyan-500 font-bold">:</span>
          <div>
            <div className="text-base font-black text-cyan-400">{timeLeft.hours}</div>
            <div className="text-[9px] text-slate-400 uppercase">Часов</div>
          </div>
          <span className="text-cyan-500 font-bold">:</span>
          <div>
            <div className="text-base font-black text-cyan-400">{timeLeft.minutes}</div>
            <div className="text-[9px] text-slate-400 uppercase">Мин</div>
          </div>
          <span className="text-cyan-500 font-bold">:</span>
          <div>
            <div className="text-base font-black text-cyan-400">{timeLeft.seconds}</div>
            <div className="text-[9px] text-slate-400 uppercase">Сек</div>
          </div>
        </div>

        {/* Информация о текущем стейкинге */}
        <div className="bg-[#070b14]/60 p-3.5 rounded-2xl border border-white/5 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">В стейкинге:</span>
            <span className="font-bold font-mono text-cyan-300">{stakedGramBalance.toLocaleString()} GRAM</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Доходность:</span>
            <span className="font-bold font-mono text-emerald-400">30% APY</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Ожидаемо за год:</span>
            <span className="font-bold font-mono text-white">+{yearlyReward} GRAM</span>
          </div>
        </div>

        {/* Управление стейкингом */}
        <div className="space-y-2.5">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300">Количество токенов</label>
          <input
            type="number"
            value={stakeInputAmount}
            onChange={(e) => setStakeInputAmount(e.target.value)}
            className="w-full bg-[#070b14]/80 border border-cyan-500/30 rounded-2xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
            placeholder="100"
          />

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => onStakeAction(true)}
              disabled={stakingLoading}
              className="py-3 bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 font-black text-xs uppercase rounded-2xl shadow-lg shadow-cyan-500/20 active:scale-95 transition-all hover:brightness-110 disabled:opacity-50"
            >
              {stakingLoading ? 'Блокировка...' : 'В стейкинг 🔒'}
            </button>
            <button
              type="button"
              onClick={() => onStakeAction(false)}
              disabled={unstakeLoading}
              className="py-3 bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-200 font-bold text-xs uppercase rounded-2xl active:scale-95 transition-all disabled:opacity-50"
            >
              {unstakeLoading ? 'Снятие...' : 'Снять токены'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
