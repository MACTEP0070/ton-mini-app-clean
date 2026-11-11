'use client';

interface ArenaTabProps {
  userTonBalance: number;
  onTopUpTon: (amount: number) => void;
  activeBattles: Array<{
    id: string;
    title: string;
    prize: string;
    totalPot: number;
    participantsCount: number;
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
    <div className="space-y-4 text-left animate-fadeIn pb-6">
      <div className="glass-card p-5 rounded-[2.5xl] space-y-4 relative overflow-hidden border border-cyan-500/20 shadow-2xl bg-gradient-to-b from-[#111726]/90 to-[#070b14]/95 backdrop-blur-2xl">
        
        {/* Фоновое свечение */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Шапка арены и баланс */}
        <div className="flex items-center justify-between bg-slate-950/60 p-3.5 rounded-2xl border border-amber-500/30">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Ваш баланс Арены</div>
            <div className="text-base font-black font-mono text-amber-400 mt-0.5">
              {userTonBalance.toFixed(2)} <span className="text-xs text-white">TON</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onTopUpTon(2)}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs uppercase rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all hover:brightness-110"
          >
            + Пополнить TON
          </button>
        </div>

        <div>
          <h2 className="text-sm font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
            <span>⚔️</span> Боевая Арена (PvP / Пулл подарков)
          </h2>
          <p className="text-[11px] text-slate-400 mt-1">
            Ставьте TON или NFT-подарки. Чем больше вклад, тем выше шанс забрать главный приз!
          </p>
        </div>

        {/* Активные бои / арены */}
        <div className="space-y-3">
          {activeBattles.map((battle) => (
            <div key={battle.id} className="bg-slate-950/70 p-4 rounded-2xl border border-white/10 space-y-3 shadow-md relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs font-black text-white flex items-center gap-1.5">
                    <span>🎁</span> {battle.title}
                  </div>
                  <div className="text-[10px] text-cyan-400 font-mono mt-0.5">Приз: {battle.prize}</div>
                </div>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono font-bold px-2.5 py-1 rounded-xl border border-amber-500/30">
                  ⏱ {battle.timeLeft}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-900/60 p-2.5 rounded-xl">
                <div>
                  <span className="text-slate-400 text-[10px] block">Банк раунда:</span>
                  <strong className="text-white text-sm">{battle.totalPot} TON</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Ваш шанс победить:</span>
                  <strong className="text-emerald-400 text-sm">{battle.myChance}%</strong>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onJoinBattle(battle.id, 1)}
                  className="flex-1 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 font-black text-xs uppercase rounded-xl shadow-md active:scale-95 transition-all hover:brightness-110"
                >
                  Поставить 1 TON
                </button>
                <button
                  type="button"
                  onClick={() => onJoinBattle(battle.id, 5)}
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-xs uppercase rounded-xl shadow-md active:scale-95 transition-all hover:brightness-110"
                >
                  Поставить 5 TON
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
