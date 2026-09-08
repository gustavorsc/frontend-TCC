/**
 * Cliente HTTP centralizado.
 *
 * - Injeta `Authorization: Bearer <idToken>` em todas as chamadas.
 * - Normaliza o formato de erro do backend (`{ error: { message, code } }`)
 *   em uma única exceção `ApiError`, tratada aqui e não em cada componente.
 * - Dispara o handler de "não autorizado" quando a API responde 401
 *   (token expirado/inválido → redirecionar para /login).
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }

  /** Limite diário de chamadas de IA atingido (RN15). */
  get isRateLimited() {
    return this.status === 429;
  }

  /** Backend indisponível ao falar com a IA (RNF06). */
  get isUpstreamUnavailable() {
    return this.status === 502 || this.status === 503;
  }
}

type TokenProvider = () => string | null | Promise<string | null>;

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
  const finalHeaders = new Headers(headers);

  if (!skipAuth) {
    const token = await tokenProvider();
    if (token) {
      finalHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  if (body !== undefined) {
    finalHeaders.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...rest,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Não foi possível conectar ao servidor.", 0);
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
    const errShape = (payload as { error?: { message?: string; code?: string } } | null)
      ?.error;
    throw new ApiError(
      errShape?.message ?? `Erro ${response.status}`,
      response.status,
      errShape?.code,
    );
  }

  return payload as T;
}
