'use client';

interface StakingTabProps {
  stakedGramBalance: number;
  stakeInputAmount: string;
  setStakeInputAmount: (v: string) => void;
  stakingStartTime: number | null; // Timestamp когда пользователь положил в стейкинг
  stakingLoading: boolean;
  unstakeLoading: boolean;
  userAddress: string | null;
  onStakeAction: (isDeposit: boolean) => void;
}

export default function StakingTab({
  stakedGramBalance,
  stakeInputAmount,
  setStakeInputAmount,
  stakingStartTime,
  stakingLoading,
  unstakeLoading,
  userAddress,
  onStakeAction,
}: StakingTabProps) {

  // Расчет времени в стейкинге без секунд (в одну строку)
  const getElapsedTime = () => {
    if (!stakingStartTime || stakedGramBalance <= 0) return 'Неактивно (0 дн 0 ч 0 мин)';
    const diffMs = Date.now() - stakingStartTime;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffDays} дн. ${diffHours} ч. ${diffMinutes} мин.`;
  };

  // Расчет доходности (30% годовых APY)
  const inputVal = parseFloat(stakeInputAmount || '0');
  const activeStake = stakedGramBalance > 0 ? stakedGramBalance : (isNaN(inputVal) ? 0 : inputVal);

  // Формула: 30% в год -> за день (30% / 365), за месяц (~30 дней)
  const dailyReward = (activeStake * 0.30) / 365;
  const monthlyReward = (activeStake * 0.30) / 12;

  return (
    <div className="space-y-4 text-left animate-fadeIn pb-4">
      <div className="glass-card p-5 rounded-[2.5rem] space-y-4 relative overflow-hidden border border-amber-500/20 shadow-2xl">
        
        {/* Фоновое свечение */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div>
          <h2 className="text-sm font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
            <span>🔒</span> Персональный Стейкинг
          </h2>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Замораживайте токены под фиксированные 30% годовых. Таймер и начисление наград индивидуальны для вашего кошелька. Награды зачисляются раз в сутки.
          </p>
        </div>

        {/* Индивидуальное время в стейкинге (в одну строку без секунд) */}
        <div className="bg-slate-950/70 p-3 rounded-2xl border border-amber-500/20 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Время в стейкинге:</span>
          <span className="text-amber-400 font-bold">{getElapsedTime()}</span>
        </div>

        {/* Информация о балансе и калькулятор доходности */}
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/5 space-y-3">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Ваш активный стейк:</span>
            <span className="font-bold font-mono text-amber-300">{stakedGramBalance.toLocaleString()} GRAM</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Доходность:</span>
            <span className="font-bold font-mono text-emerald-400">30% APY (Награда раз в сутки)</span>
          </div>

          {/* Блок прогноза дохода (за день и месяц) */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-xs font-mono">
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-400 block">Доход за день:</span>
              <strong className="text-amber-400 text-sm">+{dailyReward.toFixed(2)} GRAM</strong>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-400 block">Доход за месяц:</span>
              <strong className="text-emerald-400 text-sm">+{monthlyReward.toFixed(2)} GRAM</strong>
            </div>
          </div>
        </div>

        {/* Управление стейкингом */}
        <div className="space-y-2.5">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300">Сумма токенов</label>
          <input
            type="number"
            value={stakeInputAmount}
            onChange={(e) => setStakeInputAmount(e.target.value)}
            className="w-full bg-slate-950/80 border border-amber-500/30 rounded-2xl px-3.5 py-3 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
            placeholder="100"
          />

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => onStakeAction(true)}
              disabled={stakingLoading}
              className="py-3.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs uppercase rounded-2xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all hover:brightness-110 disabled:opacity-50"
            >
              {stakingLoading ? 'Блокировка...' : 'В стейкинг 🔒'}
            </button>
            <button
              type="button"
              onClick={() => onStakeAction(false)}
              disabled={unstakeLoading}
              className="py-3.5 bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-200 font-bold text-xs uppercase rounded-2xl active:scale-95 transition-all disabled:opacity-50"
            >
              {unstakeLoading ? 'Снятие...' : 'Снять токены'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
