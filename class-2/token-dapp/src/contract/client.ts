// ─────────────────────────────────────────────────────────────────────────────
// 3. CONTRATO · Cliente generado con bindings
//
// `xlm-token` lo generó la Stellar CLI a partir del contrato desplegado:
//   stellar contract bindings typescript --contract-id C... --network testnet
// Trae un método tipado por cada función del contrato SEP-41
// (balance, transfer, decimals, ...): no armamos las llamadas a mano.
// ─────────────────────────────────────────────────────────────────────────────
import { Client } from "xlm-token";
import { config } from "@/config";

/**
 * Crea el cliente del contrato.
 * - Sin `publicKey`: alcanza para LEER (simular no necesita cuenta).
 * - Con `publicKey`: la cuenta que va a pagar y firmar una ESCRITURA.
 */
export function getTokenClient(publicKey?: string) {
  return new Client({
    contractId: config.contractId,
    networkPassphrase: config.networkPassphrase,
    rpcUrl: config.rpcUrl,
    publicKey,
  });
}
