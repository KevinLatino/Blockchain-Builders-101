// ─────────────────────────────────────────────────────────────────────────────
// 3. INVOCAR EL CONTRATO · Lectura
//
// Leer NO necesita firma ni cuesta nada: el nodo RPC SIMULA la llamada
// (ejecuta el contrato "en seco", sin guardar nada en la blockchain)
// y nos devuelve el resultado. Por eso podemos consultar cada 5 segundos.
// ─────────────────────────────────────────────────────────────────────────────
import { getPollClient } from "./client";

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
