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
    <form onSubmit={onMint} className="space-y-4 animate-fadeIn text-left">
      <div className="glass-card p-4 rounded-3xl space-y-3.5 relative overflow-hidden">
        
        {/* Фоновое свечение */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div>
          <h2 className="text-sm font-black uppercase text-cyan-400 tracking-wider flex items-center gap-1.5">
            <span>🚀</span> Создание Jetton токена
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Запустите свой цифровой актив в сети TON за пару кликов.
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">Название токена</label>
            <input
              type="text"
              placeholder="например, Cyber GRAM"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#070b14]/80 border border-cyan-500/30 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">Тикер (Символ)</label>
              <input
                type="text"
                placeholder="CGRAM"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="w-full bg-[#070b14]/80 border border-cyan-500/30 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">Эмиссия (Supply)</label>
              <input
                type="number"
                placeholder="1000000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#070b14]/80 border border-cyan-500/30 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">Ссылка на логотип (URI)</label>
            <input
              type="url"
              placeholder="https://example.com/logo.png"
              value={imageUri}
              onChange={(e) => setImageUri(e.target.value)}
              className="w-full bg-[#070b14]/80 border border-cyan-500/30 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">Описание</label>
            <textarea
              placeholder="Расскажите о вашем проекте..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-[#070b14]/80 border border-cyan-500/30 rounded-2xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all resize-none font-medium"
            />
          </div>

          {/* Чекбокс ликвидности */}
          <div className="bg-[#070b14]/60 border border-cyan-500/20 rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id="liq"
                checked={addLiquidity}
                onChange={(e) => setAddLiquidity(e.target.checked)}
                className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
              />
              <label htmlFor="liq" className="text-xs font-bold text-slate-200 cursor-pointer">
                Создать пул ликвидности
              </label>
            </div>
            <span className="text-[10px] text-cyan-400 font-mono font-bold">+0.5 TON</span>
          </div>

          {addLiquidity && (
            <div className="animate-fadeIn">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">Количество TON в пул</label>
              <input
                type="number"
                value={liquidityAmount}
                onChange={(e) => setLiquidityAmount(e.target.value)}
                className="w-full bg-[#070b14]/80 border border-cyan-500/30 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
          )}
        </div>

        {/* Итог и кнопка */}
        <div className="pt-2 border-t border-white/10 space-y-3">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400">Итого к оплате:</span>
            <span className="text-cyan-400 font-black text-sm">{totalDisplayCost} TON</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 text-slate-950 font-black text-xs uppercase rounded-2xl shadow-lg shadow-cyan-500/25 active:scale-95 transition-all hover:brightness-110 disabled:opacity-50"
          >
            {loading ? 'Создание контракта...' : 'Запустить токен 🚀'}
          </button>
        </div>

      </div>
    </form>
  );
}
