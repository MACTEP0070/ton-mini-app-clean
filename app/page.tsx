'use client';

import { useState } from 'react';
import { 
  TonConnectUIProvider, 
  TonConnectButton, 
  useTonConnectUI, 
  useTonAddress 
} from '@tonconnect/ui-react';
import { beginCell, toNano, Address } from '@ton/core';

function MintForm() {
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();

  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAddress) {
      alert('Пожалуйста, сначала подключите кошелек TON!');
      return;
    }

    setLoading(true);
    try {
      const ownerAddr = Address.parse(userAddress);
      
      // 1. Формируем метаданные токена в формате JSON или ссылки
      const metadata = {
        name,
        symbol,
        description,
        image: imageUri || 'https://ton.org/download/ton_symbol.png',
        decimals: '9'
      };

      // 2. Создаем Payload для отправки запроса деплоя контракта
      // В реальной сети транзакция отправляется на адрес Minter Factory или напрямую деплоит StateInit
      const bodyCell = beginCell()
        .storeUint(21, 32) // op::mint
        .storeUint(0, 64)  // query_id
        .storeAddress(ownerAddr) // to owner
        .storeCoins(toNano(0.05)) // ton_amount
        .storeCoins(toNano(amount)) // jetton_amount
        .endCell();

      // 3. Формируем транзакцию для TON Connect
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600, // 10 минут валидности
        messages: [
          {
            address: userAddress, // Адрес назначения / контракта
            amount: toNano('0.25').toString(), // Комиссия за деплой и минт (0.25 TON)
            payload: bodyCell.toBoc().toString('base64'),
          },
        ],
      };

      // 4. Отправляем транзакцию в кошелек (Tonkeeper / MyTonWallet)
      const result = await tonConnectUI.sendTransaction(transaction);
      console.log('Результат транзакции:', result);
      alert('Запрос на деплой жетона успешно отправлен в ваш кошелек!');
    } catch (err: any) {
      console.error(err);
      alert('Ошибка при отправке транзакции: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg w-full bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700">
      <h1 className="text-3xl font-bold mb-2 text-cyan-400 text-center">TON Jetton Deployer</h1>
      <p className="text-slate-300 mb-6 text-sm text-center">
        Создайте свой токен в сети TON прямо в Telegram
      </p>

      <div className="flex justify-center mb-6">
        <TonConnectButton />
      </div>

      {userAddress ? (
        <form onSubmit={handleMint} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Название токена (Name)</label>
            <input
              type="text"
              required
              placeholder="например, My Super Jetton"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Символ / Тикер</label>
            <input
              type="text"
              required
              placeholder="MYTOKEN"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Количество эмиссии (Total Supply)</label>
            <input
              type="number"
              required
              placeholder="1000000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Ссылка на логотип (Image URL)</label>
            <input
              type="url"
              placeholder="https://example.com/logo.png"
              value={imageUri}
              onChange={(e) => setImageUri(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 font-bold rounded-xl text-white hover:opacity-90 transition cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Ожидание подписи...' : 'Выпустить Jetton'}
          </button>
        </form>
      ) : (
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 text-center text-xs text-slate-400">
          Подключите кошелек вверху, чтобы разблокировать деплой
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const manifestUrl = 'https://ton-mini-app-clean.vercel.app/tonconnect-manifest.json';

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-slate-900 text-white font-sans">
        <MintForm />
      </main>
    </TonConnectUIProvider>
  );
}
