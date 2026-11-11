'use client';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  userScore: number;
  userName: string;
}

export default function LeaderboardModal({
  isOpen,
  onClose,
  userScore,
  userName,
}: LeaderboardModalProps) {
  if (!isOpen) return null;

  // Базовые топ-игроки для атмосферы соревнования
  const topPlayers = [
    { rank: 1, name: 'Satoshi_TON', score: 1250000 },
    { rank: 2, name: 'Durov_Fan', score: 980000 },
    { rank: 3, name: 'CryptoKing', score: 750000 },
    { rank: 4, name: 'TonWhale', score: 520000 },
    { rank: 5, name: 'BlockchainDev', score: 410000 },
  ];

  // Добавляем текущего игрока в общий список и сортируем
  const allPlayers = [
    ...topPlayers,
    { rank: 99, name: `${userName} (Вы)`, score: userScore }
  ].sort((a, b) => b.score - a.score);

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
          Самые активные кликеры экосистемы GRAM. Зарабатывайте монеты и поднимайтесь на вершину!
        </p>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {allPlayers.map((player, index) => {
            const isMe = player.name.includes('(Вы)');
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
                  <span className="truncate max-w-[130px]">{player.name}</span>
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
