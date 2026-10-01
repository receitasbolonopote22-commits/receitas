"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { searchRecipes, useSearchIndex } from "@/lib/search-client";
import { formatMinutes } from "@/lib/text";
import { IconArrowRight, IconClose, IconSearch } from "./Icons";

const SUGGESTIONS = ["banana", "frango", "bolo", "sem açúcar", "low carb", "suco", "chocolate", "salada", "aveia", "sopa"];

export default function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { data, error } = useSearchIndex(open);
  const results = useMemo(() => (data && q.trim() ? searchRecipes(data, q) : []), [data, q]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => input.current?.focus(), 30);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  const shown = results.slice(0, 30);

  return (
    <div role="dialog" aria-modal="true" aria-label="Buscar receitas" className="fixed inset-0 z-50 flex flex-col bg-ink/97 backdrop-blur-md animate-fade">
      <form
        className="flex items-center gap-2 border-b border-line px-[var(--gutter)] py-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (q.trim()) {
            onClose();
            router.push(`/explorar?q=${encodeURIComponent(q.trim())}`);
          }
        }}
      >
        <label className="relative flex-1">
          <span className="sr-only">Buscar receitas</span>
          <IconSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            placeholder="Buscar receitas..."
            className="h-14 w-full rounded-full border border-line bg-ink-2 pl-12 pr-4 text-[1.15rem] text-cream placeholder:text-muted/80 focus:border-saffron focus:outline-none"
          />
        </label>
        <button type="button" onClick={onClose} className="grid size-14 shrink-0 place-items-center rounded-full text-cream hover:bg-ink-3" aria-label="Fechar busca">
          <IconClose size={26} />
        </button>
      </form>

      <div className="flex-1 overflow-y-auto px-[var(--gutter)] pb-28 pt-4">
        {!q.trim() && (
          <div className="mx-auto max-w-3xl">
            <p className="mb-3 text-[1.05rem] text-muted">Experimente buscar por um ingrediente ou tipo de receita:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" className="chip" onClick={() => setQ(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {q.trim() && !data && !error && <p className="mx-auto max-w-3xl text-muted">Carregando receitas…</p>}
        {error && <p className="mx-auto max-w-3xl text-rose">Não foi possível carregar a busca. Verifique sua conexão e tente novamente.</p>}

        {q.trim() && data && (
          <div className="mx-auto max-w-3xl">
            <p className="mb-3 text-muted" aria-live="polite">
              {results.length ? `${results.length} ${results.length === 1 ? "receita encontrada" : "receitas encontradas"}` : `Nenhuma receita encontrada para “${q}”.`}
            </p>
            <ul className="divide-y divide-line">
              {shown.map((r) => (
                <li key={r.id}>
                  <Link href={`/receitas/${r.slug}`} onClick={onClose} className="flex items-center gap-4 rounded-xl py-3 hover:bg-ink-2">
                    <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-ink-3">
                      {r.img ? (
                        <Image src={r.img.lg} alt="" fill sizes="240px" className="object-cover" style={{ backgroundColor: r.img.color }} />
                      ) : (
                        <span className="grid size-full place-items-center font-display text-2xl text-saffron">{r.title.charAt(0)}</span>
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-[1.15rem] leading-snug font-semibold">{r.title}</span>
                      {r.time && <span className="text-[0.92rem] text-muted">{formatMinutes(r.time)}</span>}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            {results.length > shown.length && (
              <Link href={`/explorar?q=${encodeURIComponent(q.trim())}`} onClick={onClose} className="btn btn-primary mt-6 w-full sm:w-auto">
                Ver todas as {results.length} receitas <IconArrowRight size={20} />
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
