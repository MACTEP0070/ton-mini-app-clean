import { beginCell, Address, toNano } from '@ton/core';

// Функция создания ячейки метаданных токена (On-chain / Off-chain URI)
export function buildJettonContentCell(contentUri: string): Cell {
  return beginCell()
    .storeUint(0x01, 8) // Off-chain content prefix
    .storeStringTail(contentUri)
    .endCell();
}

// Формирование начальных данных (data) для Jetton Minter
export function buildJettonMinterDataCell(
  owner: Address,
  jettonContentUri: string
) {
  return beginCell()
    .storeCoins(0) // Total supply (изначально 0 до первого минта)
    .storeAddress(owner) // Адрес владельца контракта
    .storeRef(buildJettonContentCell(jettonContentUri)) // Ссылка на метаданные
    .storeRef(beginCell().endCell()) // Код Jetton Wallet
    .endCell();
}
