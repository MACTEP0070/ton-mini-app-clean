'use client';

import AutofarmSection from './AutofarmSection';

interface GameTabProps {
  gameScore: number;
  tapPower: number;
  energy: number;
  maxEnergy: number;
  multitapLevel: number;
  energyLimitLevel: number;
  floatingNumbers: { id: number; x: number; y: number; val: number }[];
  isTapped: boolean;
  farmBalance: number;
  onCoinClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onUpgradeMultitap: () => void;
  onUpgradeEnergyLimit: () => void;
  onOpenDaily: () => void;
  onOpenLeaderboard: () => void;
  onOpenShop: () => void;
  onClaimFarm: () => void;
}

export default function GameTab({
  gameScore,
  tapPower,
  energy,
  maxEnergy,
  multitapLevel,
  energyLimitLevel,
  floatingNumbers,
  isTapped,
  farmBalance,
  onCoinClick,
  onUpgradeMultitap,
  onUpgradeEnergyLimit,
  onOpenDaily,
  onOpenLeaderboard,
  onOpenShop,
  onClaimFarm,
}: GameTabProps) {
  return (
    <div className="space-y-4 text-center animate-fadeIn pb-6">
      <div className="glass-card p-5 rounded-[2.5xl] space-y-4 relative overflow-hidden border border-cyan-500/20 shadow-[0_0_40px_rgba(0,0,0,0.6)] bg-gradient-to-b from-[#111726]/90 to-[#070b14]/95 backdrop-blur-2xl">
        
        {/* Фоновое неоновое свечение */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Шапка кликера */}
        <div className="flex items-center justify-between relative z-10 bg-slate-950/40 p-2.5 rounded-2xl border border-white/5">
          <span className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <span>⚡</span> GRAM Tap Engine
          </span>
          <span className="text-[11px] bg-cyan-500/15 text-cyan-300 px-3 py-1 rounded-xl font-extrabold font-mono border border-cyan-500/30 shadow-inner">
            +{tapPower} за тап
          </span>
        </div>

        {/* Баланс */}
        <div className="relative z-10 py-1">
          <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Игровой баланс</div>
          <div className="text-3xl font-black font-mono text-white mt-1 tracking-tight drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            {gameScore.toLocaleString()} <span className="text-cyan-400 text-sm">GRAM</span>
          </div>
        </div>

        {/* Кнопки быстрого доступа (Бонус, Топ, Магазин) */}
        <div className="grid grid-cols-3 gap-2.5 relative z-10">
          <button
            type="button"
            onClick={onOpenDaily}
            className="py-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-1.5 active:scale-95 transition-all hover:bg-emerald-500/30"
          >
            <span>🎁</span> Бонус
          </button>
          <button
            type="button"
            onClick={onOpenLeaderboard}
            className="py-3 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/40 text-yellow-300 font-extrabold text-xs rounded-2xl shadow-lg shadow-yellow-500/10 flex items-center justify-center gap-1.5 active:scale-95 transition-all hover:bg-yellow-500/30"
          >
            <span>🏆</span> Топ
          </button>
          <button
            type="button"
            onClick={onOpenShop}
            className="py-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-cyan-300 font-extrabold text-xs rounded-2xl shadow-lg shadow-cyan-500/10 flex items-center justify-center gap-1.5 active:scale-95 transition-all hover:bg-cyan-500/30"
          >
            <span>🛒</span> Магазин
          </button>
        </div>

        {/* Интерактивная монета (Жесткий фиксированный контейнер, абсолютно исключающий сдвиги) */}
        <div className="relative flex items-center justify-center py-4 select-none h-48 z-10">
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
            {floatingNumbers.map((item) => (
              <div
                key={item.id}
                className="absolute text-cyan-300 font-black text-xl font-mono animate-floatUp drop-shadow-[0_0_10px_rgba(6,182,212,0.9)]"
                style={{ left: `${item.x}px`, top: `${item.y}px` }}
              >
                +{item.val}
              </div>
            ))}
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <div
              onClick={onCoinClick}
              className={`w-40 h-40 rounded-full bg-gradient-to-tr from-cyan-500/30 via-sky-500/20 to-blue-600/30 flex items-center justify-center shadow-[0_0_35px_rgba(6,182,212,0.35)] cursor-pointer p-3 border-2 border-cyan-400/50 relative group ${
                isTapped ? 'coin-press' : 'hover:scale-105 transition-transform duration-200'
              }`}
              style={{ transformOrigin: 'center center' }}
            >
              <div className="absolute inset-0 rounded-full bg-cyan-400/10 animate-ping pointer-events-none"></div>
              <img 
                src="https://cdn.dedust.io/images/jetton:0:d36c08089460188aaaf294bb1f5fcef54b1e99a5e70d28840ba36ed682d7e0ac.webp?v=1794238582" 
                alt="GRAM Coin" 
                className="w-32 h-32 object-contain rounded-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)] select-none pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* Шкала энергии */}
        <div className="space-y-2 text-left relative z-10 bg-slate-950/40 p-3 rounded-2xl border border-white/5">
          <div className="flex justify-between text-xs font-mono font-bold">
            <span className="text-slate-300 flex items-center gap-1.5"><span>⚡</span> Энергия</span>
            <span className="text-cyan-400">{energy} / {maxEnergy}</span>
          </div>
          <div className="w-full bg-slate-900 h-3 rounded-xl overflow-hidden border border-cyan-500/20 p-0.5 shadow-inner">
            <div 
              className="bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-500 h-full rounded-xl transition-all duration-300 shadow-[0_0_12px_rgba(6,182,212,0.6)]" 
              style={{ width: `${(energy / maxEnergy) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Авто-фарм */}
        <div className="relative z-10">
          <AutofarmSection farmBalance={farmBalance} onClaimFarm={onClaimFarm} />
        </div>

        {/* Улучшения */}
        <div className="pt-3 border-t border-white/10 space-y-2.5 text-left relative z-10">
          <div className="text-[11px] font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1">
            <span>🛠</span> Прокачка тапа и энергии:
          </div>
          
          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-white/5 flex items-center justify-between shadow-md">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5"><span>⚡</span> Multitap <span className="text-cyan-400 font-mono text-[10px] bg-cyan-500/10 px-2 py-0.5 rounded-lg">(Ур. {multitapLevel})</span></div>
              <div className="text-[10px] text-slate-400 font-mono mt-1">Цена: <strong className="text-cyan-300">{(multitapLevel * 200).toLocaleString()} GRAM</strong></div>
            </div>
            <button
              type="button"
              onClick={onUpgradeMultitap}
              className="px-4 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 font-black text-xs uppercase rounded-xl shadow-lg active:scale-95 transition-all hover:brightness-110"
            >
              Улучшить
            </button>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-white/5 flex items-center justify-between shadow-md">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5"><span>🔋</span> Energy Limit <span className="text-cyan-400 font-mono text-[10px] bg-cyan-500/10 px-2 py-0.5 rounded-lg">(Ур. {energyLimitLevel})</span></div>
              <div className="text-[10px] text-slate-400 font-mono mt-1">Цена: <strong className="text-cyan-300">{(energyLimitLevel * 300).toLocaleString()} GRAM</strong></div>
            </div>
            <button
              type="button"
              onClick={onUpgradeEnergyLimit}
              className="px-4 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 font-black text-xs uppercase rounded-xl shadow-lg active:scale-95 transition-all hover:brightness-110"
            >
              Улучшить
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
