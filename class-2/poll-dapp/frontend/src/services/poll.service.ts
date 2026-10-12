// ─────────────────────────────────────────────────────────────────────────────
// 3. INVOCAR EL CONTRATO · Servicio del contrato poll
//
// Las reglas de cada llamada al contrato: qué se lee, cómo se escribe y qué
// errores salen. No sabe nada de React, así que se puede usar desde un hook,
// un script o un test.
// ─────────────────────────────────────────────────────────────────────────────
import { rpc } from "@stellar/stellar-sdk";
import { stellarConfig } from "@/config/stellar";
import { getPollClient } from "@/lib/contracts/poll.client";
import { TxError } from "./errors";

// ── Lectura ──────────────────────────────────────────────────────────────────
// Leer NO necesita firma ni cuesta nada: el nodo RPC SIMULA la llamada
// (ejecuta el contrato "en seco", sin guardar nada en la blockchain)
// y nos devuelve el resultado. Por eso podemos consultar cada 5 segundos.

export type PollData = {
  question: string;
  options: string[];
  results: number[]; // votos de cada opción, en el mismo orden que `options`
};

/** Votos de cada opción. Es lo que refrescamos en vivo. */
export async function readResults(): Promise<number[]> {
  const tx = await getPollClient().get_results(); // construye y SIMULA
  return tx.result; // Vec<u32> del contrato → number[] en TypeScript
}

/** Pregunta + opciones + resultados (las tres lecturas en paralelo). */
export async function readPoll(): Promise<PollData> {
  const client = getPollClient();
  const [question, options, results] = await Promise.all([
    client.get_question(),
    client.get_options(),
    client.get_results(),
  ]);
  return { question: question.result, options: options.result, results: results.result };
}

/** ¿Esta cuenta ya votó? */
export async function readHasVoted(voter: string): Promise<boolean> {
  const tx = await getPollClient().has_voted({ voter });
  return tx.result;
}

// ── Escritura (vote) ─────────────────────────────────────────────────────────
// Votar cambia el estado de la blockchain, así que hace falta una transacción
// FIRMADA. El ciclo completo:
//
//   1. construir → 2. simular → 3. firmar → 4. enviar → 5. esperar confirmación
//   └──── client.vote() ────┘   └────────── tx.signAndSend() ──────────┘

export type VoteParams = { voter: string; option: number };

/** Los pasos intermedios del ciclo de escritura, en orden. */
export type VoteStep = "simulando" | "esperando-firma" | "enviando";

/** Quién firma: el servicio no conoce la wallet, recibe la función (ver wallet.service.ts). */
export type SignTransaction = (
  xdr: string,
  address: string,
) => Promise<{ signedTxXdr: string; signerAddress?: string }>;

export type VoteOptions = {
  sign: SignTransaction;
  onStep: (step: VoteStep) => void; // para mostrar el avance en la interfaz
};

export async function vote({ voter, option }: VoteParams, { sign, onStep }: VoteOptions) {
  // 1 + 2. CONSTRUIR y SIMULAR. El nodo ejecuta el contrato "en seco": si va a
  // fallar (ej: ya votaste → Error(Contract, #2)) nos enteramos ACÁ, sin
  // pedirle la firma al usuario ni gastar nada.
  onStep("simulando");
  const client = getPollClient(voter); // `voter` paga la comisión y firma
  const tx = await client.vote({ voter, option }, { timeoutInSeconds: 30 });
  if (rpc.Api.isSimulationError(tx.simulation!)) {
    throw new TxError("simulation", tx.simulation.error);
  }

  // 3 + 4 + 5. FIRMAR, ENVIAR y ESPERAR CONFIRMACIÓN.
  onStep("esperando-firma");
  const sent = await tx.signAndSend({
    signTransaction: async (xdr) => {
      const signed = await sign(xdr, voter); // la wallet firma
      onStep("enviando"); // apenas firmó, se envía y esperamos el ledger
      return signed;
    },
  });

  // "Enviada" no es "confirmada": signAndSend espera el resultado del ledger.
  const hash = sent.sendTransactionResponse?.hash ?? "";
  if (sent.getTransactionResponse?.status !== rpc.Api.GetTransactionStatus.SUCCESS) {
    throw new TxError("failed", "La transacción falló en la red", hash);
  }
  return { hash, explorerUrl: `${stellarConfig.explorerUrl}/tx/${hash}` };
}
