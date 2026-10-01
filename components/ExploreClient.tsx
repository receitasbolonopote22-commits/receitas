"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { searchRecipes, useSearchIndex } from "@/lib/search-client";
import RecipeCard, { CardSkeleton } from "./RecipeCard";
import { IconClose, IconSearch } from "./Icons";

type Opt = { slug: string; name: string; emoji?: string; count: number };
const PAGE = 36;

export default function ExploreClient({ categories, collections, total }: { categories: Opt[]; collections: Opt[]; total: number }) {
  const sp = useSearchParams();
  const router = useRouter();
  const { data, error } = useSearchIndex(true);

  const categoria = sp.get("categoria") ?? "";
  const colecao = sp.get("colecao") ?? "";
  const tempo = Number(sp.get("tempo") ?? 0) || 0;
  const qParam = sp.get("q") ?? "";
  const [q, setQ] = useState(qParam);
  const [limit, setLimit] = useState(PAGE);
  const sentinel = useRef<HTMLDivElement>(null);

  // sincroniza a URL (para poder compartilhar/voltar) sem recarregar
  const setParam = (patch: Record<string, string | number | null>) => {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === "" || v === 0) next.delete(k);
      else next.set(k, String(v));
    }
    setLimit(PAGE);
    router.replace(`/explorar${next.size ? `?${next}` : ""}`, { scroll: false });
  };

  useEffect(() => {
    const t = setTimeout(() => {
      if (q !== qParam) setParam({ q: q.trim() || null });
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const list = useMemo(() => {
    if (!data) return null;
    let l = qParam.trim() ? searchRecipes(data, qParam) : [...data].sort((a, b) => Number(!!b.img) - Number(!!a.img) || a.title.localeCompare(b.title, "pt-BR"));
    if (categoria) l = l.filter((r) => r.categories.includes(categoria));
    if (colecao) l = l.filter((r) => r.collections.includes(colecao));
    if (tempo) l = l.filter((r) => r.time != null && r.time <= tempo);
    return l;
  }, [data, qParam, categoria, colecao, tempo]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || !list || limit >= list.length) return;
    const io = new IntersectionObserver((e) => e[0].isIntersecting && setLimit((l) => l + PAGE), { rootMargin: "800px" });
    io.observe(el);
    return () => io.disconnect();
  }, [list, limit]);

  const activeCol = collections.find((c) => c.slug === colecao);
  const anyFilter = categoria || colecao || tempo || qParam;

  return (
    <div>
      <div className="px-[var(--gutter)]">
        <label className="relative block max-w-2xl">
          <span className="sr-only">Buscar receitas</span>
          <IconSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            type="search"
            enterKeyHint="search"
            placeholder="Buscar receitas, ingredientes..."
            className="h-14 w-full rounded-full border border-line bg-ink-2 pl-12 pr-4 text-[1.12rem] text-cream placeholder:text-muted/80 focus:border-saffron focus:outline-none"
          />
        </label>
      </div>

      {/* Filtros por categoria — vêm dos dados */}
      <div className="row-scroller mt-5 !grid-cols-none !gap-2 !py-1" style={{ gridAutoColumns: "max-content" }} role="group" aria-label="Filtrar por categoria">
        <button type="button" className="chip" aria-pressed={!categoria} onClick={() => setParam({ categoria: null })}>
          Todas
        </button>
        {categories.map((c) => (
          <button key={c.slug} type="button" className="chip" aria-pressed={categoria === c.slug} onClick={() => setParam({ categoria: categoria === c.slug ? null : c.slug })}>
            <span aria-hidden>{c.emoji}</span> {c.name}
          </button>
        ))}
      </div>
      <div className="row-scroller mt-1 !gap-2 !py-1" style={{ gridAutoColumns: "max-content" }} role="group" aria-label="Mais filtros">
        <button type="button" className="chip" aria-pressed={tempo === 20} onClick={() => setParam({ tempo: tempo === 20 ? null : 20 })}>
          ⚡ Rápidas (até 20 min)
        </button>
        {collections.map((c) => (
          <button key={c.slug} type="button" className="chip" aria-pressed={colecao === c.slug} onClick={() => setParam({ colecao: colecao === c.slug ? null : c.slug })}>
            {c.name}
          </button>
        ))}
      </div>

      <div className="mt-6 flex min-h-11 flex-wrap items-center gap-3 px-[var(--gutter)]">
        <p className="text-[1.05rem] text-cream-2" aria-live="polite">
          {list ? (
            <>
              <strong className="text-cream">{list.length.toLocaleString("pt-BR")}</strong> {list.length === 1 ? "receita" : "receitas"}
              {anyFilter ? ` encontradas de ${total.toLocaleString("pt-BR")}` : " disponíveis"}
              {activeCol ? ` em ${activeCol.name}` : ""}
            </>
          ) : (
            "Carregando receitas…"
          )}
        </p>
        {anyFilter && (
          <button type="button" className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 font-semibold text-saffron hover:text-saffron-2" onClick={() => { setQ(""); router.replace("/explorar", { scroll: false }); }}>
            <IconClose size={18} /> Limpar filtros
          </button>
        )}
      </div>

      {error && <p className="px-[var(--gutter)] text-rose">Não foi possível carregar as receitas. Verifique sua conexão.</p>}

      <div className="mt-4 grid grid-cols-2 gap-3 px-[var(--gutter)] sm:grid-cols-3 sm:gap-4 lg:grid-cols-5 xl:grid-cols-6">
        {!list && Array.from({ length: 12 }, (_, i) => <CardSkeleton key={i} />)}
        {list?.slice(0, limit).map((r, i) => (
          <div key={r.id} className="animate-fade">
            <RecipeCard r={r} eager={i < 4} sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 220px" />
          </div>
        ))}
      </div>
      {list && list.length === 0 && (
        <div className="mx-[var(--gutter)] mt-6 rounded-3xl border border-line bg-ink-2 p-8 text-center">
          <p className="font-display text-2xl">Nenhuma receita encontrada</p>
          <p className="mt-2 text-muted">Tente outra palavra ou remova algum filtro.</p>
        </div>
      )}
      {list && limit < list.length && (
        <div ref={sentinel} className="mt-8 flex justify-center px-[var(--gutter)]">
          <button type="button" className="btn btn-ghost w-full sm:w-auto" onClick={() => setLimit((l) => l + PAGE)}>
            Mostrar mais receitas
          </button>
        </div>
      )}
    </div>
  );
}
