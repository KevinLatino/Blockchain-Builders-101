// ─────────────────────────────────────────────────────────────────────────────
// 1. ARQUITECTURA · Configuración de red
//
// Toda la información sobre "a qué Stellar nos conectamos" vive acá.
// Para pasar de Testnet a Mainnet solo se cambia el archivo .env.local.
// ─────────────────────────────────────────────────────────────────────────────

// Next reemplaza cada `process.env.NEXT_PUBLIC_...` por su valor al compilar,
// por eso hay que escribir cada variable completa (no se puede leer dinámicamente).
const env = {
  network: process.env.NEXT_PUBLIC_STELLAR_NETWORK,
  rpcUrl: process.env.NEXT_PUBLIC_STELLAR_RPC_URL,
  networkPassphrase: process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE,
  contractId: process.env.NEXT_PUBLIC_CONTRACT_ID,
};

// Si falta una variable, mejor fallar al arrancar con un mensaje claro.
for (const [key, value] of Object.entries(env)) {
  if (!value) throw new Error(`Falta la variable "${key}" en .env.local`);
}

export const config = {
  /** Nombre de la red: "testnet" */
  network: env.network!,
  /** Nodo RPC: el "puente" HTTP entre la app y la blockchain */
  rpcUrl: env.rpcUrl!,
  /** Identifica la red al firmar: una firma de Testnet no sirve en Mainnet */
  networkPassphrase: env.networkPassphrase!,
  /** Contrato SEP-41 de XLM nativo (Stellar Asset Contract) */
  contractId: env.contractId!,
  /** Explorador para ver transacciones */
  explorerUrl: `https://stellar.expert/explorer/${env.network}`,
  /** Friendbot: regala XLM de prueba (solo existe en Testnet) */
  friendbotUrl: "https://friendbot.stellar.org",
};
