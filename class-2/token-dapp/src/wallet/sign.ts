// ─────────────────────────────────────────────────────────────────────────────
// 2. WALLET · Flujo de firma
//
// La app arma la transacción y se la pasa a la wallet como XDR (texto que
// codifica la transacción). La wallet se la muestra al usuario, y si acepta,
// la firma con su clave privada y nos devuelve el XDR FIRMADO.
// ─────────────────────────────────────────────────────────────────────────────
import { config } from "@/config";
import { loadKit } from "./kit";

export async function signWithWallet(xdr: string, address: string) {
  const kit = await loadKit();
  const { signedTxXdr } = await kit.signTransaction(xdr, {
    address, // quién firma
    networkPassphrase: config.networkPassphrase, // en qué red es válida la firma
  });
  return signedTxXdr;
}
