'use client';

import AutofarmSection from './AutofarmSection';

interface GameTabProps {
  gameScore: number;
  tapPower: number;
  energy: number;
  maxEnergy: number;
  multitapLevel: number;
  energyLimitLevel: number;
  autoMinerLevel: number;
  critChanceLevel: number;
  floatingNumbers: { id: number; x: number; y: number; val: number; isCrit?: boolean }[];
  farmBalance: number;
  autofarmExpiresAt: number | null;
  onCoinClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onUpgradeMultitap: () => void;
  onUpgradeEnergyLimit: () => void;
  onUpgradeAutoMiner: () => void;
  onUpgradeCritChance: () => void;
  onOpenDaily: () => void;
  onOpenLeaderboard: () => void;
  onOpenShop: () => void;
  onClaimFarm: () => void;
  onBuyAutofarm: () => void;
}

export default function GameTab({
  gameScore,
  tapPower,
  energy,
  maxEnergy,
  multitapLevel,
  energyLimitLevel,
  autoMinerLevel,
  critChanceLevel,
  floatingNumbers,
  farmBalance,
  autofarmExpiresAt,
  onCoinClick,
  onUpgradeMultitap,
  onUpgradeEnergyLimit,
  onUpgradeAutoMiner,
  onUpgradeCritChance,
  onOpenDaily,
  onOpenLeaderboard,
  onOpenShop,
  onClaimFarm,
  onBuyAutofarm,
}: GameTabProps) {
  const multitapPrice = (0.1 * multitapLevel).toFixed(2);
  const energyLimitPrice = (0.1 * energyLimitLevel).toFixed(2);
  const autoMinerPrice = (0.2 * (autoMinerLevel + 1)).toFixed(2);
  const critPrice = (0.15 * (critChanceLevel + 1)).toFixed(2);

  const isAutofarmActive = autofarmExpiresAt ? autofarmExpiresAt > Date.now() : false;

  return (
    <div className="space-y-4 text-center animate-fadeIn pb-4">
      <div className="glass-card p-4 rounded-[2.5rem] space-y-3.5 relative overflow-hidden border border-amber-500/30 shadow-[0_0_40px_rgba(245,158,11,0.15)]">
        
        {/* Фоновое динамичное свечение */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-amber-500/15 rounded-full blur-[60px] pointer-events-none"></div>

        <div className="flex items-center justify-between relative z-10 bg-slate-950/60 p-3 rounded-2xl border border-white/10 shadow-inner">
          <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <span>⚡</span> GRAM Mining
          </span>
          <span className="text-[11px] bg-amber-500/20 text-amber-300 px-3 py-1 rounded-xl font-extrabold font-mono border border-amber-500/30 shadow-sm">
            +{tapPower} тап
          </span>
        </div>

        <div className="relative z-10">
          <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Намайнено всего (GRAM-TOKEH-START)</div>
          <div className="text-3xl font-black font-mono text-white mt-1 tracking-tight drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]">
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

        {/* Интерактивная монета */}
        <div className="relative w-full h-44 flex items-center justify-center select-none z-10 my-1">
          <div className="absolute inset-0 pointer-events-none overflow-visible z-30">
            {floatingNumbers.map((item) => (
              <div
                key={item.id}
                className={`absolute font-black font-mono pointer-events-none animate-floatUp drop-shadow-[0_0_10px_rgba(245,158,11,0.9)] ${
                  item.isCrit ? 'text-red-400 text-xl scale-125' : 'text-amber-300 text-lg'
                }`}
                style={{ left: `${item.x}px`, top: `${item.y}px` }}
              >
                {item.isCrit ? `⚡ CRIT +${item.val}!` : `+${item.val}`}
              </div>
            ))}
          </div>

          <div
            onClick={onCoinClick}
            className="w-36 h-36 rounded-full bg-gradient-to-tr from-amber-500/30 via-yellow-500/20 to-orange-600/30 flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.4)] cursor-pointer p-2.5 border-2 border-amber-400/60 relative select-none transition-transform duration-100 ease-out active:scale-90 hover:scale-105"
            style={{ transformOrigin: 'center center' }}
          >
            <div className="absolute inset-0 rounded-full bg-amber-400/20 animate-ping pointer-events-none"></div>
            <img 
              src="https://cdn.dedust.io/images/jetton:0:d36c08089460188aaaf294bb1f5fcef54b1e99a5e70d28840ba36ed682d7e0ac.webp?v=1794238582" 
              alt="GRAM Coin" 
              className="w-28 h-28 object-contain rounded-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.7)] select-none pointer-events-none"
            />
          </div>
        </div>

        {/* Шкала энергии */}
        <div className="space-y-2 text-left relative z-10 bg-slate-950/50 p-3 rounded-2xl border border-white/10 shadow-inner">
          <div className="flex justify-between text-xs font-mono font-bold">
            <span className="text-slate-300 flex items-center gap-1.5"><span>⚡</span> Энергия</span>
            <span className="text-amber-400">{energy} / {maxEnergy}</span>
          </div>
          <div className="w-full bg-slate-900 h-3 rounded-xl overflow-hidden border border-amber-500/20 p-0.5 shadow-inner">
            <div 
              className="bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 h-full rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(245,158,11,0.7)]" 
              style={{ width: `${(energy / maxEnergy) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Блок Автофарма за 10 TON / 30 Дней */}
        <div className="relative z-10 bg-slate-950/70 p-3.5 rounded-2xl border border-amber-500/30 space-y-2 text-left shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>⛏️</span> Автофарм (30 Дней)
                {isAutofarmActive && <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-lg border border-emerald-500/40">Активен</span>}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {isAutofarmActive ? `Накоплено: ${Math.floor(farmBalance)} GRAM-TOKEH-START` : 'Требуется подписка за 10 TON'}
              </div>
            </div>

            {isAutofarmActive ? (
              <button
                type="button"
                onClick={onClaimFarm}
                className="px-4 py-2 bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-black text-xs uppercase rounded-xl shadow-lg active:scale-95 transition-all hover:brightness-110"
              >
                Собрать
              </button>
            ) : (
              <button
                type="button"
                onClick={onBuyAutofarm}
                className="px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-xs uppercase rounded-xl shadow-lg active:scale-95 transition-all hover:brightness-110"
              >
                10 TON / Мес
              </button>
            )}
          </div>
        </div>

        {/* Улучшения за TON */}
        <div className="pt-2 border-t border-white/10 space-y-2.5 text-left relative z-10">
          <div className="text-[11px] font-black text-amber-400 uppercase tracking-wider flex items-center justify-between">
            <span>🛠 Прокачка за TON:</span>
            <span className="text-[9px] text-slate-400 font-mono">Оплата в сеть TON</span>
          </div>
          
          {/* Multitap */}
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-white/5 flex items-center justify-between shadow-md hover:border-amber-500/20 transition-colors">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5"><span>⚡</span> Multitap <span className="text-amber-400 font-mono text-[10px] bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">(Ур. {multitapLevel})</span></div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">Цена: <strong className="text-amber-300">{multitapPrice} TON</strong></div>
            </div>
            <button
              type="button"
              onClick={onUpgradeMultitap}
              className="px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-xs uppercase rounded-xl shadow-lg active:scale-95 transition-all hover:brightness-110"
            >
              Купить
            </button>
          </div>

          {/* Energy Limit */}
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-white/5 flex items-center justify-between shadow-md hover:border-amber-500/20 transition-colors">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5"><span>🔋</span> Energy Limit <span className="text-amber-400 font-mono text-[10px] bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">(Ур. {energyLimitLevel})</span></div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">Цена: <strong className="text-amber-300">{energyLimitPrice} TON</strong></div>
            </div>
            <button
              type="button"
              onClick={onUpgradeEnergyLimit}
              className="px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-xs uppercase rounded-xl shadow-lg active:scale-95 transition-all hover:brightness-110"
            >
              Купить
            </button>
          </div>

          {/* Auto-Miner */}
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-white/5 flex items-center justify-between shadow-md hover:border-amber-500/20 transition-colors">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5"><span>🤖</span> Auto-Miner <span className="text-amber-400 font-mono text-[10px] bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">(Ур. {autoMinerLevel})</span></div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">Доход: +{(autoMinerLevel * 1.5).toFixed(1)}/сек | Цена: <strong className="text-amber-300">{autoMinerPrice} TON</strong></div>
            </div>
            <button
              type="button"
              onClick={onUpgradeAutoMiner}
              className="px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-xs uppercase rounded-xl shadow-lg active:scale-95 transition-all hover:brightness-110"
            >
              Купить
            </button>
          </div>

          {/* Lucky Crit */}
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-white/5 flex items-center justify-between shadow-md hover:border-amber-500/20 transition-colors">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5"><span>🔥</span> Lucky Crit <span className="text-amber-400 font-mono text-[10px] bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">(Ур. {critChanceLevel})</span></div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">Шанс x5: +{critChanceLevel * 2}% | Цена: <strong className="text-amber-300">{critPrice} TON</strong></div>
            </div>
            <button
              type="button"
              onClick={onUpgradeCritChance}
              className="px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-xs uppercase rounded-xl shadow-lg active:scale-95 transition-all hover:brightness-110"
            >
              Купить
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
