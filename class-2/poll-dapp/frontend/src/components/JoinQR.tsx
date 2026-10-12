"use client";
// QR para que el público entre a votar desde su laptop.
// En Vercel, la URL de la página ya es la pública: el QR la toma sola.
import { QRCodeSVG } from "qrcode.react";
import { useSyncExternalStore } from "react";
import { config } from "@/config";

const noop = () => () => {};

/** URL a compartir: la configurada, o la de esta página (sin ?modo=pantalla). */
function useJoinUrl() {
  const origin = useSyncExternalStore(noop, () => window.location.origin, () => null);
  return config.appUrl ?? origin;
}

export function JoinQR() {
  const url = useJoinUrl();
  if (!url) return null;

  const isLocal = /\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(url);

  return (
    <aside className="card flex flex-col items-center gap-4 p-6 text-center">
      <span className="label">Vota desde tu laptop</span>
      <div className="rounded-xl bg-ink p-4">
        <QRCodeSVG value={url} size={220} bgColor="#fafafa" fgColor="#0a0a0a" />
      </div>
      <p className="font-mono text-lg break-all">{url.replace(/^https?:\/\//, "")}</p>
      <p className="text-sm text-muted">Necesitas Freighter en Testnet</p>
      {isLocal && (
        <p className="max-w-xs text-sm text-warn">
          Estás en localhost: proyecta la versión de Vercel para que el QR sirva.
        </p>
      )}
    </aside>
  );
}
