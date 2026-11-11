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
  onClaimFarm,
}: GameTabProps) {
  return (
    <div className="space-y-3 text-center animate-fadeIn">
      <div className="bg-[#070b14]/70 p-3.5 rounded-2xl border border-cyan-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase text-cyan-400">🎮 GRAM Clicker</span>
          <span className="text-[10px] bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded-full font-bold font-mono">⚡ {tapPower} тап</span>
        </div>

        <div>
          <div className="text-[10px] text-slate-400 uppercase">Игровой баланс</div>
          <div className="text-2xl font-black font-mono text-white mt-0.5">
            {gameScore.toLocaleString()} <span className="text-cyan-400 text-xs">GRAM</span>
          </div>
        </div>

        {/* Кнопки бонусов и лидеров в один ряд */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onOpenDaily}
            className="py-2.5 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1 active:scale-95 transition-all"
          >
            <span>🎁 Бонус</span>
          </button>
          <button
            type="button"
            onClick={onOpenLeaderboard}
            className="py-2.5 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 text-yellow-300 font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1 active:scale-95 transition-all"
          >
            <span>🏆 Топ</span>
          </button>
        </div>

        {/* Монета кликера */}
        <div className="relative flex items-center justify-center py-4 select-none h-40">
          {floatingNumbers.map((item) => (
            <div
              key={item.id}
              className="absolute text-cyan-300 font-black text-base font-mono pointer-events-none animate-floatUp z-20"
              style={{ left: `${item.x}px`, top: `${item.y}px` }}
            >
              +{item.val}
            </div>
          ))}

          <div
            onClick={onCoinClick}
            className={`w-32 h-32 rounded-full bg-gradient-to-tr from-cyan-500/20 via-sky-500/20 to-blue-600/20 flex items-center justify-center shadow-2xl shadow-cyan-500/40 cursor-pointer transition-transform duration-75 p-2 border-2 border-cyan-500/40 relative group ${
              isTapped ? 'scale-90' : 'scale-100 hover:scale-105'
            }`}
          >
            <img 
              src="https://cdn.dedust.io/images/jetton:0:d36c08089460188aaaf294bb1f5fcef54b1e99a5e70d28840ba36ed682d7e0ac.webp?v=1794238582" 
              alt="GRAM Coin" 
              className="w-24 h-24 object-contain rounded-full drop-shadow-2xl select-none pointer-events-none"
            />
          </div>
        </div>

        {/* Шкала энергии */}
        <div className="space-y-1 text-left">
          <div className="flex justify-between text-[11px] font-mono">
            <span className="text-slate-300">⚡ Энергия</span>
            <span className="text-cyan-400">{energy} / {maxEnergy}</span>
          </div>
          <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-white/10">
            <div className="bg-gradient-to-r from-cyan-500 to-sky-400 h-full transition-all duration-300" style={{ width: `${(energy / maxEnergy) * 100}%` }}></div>
          </div>
        </div>

        {/* Блок авто-фарма */}
        <AutofarmSection farmBalance={farmBalance} onClaimFarm={onClaimFarm} />

        {/* Бустеры */}
        <div className="pt-2 border-t border-white/10 space-y-2 text-left">
          <div className="text-[11px] font-bold text-cyan-400 uppercase">🛠 Улучшения:</div>
          
          <div className="bg-[#0b101d] p-2.5 rounded-xl border border-white/10 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">⚡ Multitap (Ур. {multitapLevel})</div>
              <div className="text-[9px] text-cyan-400">Цена: {(multitapLevel * 200).toLocaleString()} GRAM</div>
            </div>
            <button
              type="button"
              onClick={onUpgradeMultitap}
              className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs rounded-lg active:scale-95"
            >
              Качнуть
            </button>
          </div>

          <div className="bg-[#0b101d] p-2.5 rounded-xl border border-white/10 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">🔋 Energy Limit (Ур. {energyLimitLevel})</div>
              <div className="text-[9px] text-cyan-400">Цена: {(energyLimitLevel * 300).toLocaleString()} GRAM</div>
            </div>
            <button
              type="button"
              onClick={onUpgradeEnergyLimit}
              className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs rounded-lg active:scale-95"
            >
              Качнуть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
