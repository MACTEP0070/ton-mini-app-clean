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
    <div className="space-y-3.5 text-center animate-fadeIn pb-4">
      <div className="glass-card p-4 rounded-[2.5rem] space-y-3.5 relative overflow-hidden border border-amber-500/20 shadow-2xl">
        
        {/* Фоновое свечение */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center justify-between relative z-10 bg-slate-950/50 p-2.5 rounded-2xl border border-white/5">
          <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <span>⚡</span> GRAM Clicker
          </span>
          <span className="text-[11px] bg-amber-500/20 text-amber-300 px-3 py-1 rounded-xl font-extrabold font-mono border border-amber-500/30">
            +{tapPower} за тап
          </span>
        </div>

        <div className="relative z-10">
          <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Игровой баланс</div>
          <div className="text-3xl font-black font-mono text-white mt-1 tracking-tight drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]">
            {gameScore.toLocaleString()} <span className="text-amber-400 text-sm">GRAM</span>
          </div>
        </div>

        {/* Быстрые кнопки */}
        <div className="grid grid-cols-3 gap-2 relative z-10">
          <button
            type="button"
            onClick={onOpenDaily}
            className="py-2.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold text-xs rounded-2xl shadow-lg active:scale-95 transition-all hover:bg-emerald-500/30 flex items-center justify-center gap-1"
          >
            <span>🎁</span> Бонус
          </button>
          <button
            type="button"
            onClick={onOpenLeaderboard}
            className="py-2.5 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 text-amber-300 font-extrabold text-xs rounded-2xl shadow-lg active:scale-95 transition-all hover:bg-amber-500/30 flex items-center justify-center gap-1"
          >
            <span>🏆</span> Топ
          </button>
          <button
            type="button"
            onClick={onOpenShop}
            className="py-2.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-cyan-300 font-extrabold text-xs rounded-2xl shadow-lg active:scale-95 transition-all hover:bg-cyan-500/30 flex items-center justify-center gap-1"
          >
            <span>🛒</span> Магазин
          </button>
        </div>

        {/* Блок кликера с четким потоком (никаких абсолютов, перекрывающих элементы) */}
        <div className="relative w-full flex flex-col items-center justify-center py-2 select-none z-10">
          {/* Контейнер всплывающих цифр */}
          <div className="absolute inset-0 pointer-events-none overflow-visible z-30">
            {floatingNumbers.map((item) => (
              <div
                key={item.id}
                className="absolute text-amber-300 font-black text-lg font-mono pointer-events-none animate-floatUp drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                style={{ left: `${item.x}px`, top: `${item.y}px` }}
              >
                +{item.val}
              </div>
            ))}
          </div>

          {/* Сама монета со строго фиксированными размерами и трансформацией из центра */}
          <div
            onClick={onCoinClick}
            className={`w-36 h-36 rounded-full bg-gradient-to-tr from-amber-500/30 via-yellow-500/20 to-orange-600/30 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)] cursor-pointer p-2.5 border-2 border-amber-400/50 relative transition-transform duration-75 ease-out select-none my-1 ${
              isTapped ? 'scale-95' : 'hover:scale-102'
            }`}
            style={{ transformOrigin: 'center center' }}
          >
            <div className="absolute inset-0 rounded-full bg-amber-400/10 animate-ping pointer-events-none"></div>
            <img 
              src="https://cdn.dedust.io/images/jetton:0:d36c08089460188aaaf294bb1f5fcef54b1e99a5e70d28840ba36ed682d7e0ac.webp?v=1794238582" 
              alt="GRAM Coin" 
              className="w-28 h-28 object-contain rounded-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] select-none pointer-events-none"
            />
          </div>
        </div>

        {/* Шкала энергии */}
        <div className="space-y-2 text-left relative z-10 bg-slate-950/40 p-3 rounded-2xl border border-white/5">
          <div className="flex justify-between text-xs font-mono font-bold">
            <span className="text-slate-300 flex items-center gap-1.5"><span>⚡</span> Энергия</span>
            <span className="text-amber-400">{energy} / {maxEnergy}</span>
          </div>
          <div className="w-full bg-slate-900 h-3 rounded-xl overflow-hidden border border-amber-500/20 p-0.5 shadow-inner">
            <div 
              className="bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 h-full rounded-xl transition-all duration-300 shadow-[0_0_12px_rgba(245,158,11,0.6)]" 
              style={{ width: `${(energy / maxEnergy) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="relative z-10">
          <AutofarmSection farmBalance={farmBalance} onClaimFarm={onClaimFarm} />
        </div>

        {/* Прокачка */}
        <div className="pt-2 border-t border-white/10 space-y-2 text-left relative z-10">
          <div className="text-[11px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1">
            <span>🛠</span> Улучшения тапа и энергии:
          </div>
          
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-white/5 flex items-center justify-between shadow-md">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5"><span>⚡</span> Multitap <span className="text-amber-400 font-mono text-[10px] bg-amber-500/10 px-2 py-0.5 rounded-lg">(Ур. {multitapLevel})</span></div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">Цена: <strong className="text-amber-300">{(multitapLevel * 200).toLocaleString()} GRAM</strong></div>
            </div>
            <button
              type="button"
              onClick={onUpgradeMultitap}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-xs uppercase rounded-xl shadow-lg active:scale-95 transition-all hover:brightness-110"
            >
              Улучшить
            </button>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-2xl border border-white/5 flex items-center justify-between shadow-md">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5"><span>🔋</span> Energy Limit <span className="text-amber-400 font-mono text-[10px] bg-amber-500/10 px-2 py-0.5 rounded-lg">(Ур. {energyLimitLevel})</span></div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">Цена: <strong className="text-amber-300">{(energyLimitLevel * 300).toLocaleString()} GRAM</strong></div>
            </div>
            <button
              type="button"
              onClick={onUpgradeEnergyLimit}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-xs uppercase rounded-xl shadow-lg active:scale-95 transition-all hover:brightness-110"
            >
              Улучшить
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
