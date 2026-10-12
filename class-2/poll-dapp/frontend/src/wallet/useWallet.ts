"use client";
// ─────────────────────────────────────────────────────────────────────────────
// 2. WALLET · Hook useWallet
//
// Estado de la conexión para toda la página: dirección conectada y si la
// wallet está en la red correcta.
// ─────────────────────────────────────────────────────────────────────────────
import { useCallback, useEffect, useState } from "react";
import { config } from "@/config";
import {
  connectWallet,
  disconnectWallet,
  getWalletNetwork,
  restoreWallet,
} from "./kit";

/** ok = Testnet · wrong = otra red (bloqueamos) · unknown = la wallet no lo informa */
export type NetworkStatus = "checking" | "ok" | "wrong" | "unknown";

/** Compara la red de la wallet con la de la app (config.ts). */
async function readNetworkStatus(): Promise<NetworkStatus> {
  const passphrase = await getWalletNetwork();
  if (passphrase === null) return "unknown";
  return passphrase === config.networkPassphrase ? "ok" : "wrong";
}

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<NetworkStatus>("checking");
  const [ready, setReady] = useState(false); // ¿ya intentamos restaurar la sesión?

  // Al cargar la página: restaurar la sesión anterior (si hay).
  useEffect(() => {
    restoreWallet().then((saved) => {
      setAddress(saved);
      setReady(true);
    });
  }, []);

  // Con una dirección conectada revisamos la red, y otra vez al volver a la
  // pestaña (el usuario pudo haber cambiado de red en su wallet).
  useEffect(() => {
    if (!address) return;
    const check = () => readNetworkStatus().then(setNetwork);
    check();
    window.addEventListener("focus", check);
    return () => window.removeEventListener("focus", check);
  }, [address]);

  const connect = useCallback(async () => {
    try {
      setAddress(await connectWallet());
    } catch {
      // el usuario cerró el selector: no es un error
    }
  }, []);

  const disconnect = useCallback(async () => {
    await disconnectWallet();
    setAddress(null);
    setNetwork("checking");
  }, []);

  return { address, network, ready, connect, disconnect };
}

export type Wallet = ReturnType<typeof useWallet>;
