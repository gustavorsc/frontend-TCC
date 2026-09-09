/**
 * Cliente HTTP centralizado.
 *
 * - Injeta `Authorization: Bearer <idToken>` em todas as chamadas.
 * - Normaliza o formato de erro do backend (`{ error: { message, code } }`)
 *   em uma única exceção `ApiError`, tratada aqui e não em cada componente.
 * - Em `401` tenta uma vez renovar o ID Token (o Firebase às vezes serve um
 *   token em cache já expirado) e refaz a requisição; se ainda assim vier `401`,
 *   dispara o handler de "não autorizado" (→ redirecionar para /login).
 */
import type { ApiErrorCode } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
  readonly status: number;
  readonly code?: ApiErrorCode;

  constructor(message: string, status: number, code?: ApiErrorCode) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }

  /** Limite diário de chamadas de IA atingido (RN15). */
  get isRateLimited() {
    return this.status === 429 || this.code === "LIMITE_IA_DIARIO";
  }

  /** IA fora do ar / resposta inválida ao gerar rotina (RNF06). */
  get isIaUnavailable() {
    return (
      this.status === 502 ||
      this.status === 503 ||
      this.code === "IA_INDISPONIVEL" ||
      this.code === "IA_RESPOSTA_INVALIDA"
    );
  }
}

/** `forceRefresh` = pedir um ID Token novo ao Firebase (`getIdToken(true)`). */
type TokenProvider = (
  forceRefresh?: boolean,
) => string | null | Promise<string | null>;

let tokenProvider: TokenProvider = () => null;
let unauthorizedHandler: (() => void) | null = null;

/** Registrado pela camada de auth (useAuth) para fornecer o ID Token atual. */
export function setTokenProvider(provider: TokenProvider) {
  tokenProvider = provider;
}

/** Registrado pela camada de auth para reagir a um 401 (ex.: redirecionar para /login). */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

type ApiOptions = Omit<RequestInit, "body"> & {
  /** Serializado como JSON automaticamente. */
  body?: unknown;
  /** Pula a injeção do Bearer token (ex.: /health). */
  skipAuth?: boolean;
};

export async function api<T = unknown>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  if (!BASE_URL) {
    throw new ApiError(
      "NEXT_PUBLIC_API_URL não configurada (veja .env.local.example).",
      0,
    );
  }

  const { body, skipAuth, headers, ...rest } = options;
  const url = `${BASE_URL}${path}`;

  const send = async (forceRefreshToken: boolean): Promise<Response> => {
    const finalHeaders = new Headers(headers);

    if (!skipAuth) {
      const token = await tokenProvider(forceRefreshToken);
      if (token) {
        finalHeaders.set("Authorization", `Bearer ${token}`);
      }
    }
    if (body !== undefined) {
      finalHeaders.set("Content-Type", "application/json");
    }

    try {
      return await fetch(url, {
        ...rest,
        headers: finalHeaders,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } catch {
      throw new ApiError("Não foi possível conectar ao servidor.", 0);
    }
  };

  let response = await send(false);

  // Token em cache pode estar expirado: renova e tenta de novo, uma vez.
  if (response.status === 401 && !skipAuth) {
    response = await send(true);
  }

  if (response.status === 401) {
    unauthorizedHandler?.();
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const isJson = response.headers
    .get("content-type")
    ?.includes("application/json");
  const payload = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    const errShape = (
      payload as { error?: { message?: string; code?: ApiErrorCode } } | null
    )?.error;
    throw new ApiError(
      errShape?.message ?? `Erro ${response.status}`,
      response.status,
      errShape?.code,
    );
  }

  return payload as T;
}
