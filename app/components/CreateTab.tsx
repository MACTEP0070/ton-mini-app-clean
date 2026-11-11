'use client';

interface CreateTabProps {
  name: string;
  setName: (v: string) => void;
  symbol: string;
  setSymbol: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  imageUri: string;
  setImageUri: (v: string) => void;
  amount: string;
  setAmount: (v: string) => void;
  decimals: string;
  setDecimals: (v: string) => void;
  addLiquidity: boolean;
  setAddLiquidity: (v: boolean) => void;
  liquidityAmount: string;
  setLiquidityAmount: (v: string) => void;
  loading: boolean;
  totalDisplayCost: number;
  onMint: (e: React.FormEvent) => void;
}

export default function CreateTab({
  name, setName,
  symbol, setSymbol,
  description, setDescription,
  imageUri, setImageUri,
  amount, setAmount,
  decimals, setDecimals,
  addLiquidity, setAddLiquidity,
  liquidityAmount, setLiquidityAmount,
  loading,
  totalDisplayCost,
  onMint,
}: CreateTabProps) {
  return (
    <form onSubmit={onMint} className="space-y-3 animate-fadeIn">
      <div className="space-y-2.5 bg-[#070b14]/70 p-3 rounded-2xl border border-white/[0.05]">
        <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex justify-between">
          <span>📦 Параметры токена</span>
          <span className="text-[10px] text-emerald-400">+100 GRAM бонус</span>
        </div>
        <input
          type="text"
          required
          placeholder="Название (например: Gram Gold)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-[#0b101d] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
        <input
          type="text"
          required
          placeholder="Символ (например: GOLD)"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          className="w-full bg-[#0b101d] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white uppercase font-mono focus:outline-none focus:border-cyan-500"
        />
      </div>

      <div className="space-y-2.5 bg-[#070b14]/70 p-3 rounded-2xl border border-white/[0.05]">
        <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">🖼 Медиа и описание</div>
        <input
          type="url"
          required
          placeholder="Ссылка на логотип (URL)"
          value={imageUri}
          onChange={(e) => setImageUri(e.target.value)}
          className="w-full bg-[#0b101d] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
        <textarea
          rows={2}
          placeholder="Описание..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-[#0b101d] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 resize-none focus:outline-none focus:border-cyan-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 bg-[#070b14]/70 p-3 rounded-2xl border border-white/[0.05]">
        <div>
          <label className="block text-[10px] text-slate-400 mb-1">Эмиссия</label>
          <input
            type="number"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-[#0b101d] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div>
          <label className="block text-[10px] text-slate-400 mb-1">Decimals</label>
          <input
            type="number"
            required
            value={decimals}
            onChange={(e) => setDecimals(e.target.value)}
            className="w-full bg-[#0b101d] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      <div className="space-y-2 bg-[#070b14]/70 p-3 rounded-2xl border border-cyan-500/30">
        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-cyan-400">
          <input
            type="checkbox"
            checked={addLiquidity}
            onChange={(e) => setAddLiquidity(e.target.checked)}
            className="w-4 h-4 rounded accent-cyan-400"
          />
          💧 Создать пул ликвидности на DEX
        </label>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          {addLiquidity 
            ? 'С включенным пулом списывается базовая комиссия (0.5 TON) + деплой пула (0.5 TON) + указанная сумма стартовой ликвидности в TON.' 
            : 'Без пула ликвидности списывается только базовая комиссия за создание токена (0.5 TON).'}
        </p>

        {addLiquidity && (
          <input
            type="number"
            min="1"
            value={liquidityAmount}
            onChange={(e) => setLiquidityAmount(e.target.value)}
            placeholder="Сумма ликвидности в TON"
            className="w-full bg-[#0b101d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono mt-1"
          />
        )}
      </div>

      <div className="bg-[#0b101d] p-3 rounded-xl border border-white/10 text-xs space-y-1">
        <div className="text-[10px] text-cyan-400 font-bold uppercase">🧾 Итоговый расчет:</div>
        <div className="flex justify-between text-slate-400"><span>Базовая комиссия:</span> <span>0.5 TON</span></div>
        {addLiquidity && (
          <>
            <div className="flex justify-between text-slate-400"><span>Деплой пула DEX:</span> <span>0.5 TON</span></div>
            <div className="flex justify-between text-slate-400"><span>Стартовая ликвидность:</span> <span>{liquidityAmount} TON</span></div>
          </>
        )}
        <div className="pt-1 border-t border-white/10 flex justify-between font-bold text-white">
          <span>К списанию:</span> <span className="text-cyan-400">{totalDisplayCost} TON</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-xs rounded-2xl shadow-lg active:scale-95"
      >
        {loading ? 'Создание...' : `Создать токен (${totalDisplayCost} TON)`}
      </button>
    </form>
  );
}
