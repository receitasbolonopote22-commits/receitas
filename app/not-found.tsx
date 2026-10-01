import Link from "next/link";
import { IconArrowRight } from "@/components/Icons";
import Header from "@/components/Header";

export default function NotFound() {
  return (
    <>
    <Header />
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col justify-center px-[var(--gutter)] pt-24">
      <p className="eyebrow">Página não encontrada</p>
      <h1 className="mt-3 font-display text-5xl font-semibold leading-tight">Essa receita saiu do forno antes da hora.</h1>
      <p className="mt-4 text-[1.12rem] text-cream-2">O endereço pode ter mudado. Que tal procurar na biblioteca?</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/explorar" className="btn btn-primary">Explorar receitas <IconArrowRight size={20} /></Link>
        <Link href="/" className="btn btn-ghost">Página inicial</Link>
      </div>
    </div>
    </>
  );
}
