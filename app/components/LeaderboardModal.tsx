'use client';

import { useEffect, useState } from 'react';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  userScore: number;
  userName: string;
  userId: string;
}

interface Player {
  name: string;
  score: number;
}

export default function LeaderboardModal({
  isOpen,
  onClose,
  userScore,
  userName,
  userId,
}: LeaderboardModalProps) {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    // Сохраняем текущего игрока в общий список локальных игроков
    const allPlayersMap: Record<string, number> = {};
    
    // Загружаем существующих из localStorage или создаем базовых
    const savedLeaderboard = localStorage.getItem('gram_global_leaderboard');
    if (savedLeaderboard) {
      try {
        const parsed = JSON.parse(savedLeaderboard);
        Object.assign(allPlayersMap, parsed);
      } catch (e) {}
    }

    // Добавляем/обновляем текущего пользователя
    allPlayersMap[userName || `User_${userId}`] = userScore;

    // Также добавим ботов для атмосферы
    allPlayersMap['Satoshi_TON'] = Math.max(allPlayersMap['Satoshi_TON'] || 0, 1250000);
    allPlayersMap['Durov_Fan'] = Math.max(allPlayersMap['Durov_Fan'] || 0, 980000);
    allPlayersMap['CryptoKing'] = Math.max(allPlayersMap['CryptoKing'] || 0, 750000);

    localStorage.setItem('gram_global_leaderboard', JSON.stringify(allPlayersMap));

    // Превращаем в массив и сортируем по убыванию очков
    const sortedList: Player[] = Object.entries(allPlayersMap).map(([name, score]) => ({
      name,
      score,
    })).sort((a, b) => b.score - a.score);

    setPlayers(sortedList);
  }, [isOpen, userScore, userName, userId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-[#111726] border border-cyan-500/40 rounded-3xl p-5 w-full max-w-sm space-y-4 shadow-2xl text-center">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-extrabold uppercase text-cyan-400 tracking-wide">🏆 Таблица лидеров</h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white text-base font-bold px-2 py-1"
          >
            ✕
          </button>
        </div>

        <p className="text-[11px] text-slate-300">
          Глобальный рейтинг игроков экосистемы GRAM.
        </p>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {players.map((player, index) => {
            const isMe = player.name === userName || player.name.includes(userId);
            return (
              <div
                key={index}
                className={`flex items-center justify-between p-2.5 rounded-2xl border text-xs font-mono ${
                  isMe 
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold' 
                    : 'bg-[#070b14] border-white/5 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-6 text-center font-black ${
                    index === 0 ? 'text-yellow-400' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-amber-600' : 'text-slate-500'
                  }`}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </span>
                  <span className="truncate max-w-[130px]">{player.name} {isMe ? '(Вы)' : ''}</span>
                </div>
                <span className="text-cyan-400 font-bold">{player.score.toLocaleString()} GRAM</span>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-xs rounded-2xl shadow-lg active:scale-95"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}
