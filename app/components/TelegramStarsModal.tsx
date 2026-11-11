'use client';

interface TelegramStarsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBuyItem: (stars: number, rewardType: 'energy' | 'boost') => void;
}

export default function TelegramStarsModal({
  isOpen,
  onClose,
  onBuyItem,
}: TelegramStarsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-[#111726] border border-cyan-500/40 rounded-3xl p-5 w-full max-w-sm space-y-4 shadow-2xl text-center">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-extrabold uppercase text-cyan-400 tracking-wide">⭐ Telegram Stars Магазин</h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white text-base font-bold px-2 py-1"
          >
            ✕
          </button>
        </div>

        <p className="text-[11px] text-slate-300">
          Используйте официальные звезды Telegram для мгновенной прокачки в игре!
        </p>

        <div className="space-y-2.5">
          <div className="bg-[#070b14] p-3 rounded-2xl border border-white/10 flex items-center justify-between">
            <div className="text-left">
              <div className="text-xs font-bold text-white">⚡ Полная энергия</div>
              <div className="text-[10px] text-cyan-400">Мгновенный заряд до максимума</div>
            </div>
            <button
              type="button"
              onClick={() => onBuyItem(50, 'energy')}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs rounded-xl shadow active:scale-95"
            >
              50 ⭐
            </button>
          </div>

          <div className="bg-[#070b14] p-3 rounded-2xl border border-white/10 flex items-center justify-between">
            <div className="text-left">
              <div className="text-xs font-bold text-white">🚀 Супер-буст (+5000 GRAM)</div>
              <div className="text-[10px] text-cyan-400">Мгновенный бонус на баланс</div>
            </div>
            <button
              type="button"
              onClick={() => onBuyItem(150, 'boost')}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs rounded-xl shadow active:scale-95"
            >
              150 ⭐
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 bg-slate-800 text-slate-300 font-bold text-xs rounded-2xl border border-white/10 active:scale-95"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}
