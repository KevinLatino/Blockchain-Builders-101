// ─────────────────────────────────────────────────────────────────────────────
// 3. INVOCAR EL CONTRATO · Lectura
//
// Leer NO necesita firma ni cuesta nada: el nodo RPC SIMULA la llamada
// (ejecuta el contrato "en seco", sin guardar nada en la blockchain)
// y nos devuelve el resultado.
// ─────────────────────────────────────────────────────────────────────────────
import { getTokenClient } from "./client";

/**
 * Saldo de una cuenta, en la unidad mínima (stroops).
 * Devuelve `null` si la cuenta todavía no existe en la red (nunca fue fondeada).
 */
export async function readBalance(address: string): Promise<bigint | null> {
  const client = getTokenClient(); // sin cuenta: solo vamos a simular

  try {
    // El método generado por los bindings construye y SIMULA `balance(id)`.
    const tx = await client.balance({ id: address });
    return tx.result; // i128 del contrato → bigint en TypeScript
  } catch (error) {
    // En Stellar una cuenta existe recién cuando recibe sus primeros XLM.
    // El contrato de XLM responde con este error si la cuenta no existe.
    if (String(error).includes("account entry is missing")) return null;
    throw error;
  }
}
