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
  userAddress: string;
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
    <div className="space-y-3 animate-fadeIn">
      <div className="bg-[#070b14]/70 p-3.5 rounded-2xl border border-cyan-500/30 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold uppercase text-cyan-400">💎 Инвестиции в GRAM-START</span>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold">SALE LIVE</span>
        </div>

        {/* Главное объяснение модели инвестора */}
        <div className="bg-gradient-to-r from-cyan-500/10 via-blue-600/10 to-indigo-600/10 p-3 rounded-2xl border border-cyan-500/40 space-y-2 text-left">
          <div className="text-xs font-extrabold text-cyan-300 flex items-center gap-1.5">
            <span>🛡️ Честная токеномика проекта</span>
          </div>
          <p className="text-[10px] text-slate-300 leading-relaxed">
            Любая покупка токена и активность в нашем Telegram Mini App — это прямая инвестиция в экосистему. **100% доходов нашего бота и всех сервисов направляются в монету** (выкуп с рынка, обеспечение ликвидности и развитие). Покупая токен, вы становитесь полноценным совладельцем проекта!
          </p>
        </div>

        <div className="bg-[#0b101d] p-3 rounded-xl border border-white/10 space-y-2 text-left">
          <div className="text-[10px] text-cyan-400 uppercase font-bold">Ваш баланс токенов:</div>
          <div className="text-xl font-black font-mono text-white">{userGramBalance.toLocaleString()} <span className="text-xs text-cyan-400">GRAM</span></div>
          <div className="flex gap-2 pt-1">
            <input
              type="number"
              min="100000"
              value={withdrawInputAmount}
              onChange={(e) => setWithdrawInputAmount(e.target.value)}
              placeholder="Мин. 100,000 GRAM"
              className="w-full bg-[#070b14] border border-cyan-500/30 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono"
            />
            <button
              type="button"
              disabled={withdrawing || !userAddress}
              onClick={onWithdrawTokens}
              className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl active:scale-95 transition-all"
            >
              Вывести
            </button>
          </div>
        </div>

        {/* Блок биржи DeDust */}
        <div className="bg-[#0b101d] p-3 rounded-xl border border-cyan-400 shadow-lg shadow-cyan-500/10 space-y-2 text-left">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-cyan-300 uppercase tracking-wide">⭐ Торговля на DeDust DEX</span>
            <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-mono">Ликвидность 100%</span>
          </div>
          <p className="text-[10px] text-slate-300 leading-relaxed">
            Наш токен торгуется на децентрализованной бирже <strong>DeDust.io</strong>. Вы можете мгновенно купить или продать его по рыночному курсу в пару кликов.
          </p>
          <a
            href="https://dedust.io/coins/EQDTbAgIlGAYiqrylLsfX871Sx6ZpecNKIQLo27WgtfgrGod"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black text-xs text-center rounded-xl shadow-md active:scale-95 transition-all"
          >
            💱 Открыть Swap на DeDust.io
          </a>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onCheckSubscription}
            disabled={isSubscribed}
            className="py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold text-[10px] rounded-xl border border-white/10 active:scale-95 transition-all"
          >
            {isSubscribed ? '✓ Подписка оформлена' : '📢 Канал (+100 GRAM)'}
          </button>
          <button
            type="button"
            onClick={onShareRefLink}
            className="py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold text-[10px] rounded-xl border border-white/10 active:scale-95 transition-all"
          >
            👥 Рефералы (+100)
          </button>
        </div>

        <div className="space-y-1 text-left">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-300">Сбор инвесторов: <strong className="text-cyan-400">{totalRaised} TON</strong></span>
            <span className="text-slate-400">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/10">
            <div className="bg-cyan-500 h-full" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        <div className="space-y-1 text-left">
          <label className="text-[10px] text-slate-400 uppercase">Сумма инвестиций в TON:</label>
          <input
            type="number"
            step="0.01"
            min="0.1"
            value={presaleAmount}
            onChange={(e) => setPresaleAmount(e.target.value)}
            className="w-full bg-[#0b101d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
          />
          <p className="text-[10px] text-cyan-300">Вы получаете: <strong>{calculatedGramOutput} GRAM-START</strong></p>
        </div>

        <button
          type="button"
          disabled={participating || !userAddress}
          onClick={onPresaleParticipate}
          className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-xs rounded-xl shadow-lg active:scale-95 transition-all"
        >
          Инвестировать {presaleAmount || 0} TON
        </button>
      </div>
    </div>
  );
}
