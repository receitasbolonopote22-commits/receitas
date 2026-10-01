import Image from "next/image";
import Link from "next/link";
import type { RecipeCardData } from "@/lib/types";
import { IconArrowRight, IconLayers } from "./Icons";

/**
 * Hero da página inicial.
 * Celular: a foto do destaque ocupa a tela, texto embaixo.
 * Computador: texto à esquerda e um "mural" de pôsteres das receitas à direita.
 */
export default function Hero({ main, posters, count }: { main: RecipeCardData; posters: RecipeCardData[]; count: number }) {
  return (
    <section className="relative isolate overflow-hidden">
      {/* fundo: foto do destaque (celular) / luz difusa (desktop) */}
      {main.img && (
        <div className="absolute inset-0 -z-10 md:opacity-35 md:blur-3xl md:saturate-150 md:scale-110">
          <Image src={main.img.lg} alt="" fill preload sizes="100vw" className="object-cover" style={{ backgroundColor: main.img.color }} />
        </div>
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/70 to-ink/20 md:bg-gradient-to-r md:from-ink md:via-ink/90 md:to-ink/40" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-ink to-transparent" />

      <div className="mx-auto grid min-h-[88svh] max-w-[1400px] items-end gap-10 px-[var(--gutter)] pb-12 pt-28 md:min-h-[min(86vh,820px)] md:grid-cols-[1.05fr_1fr] md:items-center md:pb-16">
        <div className="max-w-2xl">
          <p className="eyebrow animate-rise">Biblioteca de receitas</p>
          <h1 className="mt-4 font-display text-[2.7rem] leading-[1.02] font-semibold tracking-tight text-balance sm:text-6xl lg:text-[4.6rem] animate-rise [animation-delay:80ms]">
            A cozinha de todo dia, <em className="font-normal text-saffron-2">sem complicação.</em>
          </h1>
          <p className="mt-5 max-w-xl text-[1.12rem] leading-relaxed text-cream-2 sm:text-[1.2rem] animate-rise [animation-delay:160ms]">
            <strong className="font-bold text-cream">{count.toLocaleString("pt-BR")} receitas</strong> organizadas por refeição e ocasião — com ingredientes
            para marcar enquanto cozinha e o passo a passo bem explicado.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row animate-rise [animation-delay:240ms]">
            <Link href="/explorar" className="btn btn-primary">
              Explorar receitas <IconArrowRight size={20} />
            </Link>
            <Link href="/colecoes" className="btn btn-ghost">
              <IconLayers size={20} /> Ver coleções
            </Link>
          </div>
          <Link
            href={`/receitas/${main.slug}`}
            className="mt-8 inline-flex items-center gap-2 text-[0.98rem] font-semibold text-cream-2 underline-offset-4 hover:text-saffron hover:underline md:hidden animate-fade [animation-delay:400ms]"
          >
            Na foto: {main.title} <IconArrowRight size={16} />
          </Link>
        </div>

        {/* mural de pôsteres (desktop) */}
        <div className="relative hidden h-[34rem] md:block" aria-label="Receitas em destaque">
          {posters.slice(0, 3).map((p, i) => {
            const pos = [
              "left-0 top-[14%] w-[40%] -rotate-[8deg] z-10",
              "left-[27%] top-0 w-[46%] rotate-[1deg] z-20",
              "left-[62%] top-[16%] w-[38%] rotate-[8deg] z-10",
            ][i];
            return (
              <Link
                key={p.id}
                href={`/receitas/${p.slug}`}
                className={`group absolute ${pos} aspect-[3/4] overflow-hidden rounded-[1.4rem] shadow-[0_30px_60px_-15px_rgb(0_0_0/0.8)] ring-1 ring-cream/15 transition-transform duration-500 ease-out-soft hover:z-30 hover:-translate-y-2 hover:rotate-0 animate-rise`}
                style={{ animationDelay: `${200 + i * 120}ms` }}
              >
                {p.img && (
                  <Image src={p.img.lg} alt={p.img.alt} fill sizes="(min-width: 768px) 26vw, 1px" loading="eager" className="object-cover" style={{ backgroundColor: p.img.color }} />
                )}
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-4 pt-16 font-display text-lg leading-snug font-semibold">
                  {p.title}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
