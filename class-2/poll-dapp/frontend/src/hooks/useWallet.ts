"use client";
// ─────────────────────────────────────────────────────────────────────────────
// 2. WALLET · Hook useWallet
//
// Estado de la conexión para toda la página: dirección conectada y si la
// wallet está en la red correcta.
// ─────────────────────────────────────────────────────────────────────────────
import { useCallback, useEffect, useState } from "react";
import {
  connectWallet,
  disconnectWallet,
  fundWithFriendbot,
  getWalletNetworkStatus,
  restoreWallet,
  type WalletNetworkStatus,
} from "@/services/wallet.service";

/** checking = todavía no le preguntamos a la wallet */
export type NetworkStatus = "checking" | WalletNetworkStatus;

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
    const check = () => getWalletNetworkStatus().then(setNetwork);
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

  /** Fondea la cuenta conectada con Friendbot (solo Testnet). */
  const fund = useCallback(async () => {
    if (address) await fundWithFriendbot(address);
  }, [address]);

  return { address, network, ready, connect, disconnect, fund };
}

export type Wallet = ReturnType<typeof useWallet>;
