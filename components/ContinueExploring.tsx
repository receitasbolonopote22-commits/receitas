"use client";

import { useMemo } from "react";
import { useRecent } from "@/lib/storage";
import { useSearchIndex } from "@/lib/search-client";
import RecipeCard from "./RecipeCard";
import Scroller from "./Scroller";
import { CARD_W, RowHeader } from "./RecipeRow";

/** Fileira "Continue explorando": receitas abertas recentemente neste aparelho. */
export default function ContinueExploring() {
  const recent = useRecent();
  const { data } = useSearchIndex(recent.length > 0);
  const items = useMemo(() => {
    if (!data) return [];
    const byId = new Map(data.map((r) => [r.id, r]));
    return recent.map((id) => byId.get(id)).filter((r) => !!r);
  }, [data, recent]);

  if (!items.length) return null;
  return (
    <section className="animate-fade" aria-label="Continue explorando">
      <RowHeader title="Continue explorando" emoji="🕑" />
      <Scroller label="Continue explorando" cardWidth={CARD_W}>
        {items.map((r) => (
          <div role="listitem" key={r.id}>
            <RecipeCard r={r} sizes="(max-width: 640px) 44vw, 216px" />
          </div>
        ))}
      </Scroller>
    </section>
  );
}
