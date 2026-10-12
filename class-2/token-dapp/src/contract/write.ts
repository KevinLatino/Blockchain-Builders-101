// ─────────────────────────────────────────────────────────────────────────────
// 3. INVOCAR EL CONTRATO · Escritura (transfer)
//
// Escribir cambia el estado de la blockchain, así que hace falta una
// transacción FIRMADA. El ciclo completo, paso a paso:
//
//   1. construir → 2. simular → 3. firmar → 4. enviar → 5. esperar confirmación
// ─────────────────────────────────────────────────────────────────────────────
import { rpc, TransactionBuilder } from "@stellar/stellar-sdk";
import { config } from "@/config";
import { TxError } from "@/tx/errors";
import type { TxStep } from "@/tx/states";
import { getWalletNetwork } from "@/wallet/kit";
import { signWithWallet } from "@/wallet/sign";
import { getTokenClient } from "./client";

const server = new rpc.Server(config.rpcUrl);

export type TransferParams = { from: string; to: string; amount: bigint };

/** 1. CONSTRUIR: arma la transacción que llama a transfer(from, to, amount). */
async function build({ from, to, amount }: TransferParams) {
  const client = getTokenClient(from); // `from` paga la comisión y firma
  return client.transfer({ from, to, amount }, { simulate: false });
}

/**
 * 2. SIMULAR: el nodo ejecuta el contrato "en seco" para saber si va a
 * funcionar, cuánto cuesta y qué datos toca. Sin esto no se puede enviar.
 * Si el contrato la rechaza (ej: saldo insuficiente) nos enteramos ACÁ,
 * antes de molestar al usuario pidiéndole una firma.
 */
async function simulate(tx: Awaited<ReturnType<typeof build>>): Promise<string> {
  await tx.simulate();
  if (rpc.Api.isSimulationError(tx.simulation!)) {
    throw new TxError("simulation", tx.simulation.error);
  }
  return tx.built!.toXDR(); // transacción lista para firmar (con fees y datos)
}

/** 4. ENVIAR: la red recibe la transacción firmada y la pone en cola. */
async function send(signedXdr: string): Promise<string> {
  const tx = TransactionBuilder.fromXDR(signedXdr, config.networkPassphrase);
  const response = await server.sendTransaction(tx);
  if (response.status === "ERROR" || response.status === "TRY_AGAIN_LATER") {
    throw new TxError("rejected", `La red respondió ${response.status}`);
  }
  return response.hash;
}

/**
 * 5. ESPERAR CONFIRMACIÓN: "enviada" no es "confirmada". La red tarda unos
 * segundos en incluirla en un ledger, así que consultamos su estado hasta
 * que sea SUCCESS o FAILED.
 */
async function waitForConfirmation(hash: string, attempts = 30): Promise<void> {
  for (let i = 0; i < attempts; i++) {
    const response = await server.getTransaction(hash);
    if (response.status === "SUCCESS") return;
    if (response.status === "FAILED") {
      throw new TxError("failed", "La transacción falló en la red", hash);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000)); // NOT_FOUND: todavía no
  }
  throw new TxError("timeout", "La red no confirmó la transacción a tiempo", hash);
}

/** El ciclo completo. `onStep` avisa a la interfaz en qué paso estamos. */
export async function transfer(
  params: TransferParams,
  onStep: (step: TxStep) => void,
): Promise<string> {
  onStep("simulando");
  const tx = await build(params);
  const xdr = await simulate(tx);

  // 3. FIRMAR: la wallet le muestra la operación al usuario.
  // Antes revisamos la red: una firma de otra red no sirve en Testnet.
  const walletNetwork = await getWalletNetwork(); // null si la wallet no lo informa
  if (walletNetwork && walletNetwork !== config.networkPassphrase) {
    throw new TxError("network", `La wallet está en: ${walletNetwork}`);
  }
  onStep("esperando-firma");
  const signedXdr = await signWithWallet(xdr, params.from);

  onStep("enviando");
  const hash = await send(signedXdr);
  await waitForConfirmation(hash);
  return hash;
}
