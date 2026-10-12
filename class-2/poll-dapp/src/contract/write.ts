// ─────────────────────────────────────────────────────────────────────────────
// 3. INVOCAR EL CONTRATO · Escritura (vote)
//
// Votar cambia el estado de la blockchain, así que hace falta una transacción
// FIRMADA. El ciclo completo:
//
//   1. construir → 2. simular → 3. firmar → 4. enviar → 5. esperar confirmación
//   └──── client.vote() ────┘   └────────── tx.signAndSend() ──────────┘
// ─────────────────────────────────────────────────────────────────────────────
import { rpc } from "@stellar/stellar-sdk";
import { config } from "@/config";
import { TxError } from "@/tx/errors";
import type { TxStep } from "@/tx/states";
import { getWalletNetwork } from "@/wallet/kit";
import { signWithWallet } from "@/wallet/sign";
import { getPollClient } from "./client";

export type VoteParams = { voter: string; option: number };

export async function vote({ voter, option }: VoteParams, onStep: (step: TxStep) => void) {
  // 1 + 2. CONSTRUIR y SIMULAR. El nodo ejecuta el contrato "en seco": si va a
  // fallar (ej: ya votaste → Error(Contract, #2)) nos enteramos ACÁ, sin
  // pedirle la firma al usuario ni gastar nada.
  onStep("simulando");
  const client = getPollClient(voter); // `voter` paga la comisión y firma
  const tx = await client.vote({ voter, option }, { timeoutInSeconds: 30 });
  if (rpc.Api.isSimulationError(tx.simulation!)) {
    throw new TxError("simulation", tx.simulation.error);
  }
  await ensureWalletNetwork(); // una firma de otra red no sirve en Testnet

  // 3 + 4 + 5. FIRMAR, ENVIAR y ESPERAR CONFIRMACIÓN.
  onStep("esperando-firma");
  const sent = await tx.signAndSend({
    signTransaction: async (xdr) => {
      const signed = await signWithWallet(xdr, voter); // la wallet firma
      onStep("enviando"); // apenas firmó, se envía y esperamos el ledger
      return signed;
    },
  });

  // "Enviada" no es "confirmada": signAndSend espera el resultado del ledger.
  const hash = sent.sendTransactionResponse?.hash ?? "";
  if (sent.getTransactionResponse?.status !== rpc.Api.GetTransactionStatus.SUCCESS) {
    throw new TxError("failed", "La transacción falló en la red", hash);
  }
  return hash;
}

async function ensureWalletNetwork() {
  const walletNetwork = await getWalletNetwork(); // null si la wallet no lo informa
  if (walletNetwork && walletNetwork !== config.networkPassphrase) {
    throw new TxError("network", `La wallet está en: ${walletNetwork}`);
  }
}
