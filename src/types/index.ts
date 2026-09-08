/**
 * Tipos espelhando os DTOs da API (contrato em CLAUDE.md).
 *
 * O CLAUDE.md descreve o propósito de cada rota, mas não lista todos os nomes
 * exatos de campos. Os campos marcados com `// ?` são inferidos e precisam ser
 * confirmados contra os DTOs reais do backend antes de serem usados como fonte
 * de verdade. Não adicionar campos que a API comprovadamente não envia.
 */

/** GET /api/usuarios/me */
export interface Usuario {
  nome: string;
  xp: number;
  streak: number;
}

/** GET /api/usuarios/me/progresso */
export interface Progresso {
  xp: number;
  streak: number;
  streakEmRisco: boolean;
}

/** GET /api/ranking — item do ranking semanal */
export interface RankingEntrada {
  posicao: number; // ?
  nome: string; // ?
  xp: number; // ?
}

/** GET /api/rotinas — item da lista */
export interface Rotina {
  id: string;
  titulo: string; // ?
}

/** GET /api/rotinas/:id — rotina com tarefas */
export interface RotinaDetalhe extends Rotina {
  tarefas: Tarefa[];
}

export interface Tarefa {
  id: string;
  titulo: string; // ?
  concluida: boolean; // ?
}

/** GET /api/desafios — desafio adaptativo */
export interface Desafio {
  id: string;
  titulo: string; // ?
  concluido: boolean; // ?
}

/* ------------------------------------------------------------------ */
/* Chat com IA — POST /api/rotinas/chat                                */
/* ------------------------------------------------------------------ */

export interface ChatMensagem {
  papel: "user" | "assistant"; // ?
  conteudo: string; // ?
}

export interface ChatRequest {
  mensagens: ChatMensagem[];
}

/** A IA responde com uma pergunta de acompanhamento ou com uma rotina pronta. */
export type ChatResponse =
  | ({ tipo: "pergunta" } & Record<string, unknown>)
  | ({ tipo: "rotina" } & Record<string, unknown>);

/* ------------------------------------------------------------------ */
/* Erros                                                               */
/* ------------------------------------------------------------------ */

export interface ApiErrorBody {
  error: {
    message: string;
    code: string;
  };
}
