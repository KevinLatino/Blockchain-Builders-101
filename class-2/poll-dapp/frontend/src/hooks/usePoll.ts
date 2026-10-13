//Lee los datos y las muestra.

"use client";
import { useCallback, useEffect, useState } from "react";
import { mapError, type FriendlyError } from "@/services/errors";
import { readPoll, readResults, type PollData } from "@/services/poll.service";

/** Cada cuánto refrescamos los resultados. Leer es gratis: no hay firma. */
const REFRESH_MS = 5_000;

/** Encuesta completa + resultados que se actualizan solos. */
export function usePoll() {
  const [poll, setPoll] = useState<PollData>();
  const [error, setError] = useState<FriendlyError | null>(null);

  // Trae solo los votos y los combina con la pregunta y opciones ya cargadas.
  const refresh = useCallback(() => {
    return readResults()
      .then((results) => {
        setPoll((current) => current && { ...current, results });
        setError(null);
      })
      .catch((e) => setError(mapError(e)));
  }, []);

  // 1) Al cargar: pregunta, opciones y resultados.
  useEffect(() => {
    readPoll().then(setPoll).catch((e) => setError(mapError(e)));
  }, []);

  // 2) Después: refrescar los resultados cada 5 s (si la pestaña está visible).
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, REFRESH_MS);
    return () => clearInterval(id);
  }, [refresh]);

  return { poll, error, refresh };
}
