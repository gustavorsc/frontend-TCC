import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `next dev` (Next 16) reescreve o CLAUDE.md do projeto adicionando um bloco
  // "nextjs-agent-rules". O CLAUDE.md aqui é mantido à mão — desligamos a injeção.
  agentRules: false,
};

export default nextConfig;
