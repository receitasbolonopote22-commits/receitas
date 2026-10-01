import type { Metadata } from "next";
import { Logo } from "@/components/Logo";
import PasswordField from "@/components/PasswordField";
import { safeNext } from "@/lib/access";
import { site } from "@/site.config";

export const metadata: Metadata = {
  title: "Entrar",
  description: `Acesso exclusivo para clientes ${site.name}.`,
  robots: { index: false, follow: false },
};

export default async function LoginPage({ searchParams }: PageProps<"/entrar">) {
  const sp = await searchParams;
  const erro = sp.erro === "1";
  const next = safeNext(typeof sp.next === "string" ? sp.next : "/");

  return (
    <main className="relative isolate flex min-h-dvh items-center justify-center overflow-hidden px-[var(--gutter)] py-12">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{ background: "radial-gradient(90% 60% at 80% 0%, #4a2c16 0%, transparent 60%), radial-gradient(70% 50% at 0% 100%, #2c3a22 0%, transparent 60%), #120e0b" }}
      />
      <div className="w-full max-w-md animate-rise">
        <Logo />
        <h1 className="mt-10 font-display text-[2.4rem] leading-[1.05] font-semibold tracking-tight sm:text-5xl">
          Bem-vinda à sua <em className="font-normal text-saffron-2">biblioteca de receitas.</em>
        </h1>
        <p className="mt-4 text-[1.12rem] leading-relaxed text-cream-2">
          Digite a senha de acesso que você recebeu pelo WhatsApp depois da compra.
        </p>

        <form action="/api/entrar" method="post" className="mt-8">
          <input type="hidden" name="next" value={next} />
          <PasswordField invalid={erro} />
          {erro && (
            <p role="alert" className="mt-3 rounded-2xl bg-rose/15 px-4 py-3 text-[1.02rem] font-semibold text-rose ring-1 ring-rose/40">
              Senha incorreta. Confira a senha mais recente que enviamos no WhatsApp e tente de novo.
            </p>
          )}
          <button type="submit" className="btn btn-primary mt-5 w-full text-[1.12rem]">
            Entrar
          </button>
        </form>

        <p className="mt-8 text-[1rem] leading-relaxed text-muted">
          Não tem a senha ou ela parou de funcionar? Fale com a gente pelo WhatsApp que enviamos a senha atualizada.
        </p>
      </div>
    </main>
  );
}
