// ─────────────────────────────────────────────────────────────────────────────
// 2. WALLET · Servicio de la wallet
//
// Todo lo que la app le pide a la wallet, sin nada de React: conectar,
// recuperar la sesión, desconectar, consultar en qué red está y FIRMAR.
// El setup del kit vive en lib/wallet/kit.ts.
// ─────────────────────────────────────────────────────────────────────────────
import { stellarConfig } from "@/config/stellar";
import { loadKit } from "@/lib/wallet/kit";
import { TxError } from "./errors";

/** ok = Testnet · wrong = otra red (bloqueamos) · unknown = la wallet no lo informa */
export type WalletNetworkStatus = "ok" | "wrong" | "unknown";

/** Abre el selector de wallets y devuelve la dirección elegida. */
export async function connectWallet(): Promise<string> {
  const kit = await loadKit();
  const { address } = await kit.authModal();
  return address;
}

/** Recupera la sesión guardada (el kit la persiste en localStorage). */
export async function restoreWallet(): Promise<string | null> {
  const kit = await loadKit();
  try {
    const { address } = await kit.getAddress();
    return address;
  } catch {
    return null; // nunca se conectó o se desconectó
  }
}

export async function disconnectWallet(): Promise<void> {
  const kit = await loadKit();
  await kit.disconnect();
}

/**
 * Pregunta a la wallet en qué red está. Devuelve `null` si la wallet
 * no lo informa (xBull, Lobstr, Albedo… no soportan esta consulta).
 */
export async function getWalletNetwork(): Promise<string | null> {
  const kit = await loadKit();
  try {
    const { networkPassphrase } = await kit.getNetwork();
    return networkPassphrase;
  } catch {
    return null;
  }
}

/** Compara la red de la wallet con la de la app (config/stellar.ts). */
export async function getWalletNetworkStatus(): Promise<WalletNetworkStatus> {
  const passphrase = await getWalletNetwork();
  if (passphrase === null) return "unknown";
  return passphrase === stellarConfig.networkPassphrase ? "ok" : "wrong";
}

/**
 * Flujo de firma. La app arma la transacción y se la pasa a la wallet como XDR
 * (texto que codifica la transacción). La wallet se la muestra al usuario, y si
 * acepta, la firma con su clave privada y nos devuelve el XDR FIRMADO.
 */
export async function signWithWallet(xdr: string, address: string) {
  // Una firma de otra red no sirve en Testnet: mejor avisar antes de firmar.
  const walletNetwork = await getWalletNetwork(); // null si la wallet no lo informa
  if (walletNetwork && walletNetwork !== stellarConfig.networkPassphrase) {
    throw new TxError("network", `La wallet está en: ${walletNetwork}`);
  }

  const kit = await loadKit();
  return kit.signTransaction(xdr, {
    address, // quién firma
    networkPassphrase: stellarConfig.networkPassphrase, // en qué red es válida la firma
  }); // → { signedTxXdr, signerAddress }
}

/**
 * Friendbot regala 10.000 XLM de prueba y, al hacerlo, CREA la cuenta en la red.
 * Solo existe en Testnet: en Mainnet los XLM se compran.
 */
export async function fundWithFriendbot(address: string): Promise<void> {
  const response = await fetch(`${stellarConfig.friendbotUrl}?addr=${address}`);
  if (!response.ok) throw new Error(`Friendbot respondió ${response.status}`);
}
