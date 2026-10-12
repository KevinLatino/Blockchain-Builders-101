// ─────────────────────────────────────────────────────────────────────────────
// 1. ARQUITECTURA · Configuración de red
//
// Toda la información sobre "a qué Stellar nos conectamos" vive acá.
// Para pasar de Testnet a Mainnet solo se cambian las variables de entorno
// (.env.local en tu compu, "Environment Variables" en Vercel).
// ─────────────────────────────────────────────────────────────────────────────

// Next reemplaza cada `process.env.NEXT_PUBLIC_...` por su valor al compilar,
// por eso hay que escribir cada variable completa (no se puede leer dinámicamente).
export const stellarConfig = Object.freeze({
  /** Nombre de la red: "testnet" */
  network: process.env.NEXT_PUBLIC_STELLAR_NETWORK!,
  /** Nodo RPC: el "puente" HTTP entre la app y la blockchain */
  rpcUrl: process.env.NEXT_PUBLIC_STELLAR_RPC_URL!,
  /** Identifica la red al firmar: una firma de Testnet no sirve en Mainnet */
  networkPassphrase: process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE!,
  /** Contrato de votación (contracts/contracts/poll) */
  contractId: process.env.NEXT_PUBLIC_CONTRACT_ID!,
  /** Explorador para ver transacciones */
  explorerUrl: `https://stellar.expert/explorer/${process.env.NEXT_PUBLIC_STELLAR_NETWORK}`,
  /** Friendbot: regala XLM de prueba (solo existe en Testnet) */
  friendbotUrl: "https://friendbot.stellar.org",
});
