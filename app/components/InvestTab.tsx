'use client';

interface InvestTabProps {
  userGramBalance: number;
  withdrawInputAmount: string;
  setWithdrawInputAmount: (v: string) => void;
  withdrawing: boolean;
  isSubscribed: boolean;
  totalRaised: number;
  progressPercent: string;
  presaleAmount: string;
  setPresaleAmount: (v: string) => void;
  calculatedGramOutput: string;
  participating: boolean;
  userAddress: string | null;
  onWithdrawTokens: () => void;
  onCheckSubscription: () => void;
  onShareRefLink: () => void;
  onPresaleParticipate: () => void;
}

export default function InvestTab({
  userGramBalance,
  withdrawInputAmount,
  setWithdrawInputAmount,
  withdrawing,
  isSubscribed,
  totalRaised,
  progressPercent,
  presaleAmount,
  setPresaleAmount,
  calculatedGramOutput,
  participating,
  userAddress,
  onWithdrawTokens,
  onCheckSubscription,
  onShareRefLink,
  onPresaleParticipate,
}: InvestTabProps) {
  return (
    <div className="space-y-4 animate-fadeIn text-left">
      <div className="glass-card p-4 rounded-3xl space-y-4 relative overflow-hidden">
        
        {/* Фоновое свечение */}
        <div className="absolute top-0 left-0 w-36 h-36 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div>
          <h2 className="text-sm font-black uppercase text-cyan-400 tracking-wider flex items-center gap-1.5">
            <span>💎</span> GRAM-START Пресейл
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Ранний доступ к экосистемному активу на эксклюзивных условиях.
          </p>
        </div>

        {/* Прогресс сбора средств */}
        <div className="bg-[#070b14]/70 p-3.5 rounded-2xl border border-cyan-500/20 space-y-2">
          <div className="flex justify-between text-xs font-mono font-bold">
            <span className="text-slate-300">Собрано:</span>
            <span className="text-cyan-400">{totalRaised.toLocaleString()} / 100,000 TON</span>
          </div>
          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-cyan-500/20 p-0.5">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>Прогресс: {progressPercent}%</span>
            <span className="text-emerald-400 font-bold">Hard Cap: 100K TON</span>
          </div>
        </div>

        {/* Блок покупки (Пресейл) */}
        <div className="space-y-2.5">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300">Сумма инвестиции в TON</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={presaleAmount}
              onChange={(e) => setPresaleAmount(e.target.value)}
              className="flex-1 bg-[#070b14]/80 border border-cyan-500/30 rounded-2xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
              placeholder="1"
            />
            <div className="bg-cyan-500/10 border border-cyan-500/30 px-3.5 py-2.5 rounded-2xl flex items-center text-xs font-bold font-mono text-cyan-300">
              {calculatedGramOutput} GRAM
            </div>
          </div>

          <button
            type="button"
            onClick={onPresaleParticipate}
            disabled={participating}
            className="w-full py-3 bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 text-slate-950 font-black text-xs uppercase rounded-2xl shadow-lg shadow-cyan-500/25 active:scale-95 transition-all hover:brightness-110 disabled:opacity-50"
          >
            {participating ? 'Обработка транзакции...' : 'Инвестировать и получить токены 🚀'}
          </button>
        </div>

        {/* Баланс пользователя и вывод */}
        <div className="pt-3 border-t border-white/10 space-y-3">
          <div className="flex justify-between items-center bg-[#070b14]/60 p-3 rounded-2xl border border-white/5">
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Ваш баланс токенов</div>
              <div className="text-base font-black font-mono text-cyan-300 mt-0.5">
                {userGramBalance.toLocaleString()} <span className="text-xs text-white">GRAM</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onShareRefLink}
              className="px-3 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold text-[10px] rounded-xl active:scale-95 transition-all"
            >
              👥 Реф. ссылка
            </button>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300">Вывод токенов (мин. 100,000)</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={withdrawInputAmount}
                onChange={(e) => setWithdrawInputAmount(e.target.value)}
                className="flex-1 bg-[#070b14]/80 border border-cyan-500/30 rounded-2xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                placeholder="100000"
              />
              <button
                type="button"
                onClick={onWithdrawTokens}
                disabled={withdrawing}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-200 font-bold text-xs rounded-2xl active:scale-95 transition-all disabled:opacity-50"
              >
                {withdrawing ? '...' : 'Вывести'}
              </button>
            </div>
          </div>
        </div>

        {/* Бонус за подписку */}
        <div className="pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={onCheckSubscription}
            className={`w-full py-2.5 rounded-2xl border font-extrabold text-xs flex items-center justify-center gap-2 transition-all ${
              isSubscribed 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 cursor-default' 
                : 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500/40 text-cyan-200 hover:bg-cyan-500/30 active:scale-95'
            }`}
          >
            <span>{isSubscribed ? '✅ Подписка оформлена (+100 GRAM получено)' : '📢 Подписаться на канал и получить +100 GRAM'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
