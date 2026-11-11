'use client';

import { TonConnectButton } from '@tonconnect/ui-react';

interface HeaderProps {
  tgUser: { id: string; name: string; username?: string };
  activeTab: string;
  onTabChange: (tab: any) => void;
}

export default function Header({ tgUser, activeTab, onTabChange }: HeaderProps) {
  return (
    <header className="w-full max-w-md space-y-3 pt-1 pb-2">
      {/* Верхняя строка с профилем и кошельком */}
      <div className="flex items-center justify-between bg-[#0d121f]/90 p-3 rounded-2xl border border-white/5 shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 font-black text-sm shadow-md">
            {tgUser.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-xs font-black text-white truncate max-w-[110px]">{tgUser.name}</div>
            <div className="text-[10px] text-slate-400 font-mono">ID: {tgUser.id}</div>
          </div>
        </div>

        <div className="scale-90 origin-right">
          <TonConnectButton />
        </div>
      </div>

      {/* Навигационные табы в стиле FightClub */}
      <div className="grid grid-cols-5 gap-1 bg-[#0d121f]/80 p-1.5 rounded-2xl border border-white/5">
        <button
          type="button"
          onClick={() => onTabChange('game')}
          className={`py-2 rounded-xl text-[11px] font-extrabold transition-all ${
            activeTab === 'game'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🎮 Игра
        </button>
        <button
          type="button"
          onClick={() => onTabChange('arena')}
          className={`py-2 rounded-xl text-[11px] font-extrabold transition-all ${
            activeTab === 'arena'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          ⚔️ Арена
        </button>
        <button
          type="button"
          onClick={() => onTabChange('presale')}
          className={`py-2 rounded-xl text-[11px] font-extrabold transition-all ${
            activeTab === 'presale'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          💎 Инвест
        </button>
        <button
          type="button"
          onClick={() => onTabChange('staking')}
          className={`py-2 rounded-xl text-[11px] font-extrabold transition-all ${
            activeTab === 'staking'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🔒 Стейк
        </button>
        <button
          type="button"
          onClick={() => onTabChange('create')}
          className={`py-2 rounded-xl text-[11px] font-extrabold transition-all ${
            activeTab === 'create'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🚀 Токен
        </button>
      </div>
    </header>
  );
}
