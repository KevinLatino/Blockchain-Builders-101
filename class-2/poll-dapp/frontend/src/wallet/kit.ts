// ─────────────────────────────────────────────────────────────────────────────
// 2. WALLET · Setup de Stellar Wallets Kit
//
// El kit nos da UNA sola API para muchas wallets (Freighter, xBull, Lobstr…).
// La app nunca ve claves privadas: solo pide la dirección y le pide a la
// wallet que firme. Las claves no salen de la wallet.
// ─────────────────────────────────────────────────────────────────────────────
import type { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";
import { config } from "@/config";

type Kit = typeof StellarWalletsKit;
let kitPromise: Promise<Kit> | null = null;

/**
 * Carga el kit SOLO en el navegador.
 * El kit usa `window` y `localStorage`, que no existen cuando Next renderiza
 * en el servidor: por eso se importa de forma dinámica y una única vez.
 */
export function loadKit(): Promise<Kit> {
  kitPromise ??= (async () => {
    const [
      { StellarWalletsKit },
      { SwkAppDarkTheme },
      { FreighterModule },
      { xBullModule },
      { LobstrModule },
      { AlbedoModule },
      { HanaModule },
    ] = await Promise.all([
      import("@creit-tech/stellar-wallets-kit/sdk"),
      import("@creit-tech/stellar-wallets-kit/types"),
      import("@creit-tech/stellar-wallets-kit/modules/freighter"),
      import("@creit-tech/stellar-wallets-kit/modules/xbull"),
      import("@creit-tech/stellar-wallets-kit/modules/lobstr"),
      import("@creit-tech/stellar-wallets-kit/modules/albedo"),
      import("@creit-tech/stellar-wallets-kit/modules/hana"),
    ]);

    StellarWalletsKit.init({
      // Las wallets que ofrecemos en el selector. (No usamos `defaultModules()`:
      // en la versión de JSR arrastra el módulo de MetaMask, que importa el kit
      // con su nombre viejo de npm y rompe el build.)
      modules: [
        new FreighterModule(),
        new xBullModule(),
        new LobstrModule(),
        new AlbedoModule(),
        new HanaModule(),
      ],
      network: config.networkPassphrase as never, // Testnet
      theme: {
        ...SwkAppDarkTheme, // mismo look monocromo que la app
        background: "#101010",
        "background-secondary": "#0a0a0a",
        primary: "#fafafa",
        "primary-foreground": "#0a0a0a",
        border: "#262626",
        shadow: "none",
        "border-radius": "14px",
        "font-family": "Satoshi, system-ui, sans-serif",
      },
    });
    return StellarWalletsKit;
  })();
  return kitPromise;
}

/** Abre el selector de wallets y devuelve la dirección elegida. */
export async function connectWallet(): Promise<string> {
  const kit = await loadKit();
  const { address } = await kit.authModal();
  return address;
}

/** Recupera la sesión guardada (el kit la persiste en localStorage). */
export async function restoreWallet(): Promise<string | null> {
  const kit = await loadKit();
  try {
    const { address } = await kit.getAddress();
    return address;
  } catch {
    return null; // nunca se conectó o se desconectó
  }
}

export async function disconnectWallet(): Promise<void> {
  const kit = await loadKit();
  await kit.disconnect();
}

/**
 * Pregunta a la wallet en qué red está. Devuelve `null` si la wallet
 * no lo informa (xBull, Lobstr, Albedo… no soportan esta consulta).
 */
export async function getWalletNetwork(): Promise<string | null> {
  const kit = await loadKit();
  try {
    const { networkPassphrase } = await kit.getNetwork();
    return networkPassphrase;
  } catch {
    return null;
  }
}
