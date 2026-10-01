import Link from "next/link";
import { site } from "@/site.config";
import { Logo } from "./Logo";
import { IconInfo } from "./Icons";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-ink-2/60 px-[var(--gutter)] pb-28 pt-12 md:pb-12">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.2fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-md text-[1rem] text-muted">{site.description}</p>
        </div>
        <div className="flex gap-3 rounded-2xl border border-line bg-ink-3/50 p-5 text-[0.98rem] text-cream-2">
          <IconInfo className="mt-0.5 shrink-0 text-saffron" />
          <p>{site.healthNotice}</p>
        </div>
      </div>
      <nav aria-label="Rodapé" className="mx-auto mt-10 flex max-w-6xl flex-wrap gap-x-6 gap-y-2 text-[1rem] font-semibold text-cream-2">
        <Link href="/explorar" className="py-1 hover:text-saffron">Explorar</Link>
        <Link href="/colecoes" className="py-1 hover:text-saffron">Coleções</Link>
        <Link href="/favoritos" className="py-1 hover:text-saffron">Favoritos</Link>
      </nav>
      <p className="mx-auto mt-6 max-w-6xl text-[0.9rem] text-muted/80">© {new Date().getFullYear()} {site.name}. Acesso pessoal e intransferível.</p>
    </footer>
  );
}
