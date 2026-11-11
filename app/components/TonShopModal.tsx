'use client';

interface TonShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBuyItem: (tonAmount: number, rewardType: 'energy' | 'boost') => void;
}

export default function TonShopModal({ isOpen, onClose, onBuyItem }: TonShopModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="glass-card border border-cyan-500/40 rounded-3xl p-5 w-full max-w-sm space-y-4 text-center shadow-2xl relative overflow-hidden">
        
        {/* Свечение */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex justify-between items-center relative z-10">
          <h3 className="text-sm font-black uppercase text-cyan-400 tracking-wider">💎 Магазин за TON</h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white text-base font-bold px-2 py-1"
          >
            ✕
          </button>
        </div>

        <p className="text-[11px] text-slate-300 relative z-10">
          Мгновенные улучшения и пополнение баланса через ваш TON-кошелек.
        </p>

        <div className="space-y-2.5 relative z-10">
          {/* Энергия */}
          <div className="bg-[#070b14]/80 p-3 rounded-2xl border border-white/10 flex items-center justify-between">
            <div className="text-left">
              <div className="text-xs font-bold text-white">⚡ Полная энергия</div>
              <div className="text-[10px] text-cyan-400">Мгновенный заряд шкалы</div>
            </div>
            <button
              type="button"
              onClick={() => onBuyItem(0.5, 'energy')}
              className="px-3.5 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-xs rounded-xl shadow-md active:scale-95 transition-all hover:brightness-110"
            >
              0.5 TON
            </button>
          </div>

          {/* Бустер монет */}
          <div className="bg-[#070b14]/80 p-3 rounded-2xl border border-white/10 flex items-center justify-between">
            <div className="text-left">
              <div className="text-xs font-bold text-white">🚀 Бонус +5,000 GRAM</div>
              <div className="text-[10px] text-cyan-400">Зачисление на баланс</div>
            </div>
            <button
              type="button"
              onClick={() => onBuyItem(1.5, 'boost')}
              className="px-3.5 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-xs rounded-xl shadow-md active:scale-95 transition-all hover:brightness-110"
            >
              1.5 TON
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 bg-slate-800 text-slate-300 font-bold text-xs rounded-2xl border border-white/10 active:scale-95 relative z-10"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}
