'use client';

import { TonConnectButton } from '@tonconnect/ui-react';

interface HeaderProps {
  tgUser: { id: string; name: string };
  activeTab: 'create' | 'manage' | 'presale' | 'staking' | 'game';
  onTabChange: (tab: 'create' | 'manage' | 'presale' | 'staking' | 'game') => void;
}

export default function Header({ tgUser, activeTab, onTabChange }: HeaderProps) {
  const tabs = [
    { id: 'create', label: '✨ Создать' },
    { id: 'manage', label: '🛠 Управлять' },
    { id: 'presale', label: '📈 Инвест' }, // Изменили название вкладки
    { id: 'staking', label: '🔒 Стейк' },
    { id: 'game', label: '🎮 Игра' },
  ] as const;

  return (
    <header className="w-full max-w-md pt-1 pb-2">
      <div className="flex items-center justify-between bg-[#111726]/95 border border-white/[0.08] rounded-2xl p-3 shadow-xl mb-2 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm uppercase shadow-md">
            {tgUser.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-bold text-white truncate max-w-[100px]">{tgUser.name}</div>
            <div className="text-[10px] text-cyan-400 font-mono">ID: {tgUser.id}</div>
          </div>
        </div>
        <div className="scale-90 origin-right">
          <TonConnectButton />
        </div>
      </div>

      <div className="grid grid-cols-5 gap-1 bg-[#111726]/95 p-1 rounded-2xl border border-white/[0.08] shadow-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`py-2 text-[9px] font-extrabold rounded-xl transition-all truncate px-0.5 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md ring-1 ring-white/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
}
