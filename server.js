const { beginCell, toNano, Address } = require('@ton/core');

// Ваш кошелек для получения комиссии 0.25 GRAM
const FEE_RECIPIENT = 'UQAIOSFdlxtGH5SMRrFM216SFPj295rUDyQs6-gp_Ab_dm2g';

// Функция генерации данных для TON Connect (возвращает массив сообщений для фронтенда)
function generateDeployPayload(userAddress, name, symbol, supply) {
  const ownerAddr = Address.parse(userAddress);

  // 1. Тело сообщения для создания Jetton (стандарт TEP-74 / Minter)
  const mintBody = beginCell()
    .storeUint(21, 32) // Opcode создания/минта
    .storeUint(0, 64)  // Query ID
    .storeAddress(ownerAddr)
    .storeCoins(toNano(supply))
    .endCell();

  // 2. Формируем пакет транзакций для TON Connect:
  // Сообщение 1: Комиссия сервису (0.25 GRAM) на ваш кошелек
  // Сообщение 2: Оплата деплоя и минта (0.25 GRAM)
  return {
    validUntil: Math.floor(Date.now() / 1000) + 600,
    messages: [
      {
        address: FEE_RECIPIENT,
        amount: toNano('0.25').toString(), // 0.25 GRAM вам
      },
      {
        address: userAddress, // Адрес контракта/деплоя
        amount: toNano('0.25').toString(), // 0.25 GRAM на газ/контракт
        payload: mintBody.toBoc().toString('base64'),
      },
    ],
  };
}
