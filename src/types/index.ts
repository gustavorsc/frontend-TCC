/**
 * Tipos espelhando os DTOs da API.
 *
 * Fonte de verdade: `backend-TCC/docs/referencia-api.md` e `modelo-de-dados.md`
 * (contrato fechado, backend já implementado). Não adicionar campos que a API
 * não envia nem renomear os existentes sem alinhar com o backend.
 *
 * Datas: strings ISO 8601 UTC (ex.: "2026-09-08T13:45:00.000Z").
 */

/* ------------------------------------------------------------------ */
/* Usuário                                                             */
/* ------------------------------------------------------------------ */

/** GET /api/usuarios/me — `firebaseUid` e `authProvider` não são expostos. */
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  xpTotal: number;
  streakAtual: number;
  /** Instante da última conclusão de tarefa; `null` se nunca concluiu nada. */
  ultimaAtividade: string | null;
  dataCriacao: string;
}

/** Item de `Progresso.rotinas`. */
export interface ProgressoRotina {
  id: string;
  tema: string;
  /** Inteiro 0–100 (% de tarefas concluídas da rotina). */
  progresso: number;
}

/** GET /api/usuarios/me/progresso (RN16). */
export interface Progresso {
  xpTotal: number;
  streakAtual: number;
  /** `true` = há streak ativo e nenhuma conclusão hoje (fuso de São Paulo). */
  streakEmRisco: boolean;
  /** Rotinas da mais recente para a mais antiga. */
  rotinas: ProgressoRotina[];
}

/* ------------------------------------------------------------------ */
/* Rotinas e Tarefas                                                   */
/* ------------------------------------------------------------------ */

export interface Rotina {
  id: string;
  usuarioId: string;
  tema: string;
  descricao: string | null;
  nivelConhecimento: string | null;
  tempoDisponivel: string | null;
  frequencia: string | null;
  /** 0–100, recalculado pelo backend. */
  progresso: number;
  dataCriacao: string;
}

/** GET /api/rotinas — item da lista (traz a contagem em vez das tarefas). */
export interface RotinaResumo extends Rotina {
  _count: { tarefas: number };
}

/** GET /api/rotinas/:id e a rotina retornada no chat (`tipo: "rotina"`). */
export interface RotinaComTarefas extends Rotina {
  tarefas: Tarefa[];
}

export interface Tarefa {
  id: string;
  rotinaId: string;
  titulo: string;
  descricao: string | null;
  concluida: boolean;
  dataCriacao: string;
  dataConclusao: string | null;
  /** 0 até concluir; vira 10 (RN09/RN11). */
  xpConcedido: number;
}

/** PUT /api/rotinas/:id — ao menos um campo; `tema` não pode ser vazio. */
export interface AtualizarRotinaInput {
  tema?: string;
  descricao?: string | null;
  nivelConhecimento?: string | null;
  tempoDisponivel?: string | null;
  frequencia?: string | null;
}

/** POST /api/rotinas/:id/tarefas */
export interface CriarTarefaInput {
  titulo: string;
  descricao?: string | null;
}

/** PUT /api/tarefas/:id — ao menos um campo. */
export interface AtualizarTarefaInput {
  titulo?: string;
  descricao?: string | null;
}

/* ------------------------------------------------------------------ */
/* Desafios                                                            */
/* ------------------------------------------------------------------ */

/** GET /api/desafios (RN13). */
export interface Desafio {
  id: string;
  usuarioId: string;
  tema: string;
  /** Texto da IA: primeira linha = título, resto = corpo com os passos. */
  conteudo: string;
  concluido: boolean;
  dataCriacao: string;
}

/* ------------------------------------------------------------------ */
/* Ranking                                                             */
/* ------------------------------------------------------------------ */

/** GET /api/ranking — semana corrente, do maior XP para o menor. */
export interface RankingEntrada {
  usuarioId: string;
  nome: string;
  /** Sempre múltiplo de 10 (10 × tarefas concluídas na semana). */
  xpSemana: number;
}

/* ------------------------------------------------------------------ */
/* Chat com IA — POST /api/rotinas/chat                                */
/* ------------------------------------------------------------------ */

/** 1–40 itens; `content` de 1–2000 chars; a última mensagem tem que ser "user". */
export interface ChatMensagem {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  mensagens: ChatMensagem[];
}

/** 200 — a IA quer mais informação antes de gerar a rotina. */
export interface ChatRespostaPergunta {
  tipo: "pergunta";
  mensagem: string;
  /** Chamadas de IA restantes hoje (limite 10/dia, RN15). */
  chamadasRestantes: number;
}

/** 201 — rotina gerada e já persistida (sem passo de confirmação). */
export interface ChatRespostaRotina {
  tipo: "rotina";
  rotina: RotinaComTarefas;
  chamadasRestantes: number;
}

export type ChatResposta = ChatRespostaPergunta | ChatRespostaRotina;

/* ------------------------------------------------------------------ */
/* Erros — corpo sempre `{ error: { message, code } }`                 */
/* ------------------------------------------------------------------ */

export type ApiErrorCode =
  | "VALIDACAO"
  | "ROTINA_SEM_TAREFA"
  | "NAO_AUTENTICADO"
  | "ROTINA_ACESSO_NEGADO"
  | "TAREFA_ACESSO_NEGADA"
  | "DESAFIO_ACESSO_NEGADO"
  | "ROTINA_NAO_ENCONTRADA"
  | "TAREFA_NAO_ENCONTRADA"
  | "DESAFIO_NAO_ENCONTRADO"
  | "LIMITE_IA_DIARIO"
  | "IA_RESPOSTA_INVALIDA"
  | "IA_INDISPONIVEL"
  | "ERRO_INTERNO";

export interface ApiErrorBody {
  error: {
    message: string;
    code: ApiErrorCode;
  };
}
