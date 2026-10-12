// ─────────────────────────────────────────────────────────────────────────────
// 3. CONTRATO · Cliente generado con bindings
//
// `poll` lo generó la Stellar CLI a partir del contrato desplegado:
//   stellar contract bindings typescript --contract-id poll --network testnet --output-dir ./packages/poll
// Trae un método tipado por cada función del contrato
// (vote, get_results, get_question, get_options, has_voted): no armamos las llamadas a mano.
// ─────────────────────────────────────────────────────────────────────────────
import { Client } from "poll";
import { config } from "@/config";

/**
 * Crea el cliente del contrato.
 * - Sin `publicKey`: alcanza para LEER (simular no necesita cuenta).
 * - Con `publicKey`: la cuenta que va a pagar y firmar una ESCRITURA.
 */
export function getPollClient(publicKey?: string) {
  return new Client({
    contractId: config.contractId,
    networkPassphrase: config.networkPassphrase,
    rpcUrl: config.rpcUrl,
    publicKey,
  });
}
