// Importa el cliente generado para interactuar con el contrato de votaciones.
import { Client } from "poll";

// Importa la configuración de Stellar (contrato, red y RPC).
import { stellarConfig } from "@/config/stellar";

// Guarda el cliente de lectura para reutilizarlo y evitar crearlo varias veces.
let readClient: Client | null = null;


// Crea un cliente configurado para comunicarse con el contrato en Stellar.
function createClient(publicKey?: string): Client {
  return new Client({
    // Identificador del contrato inteligente.
    contractId: stellarConfig.contractId,

    // Red de Stellar que se utilizará.
    networkPassphrase: stellarConfig.networkPassphrase,

    // Dirección del servidor RPC para comunicarse con Stellar.
    rpcUrl: stellarConfig.rpcUrl,

    // Clave pública opcional de la cuenta.
    publicKey,
  });
}

/**
 * Obtiene el cliente del contrato.
 * - Sin publicKey: reutiliza el cliente de lectura.
 * - Con publicKey: crea un cliente asociado a esa cuenta.
 */
export function getPollClient(publicKey?: string): Client {
  // Si hay una clave pública, crea un cliente para esa cuenta.
  if (publicKey) return createClient(publicKey);

  // Si no existe un cliente de lectura, lo crea y lo guarda.
  readClient ??= createClient();

  // Devuelve el cliente de lectura existente.
  return readClient;
}