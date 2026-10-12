"use client";
import type { PollData } from "@/contract/read";

type Props = {
  poll: PollData;
  size?: "normal" | "screen"; // "screen" = modo pantalla, para proyectar
  selected?: number | null;
  onSelect?: (option: number) => void; // si no viene, solo se muestran resultados
  disabled?: boolean;
};

export function PollResults({ poll, size = "normal", selected = null, onSelect, disabled }: Props) {
  const total = poll.results.reduce((sum, n) => sum + n, 0);
  const max = Math.max(...poll.results);
  const big = size === "screen";

  return (
    <ul className={big ? "space-y-8" : "space-y-2.5"}>
      {poll.options.map((label, i) => {
        const votes = poll.results[i] ?? 0;
        const percent = total ? Math.round((votes / total) * 100) : 0;
        const leading = votes > 0 && votes === max;
        const isSelected = selected === i;

        const content = (
          <>
            <div className="flex items-baseline justify-between gap-3">
              <span className={`flex items-center gap-2.5 font-medium ${big ? "text-4xl" : "text-sm"} ${leading ? "text-ink" : "text-dim"}`}>
                {onSelect && (
                  <span className={`grid size-4 place-items-center rounded-full border ${isSelected ? "border-ink" : "border-hairline-strong"}`}>
                    {isSelected && <span className="size-2 rounded-full bg-ink" />}
                  </span>
                )}
                {label}
              </span>
              <span className={`font-mono tabular-nums text-muted ${big ? "text-3xl" : "text-xs"}`}>
                <span className="text-ink">{votes}</span> · {percent}%
              </span>
            </div>
            {/* La barra anima su ancho cuando llegan votos nuevos */}
            <div className={`mt-2 overflow-hidden rounded-full bg-surface-2 ${big ? "h-6" : "h-1.5"}`}>
              <div
                className={`h-full rounded-full transition-[width] duration-700 ease-out ${leading ? "bg-ink" : "bg-dim/60"}`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </>
        );

        return (
          <li key={label}>
            {onSelect ? (
              <button
                type="button"
                onClick={() => onSelect(i)}
                disabled={disabled}
                className={`w-full rounded-lg border px-3 py-2.5 text-left transition-colors disabled:cursor-not-allowed ${isSelected ? "border-ink bg-surface-2" : "border-hairline hover:border-hairline-strong"}`}
              >
                {content}
              </button>
            ) : (
              content
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** Punto verde que late + total de votos. */
export function LiveBadge({ total, big }: { total: number; big?: boolean }) {
  return (
    <span className={`flex items-center gap-2 font-mono text-muted ${big ? "text-2xl" : "text-xs"}`}>
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-ok opacity-60" />
        <span className="relative inline-flex size-2 rounded-full bg-ok" />
      </span>
      EN VIVO · {total} {total === 1 ? "voto" : "votos"}
    </span>
  );
}
