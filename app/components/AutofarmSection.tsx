'use client';

interface AutofarmSectionProps {
  farmBalance: number;
  onClaimFarm: () => void;
}

export default function AutofarmSection({
  farmBalance,
  onClaimFarm,
}: AutofarmSectionProps) {
  return (
    <div className="bg-[#0b101d] p-3 rounded-2xl border border-cyan-500/30 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-base">
          ⛏️
        </div>
        <div>
          <div className="text-xs font-bold text-white">Авто-фарм (Шахта)</div>
          <div className="text-[10px] text-cyan-400 font-mono font-bold">
            {Math.floor(farmBalance).toLocaleString()} GRAM
          </div>
        </div>
      </div>
      <button
        type="button"
        disabled={farmBalance < 1}
        onClick={onClaimFarm}
        className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all ${
          farmBalance >= 1
            ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md active:scale-95'
            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
        }`}
      >
        Забрать
      </button>
    </div>
  );
}
