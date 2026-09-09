import { redirect } from "next/navigation";

// A landing pública entra numa etapa futura. Por ora, "/" leva ao app —
// o AuthGate do grupo (app) manda para /login se não houver sessão.
export default function Home() {
  redirect("/dashboard");
}
