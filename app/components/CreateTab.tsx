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
    <form onSubmit={onMint} className="space-y-4 animate-fadeIn text-left pb-4">
      <div className="glass-card p-5 rounded-[2.5rem] space-y-4 relative overflow-hidden border border-amber-500/20 shadow-2xl">
        
        {/* Фоновое свечение */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div>
          <h2 className="text-sm font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
            <span>🚀</span> Конструктор Jetton Токенов
          </h2>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Выпустите собственный стандартный Jetton в сети TON за пару кликов. Полная децентрализация, смарт-контракт принадлежит вашему кошельку.
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
              className="w-full bg-slate-950/80 border border-amber-500/30 rounded-2xl px-3.5 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-medium"
              required
            />
            <span className="text-[9px] text-slate-500 mt-0.5 block">Полное имя вашего токена (например, Bitcoin или Cyber GRAM).</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">Тикер (Символ)</label>
              <input
                type="text"
                placeholder="CGRAM"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="w-full bg-slate-950/80 border border-amber-500/30 rounded-2xl px-3.5 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono font-bold"
                required
              />
              <span className="text-[9px] text-slate-500 mt-0.5 block">Короткий буквенный код (до 6-8 символов).</span>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">Эмиссия (Supply)</label>
              <input
                type="number"
                placeholder="1000000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950/80 border border-amber-500/30 rounded-2xl px-3.5 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                required
              />
              <span className="text-[9px] text-slate-500 mt-0.5 block">Общее количество токенов при выпуске.</span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">Ссылка на логотип (URI)</label>
            <input
              type="url"
              placeholder="https://example.com/logo.png"
              value={imageUri}
              onChange={(e) => setImageUri(e.target.value)}
              className="w-full bg-slate-950/80 border border-amber-500/30 rounded-2xl px-3.5 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-medium"
              required
            />
            <span className="text-[9px] text-slate-500 mt-0.5 block">Прямая ссылка на изображение логотипа ( PNG / JPG / WEBP ).</span>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">Описание проекта</label>
            <textarea
              placeholder="Расскажите об utility вашего токена..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-slate-950/80 border border-amber-500/30 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-none font-medium"
            />
          </div>

          {/* Чекбокс и описание пула ликвидности */}
          <div className="bg-slate-950/70 border border-amber-500/20 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="liq"
                  checked={addLiquidity}
                  onChange={(e) => setAddLiquidity(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
                <label htmlFor="liq" className="text-xs font-bold text-slate-200 cursor-pointer">
                  Авто-создание пула ликвидности (DeDust / STON.fi)
                </label>
              </div>
              <span className="text-[10px] text-amber-400 font-mono font-bold">+0.5 TON</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Пул ликвидности связывает ваш новый токен с TON, позволяя пользователям свободно покупать и продавать его на децентрализованных биржах (DEX) сразу после выпуска. Часть ваших токенов и указанная сумма TON будут заблокированы в пуле для обеспечения стабильной торговли.
            </p>
          </div>

          {addLiquidity && (
            <div className="animate-fadeIn space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300">Количество TON в пару с токеном</label>
              <input
                type="number"
                value={liquidityAmount}
                onChange={(e) => setLiquidityAmount(e.target.value)}
                className="w-full bg-slate-950/80 border border-amber-500/30 rounded-2xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
              <span className="text-[9px] text-slate-500 block">Начальная поддержка ликвидности в TON для вашей торговой пары.</span>
            </div>
          )}
        </div>

        {/* Итог и кнопка */}
        <div className="pt-3 border-t border-white/10 space-y-3">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400">Итого к оплате за деплой:</span>
            <span className="text-amber-400 font-black text-sm">{totalDisplayCost} TON</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 text-slate-950 font-black text-xs uppercase rounded-2xl shadow-lg shadow-amber-500/25 active:scale-95 transition-all hover:brightness-110 disabled:opacity-50"
          >
            {loading ? 'Развертывание контракта...' : 'Запустить токен в сети TON 🚀'}
          </button>
        </div>

      </div>
    </form>
  );
}
