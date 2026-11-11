'use client';

interface ArenaTabProps {
  userTonBalance: number;
  onTopUpTon: (amount: number) => void;
  activeBattles: Array<{
    id: string;
    title: string;
    prize: string;
    totalPot: number;
    timeLeft: string;
    myChance: number;
  }>;
  onJoinBattle: (battleId: string, betAmount: number) => void;
}

export default function ArenaTab({
  userTonBalance,
  onTopUpTon,
  activeBattles,
  onJoinBattle,
}: ArenaTabProps) {
  return (
    <div className="space-y-4 text-left animate-fadeIn pb-4">
      <div className="glass-card p-5 rounded-[2.5rem] space-y-4 relative overflow-hidden border border-amber-500/20 shadow-2xl">
        
        {/* Фоновое свечение */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Шапка арены и баланс */}
        <div className="flex items-center justify-between bg-slate-950/70 p-3.5 rounded-2xl border border-amber-500/30">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Баланс Арены (TON)</div>
            <div className="text-base font-black font-mono text-amber-400 mt-0.5">
              {userTonBalance.toFixed(2)} <span className="text-xs text-white">TON</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onTopUpTon(2)}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-xs uppercase rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all hover:brightness-110"
          >
            + Пополнить TON
          </button>
        </div>

        <div>
          <h2 className="text-sm font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
            <span>⚔️</span> Snoop Arena & NFT Gifts
          </h2>
          <p className="text-[11px] text-slate-400 mt-1">
            Делайте ставки в TON или отправляйте NFT-подарки. Больше ставка — выше шанс забрать главный банк!
          </p>
        </div>

        {/* Список лобби */}
        <div className="space-y-3">
          {activeBattles.map((battle) => (
            <div key={battle.id} className="bg-slate-950/70 p-4 rounded-2xl border border-white/10 space-y-3 shadow-md relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs font-black text-white flex items-center gap-1.5">
                    <span>🎁</span> {battle.title}
                  </div>
                  <div className="text-[10px] text-amber-400 font-mono mt-0.5">Приз: {battle.prize}</div>
                </div>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono font-bold px-2.5 py-1 rounded-xl border border-amber-500/30">
                  ⏱ {battle.timeLeft}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-900/60 p-3 rounded-xl border border-white/5">
                <div>
                  <span className="text-slate-400 text-[10px] block">Общий банк:</span>
                  <strong className="text-white text-sm">{battle.totalPot} TON</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Ваш шанс победить:</span>
                  <strong className="text-emerald-400 text-sm">{battle.myChance}%</strong>
                </div>
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => onJoinBattle(battle.id, 1)}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs uppercase rounded-xl shadow-md active:scale-95 transition-all hover:brightness-110"
                >
                  Ставка 1 TON
                </button>
                <button
                  type="button"
                  onClick={() => onJoinBattle(battle.id, 5)}
                  className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-slate-950 font-black text-xs uppercase rounded-xl shadow-md active:scale-95 transition-all hover:brightness-110"
                >
                  Ставка 5 TON
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
