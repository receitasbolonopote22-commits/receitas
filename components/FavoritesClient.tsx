"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useFavorites, useHydrated } from "@/lib/storage";
import { useSearchIndex } from "@/lib/search-client";
import RecipeCard, { CardSkeleton } from "./RecipeCard";
import { IconArrowRight, IconHeart } from "./Icons";

export default function FavoritesClient() {
  const hydrated = useHydrated();
  const { ids } = useFavorites();
  const { data } = useSearchIndex(ids.length > 0);
  const items = useMemo(() => {
    if (!data) return null;
    const byId = new Map(data.map((r) => [r.id, r]));
    return ids.map((id) => byId.get(id)).filter((r) => !!r);
  }, [data, ids]);

  if (!hydrated || (ids.length > 0 && !items)) {
    return (
      <div className="mt-8 grid grid-cols-2 gap-3 px-[var(--gutter)] sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => <CardSkeleton key={i} />)}
      </div>
    );
  }

  if (!ids.length || !items?.length) {
    return (
      <div className="mx-[var(--gutter)] mt-8 max-w-2xl rounded-3xl border border-line bg-ink-2 p-8">
        <IconHeart size={40} className="text-rose" />
        <p className="mt-4 font-display text-[1.7rem] leading-tight">Você ainda não salvou nenhuma receita</p>
        <p className="mt-3 text-[1.08rem] text-cream-2">
          Quando gostar de uma receita, toque em <strong className="text-cream">Favoritar</strong>. Ela aparece aqui para você achar rapidinho — mesmo depois de fechar o site.
        </p>
        <Link href="/explorar" className="btn btn-primary mt-6">
          Explorar receitas <IconArrowRight size={20} />
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="mt-4 px-[var(--gutter)] text-[1.05rem] text-cream-2">
        {items.length} {items.length === 1 ? "receita salva" : "receitas salvas"}. Os favoritos ficam guardados neste celular ou computador.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3 px-[var(--gutter)] sm:grid-cols-3 sm:gap-4 lg:grid-cols-5 xl:grid-cols-6">
        {items.map((r) => (
          <RecipeCard key={r.id} r={r} sizes="(max-width: 640px) 46vw, 220px" />
        ))}
      </div>
    </>
  );
}
