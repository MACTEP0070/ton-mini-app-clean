'use client';

import { useState } from 'react';
import {
  TonConnectUIProvider,
  useTonConnectUI,
  useTonAddress,
  useTonWallet,
} from '@tonconnect/ui-react';
import { beginCell, toNano, Address } from '@ton/core';

function MinterApp() {
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();
  const wallet = useTonWallet();

  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [amount, setAmount] = useState('');
  const [decimals, setDecimals] = useState('9');
  const [loading, setLoading] = useState(false);

  // Форматирование отображения адреса (сокращенный вид)
  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  const handleConnectWallet = () => {
    if (wallet) {
      tonConnectUI.disconnect();
    } else {
      tonConnectUI.openModal();
    }
  };

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAddress) {
      alert('Пожалуйста, сначала подключите кошелек!');
      return;
    }

    setLoading(true);
    try {
      const ownerAddr = Address.parse(userAddress);

      // Формирование структуры ячейки транзакции деплоя
      const bodyCell = beginCell()
        .storeUint(21, 32) // op::mint
        .storeUint(0, 64)  // query_id
        .storeAddress(ownerAddr)
        .storeCoins(toNano(0.05))
        .storeCoins(toNano(amount || '0'))
        .endCell();

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
          {
            address: userAddress,
            amount: toNano('0.25').toString(),
            payload: bodyCell.toBoc().toString('base64'),
          },
        ],
      };

      await tonConnectUI.sendTransaction(transaction);
      alert('Запрос на создание токена успешно отправлен в ваш кошелек!');
    } catch (err: any) {
      console.error(err);
      alert('Ошибка при отправке: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col items-center justify-between font-sans pb-8">
      {/* Шапка / Заголовок */}
      <header className="w-full max-w-md px-4 pt-6 pb-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
          Выпустите свой первый токен
        </h1>
        <p className="text-xs text-slate-400 leading-relaxed px-2">
          Заполните форму ниже, чтобы создать токен на базе стандарта Jetton. Процесс занимает меньше минуты.
        </p>
      </header>

      {/* Основной контейнер формы */}
      <main className="w-full max-w-md px-4 my-4 flex-1">
        <div className="bg-[#1e293b] border border-slate-700/60 rounded-2xl p-5 shadow-2xl space-y-4">
          <form onSubmit={handleMint} className="space-y-4">
            
            {/* Название токена */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Название токена <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Например: Gram Gold"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>

            {/* Символ / Тикер */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Символ (Тикер) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Например: GOLD"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>

            {/* Изображение (URL) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Ссылка на логотип (Image URI)
              </label>
              <input
                type="url"
                placeholder="https://site.com/logo.png"
                value={imageUri}
                onChange={(e) => setImageUri(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>

            {/* Описание */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Описание
              </label>
              <textarea
                rows={3}
                placeholder="Опишите назначение и особенности вашего жетона..."
                value={description}
                onChange={(e
