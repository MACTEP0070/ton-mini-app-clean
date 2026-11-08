import { beginCell, Address, toNano, Cell } from '@ton/core';

// Функция создания ячейки метаданных токена (Off-chain URI)
export function buildJettonContentCell(contentUri: string): Cell {
  return beginCell()
    .storeUint(0x01, 8) // Off-chain content prefix
    .storeStringTail(contentUri)
    .endCell();
}

// Формирование начальных данных для Jetton Minter
export function buildJettonMinterDataCell(
  owner: Address,
  jettonContentUri: string
) {
  return beginCell()
    .storeCoins(0)
    .storeAddress(owner)
    .storeRef(buildJettonContentCell(jettonContentUri))
    .storeRef(beginCell().endCell())
    .endCell();
}
