import { config } from "@/config";

/**
 * Friendbot regala 10.000 XLM de prueba y, al hacerlo, CREA la cuenta en la red.
 * Solo existe en Testnet: en Mainnet los XLM se compran.
 */
export async function fundWithFriendbot(address: string): Promise<void> {
  const response = await fetch(`${config.friendbotUrl}?addr=${address}`);
  if (!response.ok) throw new Error(`Friendbot respondió ${response.status}`);
}
