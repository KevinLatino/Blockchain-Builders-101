import { StrKey } from "@stellar/stellar-sdk";
import { parseAmount } from "@/contract/amount";

/**
 * Valida el formulario ANTES de tocar la red: errores obvios se detectan
 * gratis y al instante, sin simular ni pedir firmas.
 */
export function validateTransfer(to: string, amountText: string, balance: bigint) {
  const destination = to.trim();
  const isAccount = StrKey.isValidEd25519PublicKey(destination); // G...
  const isContract = StrKey.isValidContract(destination); // C...
  if (!isAccount && !isContract) {
    return { error: "La dirección no es válida (tiene que empezar con G… o C…)" };
  }

  const amount = parseAmount(amountText);
  if (amount === null) return { error: "El monto no es un número válido" };
  if (amount <= 0n) return { error: "El monto tiene que ser mayor a 0" };
  if (amount > balance) return { error: "No tenés saldo suficiente" };

  return { to: destination, amount };
}
