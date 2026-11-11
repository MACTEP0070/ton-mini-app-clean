'use client';

import { useTonConnectButton } from '@tonconnect/ui-react';

interface HeaderProps {
  tgUser: { id: string; name: string; username?: string };
  activeTab: 'create' | 'manage' | 'presale' | 'staking' | 'game';
  onTabChange: (tab: 'create' | 'manage' | 'presale' | 'staking' | 'game') => void;
}

export default function Header({ tgUser, activeTab, onTabChange }: HeaderProps) {
  return (
    <header className="w-full max-w-md space-y-3 pt-1">
      {/* Информация о пользователе и TON Connect кнопка */}
      <div className="glass-card px-4 py-3 rounded-2xl flex items-center justify-between border border-white/10 shadow-lg">
        <div className="flex items-center gap-2.5 truncate">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center font-black text-slate-950 text-sm shadow-md shrink-0">
            {tgUser.name.charAt(0).toUpperCase()}
          </div>
          <div className="truncate">
            <div className="text-xs font-bold text-white truncate">{tgUser.name}</div>
            <div className="text-[10px] text-slate-400 font-mono">ID: {tgUser.id}</div>
          </div>
        </div>
        
        {/* Кнопка кошелька */}
        <div className="scale-90 origin-right">
          <div id="ton-connect-button" />
        </div>
      </div>

      {/* Навигация по вкладкам (Скроллируемый премиум-дизайн) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
        {[
          { id: 'game', label: '🎮 Игра' },
          { id: 'presale', label: '💎 Инвест' },
          { id: 'staking', label: '🔒 Стейк' },
          { id: 'create', label: '🚀 Создать' },
          { id: 'manage', label: '⚙️ Упр.' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id as any)}
              className={`px-3.5 py-2.5 rounded-xl font-extrabold text-xs whitespace-nowrap transition-all flex items-center gap-1.5 shadow-md ${
                isActive
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-105'
                  : 'bg-slate-950/60 text-slate-300 border border-white/5 hover:bg-slate-900'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
