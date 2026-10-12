"use client";
import { stellarConfig } from "@/config/stellar";
import type { NetworkStatus } from "@/hooks/useWallet";
import { Dot } from "@/components/ui";

export function NetworkBanner({ network }: { network: NetworkStatus }) {
  if (network !== "wrong" && network !== "unknown") return null;
  const wrong = network === "wrong";

  return (
    <div role={wrong ? "alert" : undefined} className={`card rise flex items-center gap-3 px-4 py-3 text-sm ${wrong ? "border-bad/50" : ""}`}>
      <Dot tone={wrong ? "bad" : "warn"} />
      <p className="text-dim">
        {wrong ? (
          <><b className="text-ink">Tu wallet está en otra red.</b> Cámbiala a </>
        ) : (
          <>Tu wallet no informa en qué red está. Asegúrate de que esté en </>
        )}
        <b className="font-mono text-ink uppercase">{stellarConfig.network}</b>
        {wrong ? " para poder operar." : "."}
      </p>
    </div>
  );
}
