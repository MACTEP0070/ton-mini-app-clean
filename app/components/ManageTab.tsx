'use client';

interface ManageTabProps {
  manageTokenAddress: string;
  setManageTokenAddress: (v: string) => void;
  actionAmount: string;
  setActionAmount: (v: string) => void;
  loading: boolean;
  onCheckTokenOwnership: (addr: string) => void;
  onAction: (actionType: 'BURN' | 'MINT' | 'REVOKE') => void;
}

export default function ManageTab({
  manageTokenAddress,
  setManageTokenAddress,
  actionAmount,
  setActionAmount,
  loading,
  onCheckTokenOwnership,
  onAction,
}: ManageTabProps) {
  return (
    <div className="space-y-3 animate-fadeIn">
      <div className="bg-[#070b14]/70 p-3 rounded-2xl border border-white/[0.05] space-y-2.5">
        <div className="text-[11px] font-bold text-cyan-400 uppercase">⚙️ Управление токеном</div>
        <input
          type="text"
          placeholder="Адрес токена (EQ...)"
          value={manageTokenAddress}
          onChange={(e) => {
            setManageTokenAddress(e.target.value);
            onCheckTokenOwnership(e.target.value);
          }}
          className="w-full bg-[#0b101d] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
        />
        <input
          type="number"
          placeholder="Количество токенов"
          value={actionAmount}
          onChange={(e) => setActionAmount(e.target.value)}
          className="w-full bg-[#0b101d] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
        />
      </div>

      <div className="space-y-2.5">
        <div className="bg-[#070b14]/70 p-3 rounded-xl border border-white/10 flex items-center justify-between">
          <div className="max-w-[200px]">
            <div className="text-xs font-bold text-white">🔥 Сжечь токены</div>
            <div className="text-[9px] text-slate-400">Уменьшает общую эмиссию, отправляя указанное количество токенов на нулевой адрес.</div>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={() => onAction('BURN')}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-xl border border-white/10"
          >
            Сжечь
          </button>
        </div>

        <div className="bg-[#070b14]/70 p-3 rounded-xl border border-white/10 flex items-center justify-between">
          <div className="max-w-[200px]">
            <div className="text-xs font-bold text-white">🪙 Доминтить (Минт)</div>
            <div className="text-[9px] text-slate-400">Выпускает дополнительную партию новых токенов на ваш кошелек.</div>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={() => onAction('MINT')}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-xl border border-white/10"
          >
            Минт
          </button>
        </div>

        <div className="bg-[#070b14]/70 p-3 rounded-xl border border-white/10 flex items-center justify-between">
          <div className="max-w-[200px]">
            <div className="text-xs font-bold text-red-400">🛑 Отказ от прав</div>
            <div className="text-[9px] text-slate-400">Навсегда отменяет возможность доминтить токены. Повышает доверие инвесторов.</div>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={() => onAction('REVOKE')}
            className="px-3 py-2 bg-red-500/20 text-red-400 text-xs font-bold rounded-xl border border-red-500/30"
          >
            Отказ
          </button>
        </div>
      </div>
    </div>
  );
}
