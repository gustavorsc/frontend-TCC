"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";

type QueryState<T> = {
  data: T | null;
  error: ApiError | null;
  carregando: boolean;
};

/**
 * GET simples em um recurso da API, com estados de carregamento/erro e `recarregar`.
 * Para telas de leitura (dashboard, listas). Mutations continuam via `api()` direto.
 *
 * Observação: a troca de `path` mantém os dados anteriores até a nova resposta
 * chegar (não pisca "carregando"). Use `recarregar()` para forçar o estado de
 * carregamento de novo.
 */
export function useApiQuery<T>(path: string | null) {
  const [state, setState] = useState<QueryState<T>>({
    data: null,
    error: null,
    carregando: path !== null,
  });
  const [tentativa, setTentativa] = useState(0);

  const recarregar = useCallback(() => {
    setState((s) => ({ ...s, carregando: true, error: null }));
    setTentativa((n) => n + 1);
  }, []);

  useEffect(() => {
    if (path === null) return;
    let cancelado = false;

    api<T>(path)
      .then((data) => {
        if (!cancelado) setState({ data, error: null, carregando: false });
      })
      .catch((e) => {
        if (cancelado) return;
        setState({
          data: null,
          error: e instanceof ApiError ? e : new ApiError("Erro inesperado.", 0),
          carregando: false,
        });
      });

    return () => {
      cancelado = true;
    };
  }, [path, tentativa]);

  return { ...state, recarregar };
}
