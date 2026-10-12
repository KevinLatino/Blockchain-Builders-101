"use client";
import type { Wallet } from "@/wallet/useWallet";
import { Dot, GhostButton, PrimaryButton } from "./ui";

/** GABC…WXYZ */
function shortAddress(address: string) {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export function ConnectButton({ wallet }: { wallet: Wallet }) {
  // Mientras restauramos la sesión, no mostramos un botón que "salte".
  if (!wallet.ready) return <div className="h-10" />;

  if (!wallet.address) {
    return <PrimaryButton onClick={wallet.connect}>Conectar wallet</PrimaryButton>;
  }

  const tone = wallet.network === "ok" ? "ok" : wallet.network === "wrong" ? "bad" : "warn";
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-9 items-center gap-2 rounded-lg border border-hairline bg-surface px-3 font-mono text-sm">
        <Dot tone={tone} />
        {shortAddress(wallet.address)}
      </span>
      <GhostButton onClick={wallet.disconnect}>Desconectar</GhostButton>
    </div>
  );
}
