import type { Metadata } from "next";
import CollectionCard from "@/components/CollectionCard";
import { getCollectionCover, getCollections, getRecipesByCollection } from "@/lib/content";

export const metadata: Metadata = {
  title: "Coleções",
  description: "Receitas organizadas por tema: alimentação e diabetes, doces sem açúcar, low carb, sucos e muito mais.",
  alternates: { canonical: "/colecoes" },
};

export default function CollectionsPage() {
  const cols = getCollections();
  return (
    <div className="pt-24 sm:pt-28">
      <header className="px-[var(--gutter)]">
        <p className="eyebrow">Por tema</p>
        <h1 className="mt-2 font-display text-[2.4rem] leading-tight font-semibold sm:text-5xl">Coleções</h1>
        <p className="mt-3 max-w-2xl text-[1.12rem] text-cream-2">Seleções de receitas organizadas por tema e ocasião. Cada coleção reúne pratos, doces e bebidas com o mesmo propósito.</p>
      </header>
      <div className="mt-8 grid gap-4 px-[var(--gutter)] sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
        {cols.map((c, i) => (
          <div key={c.slug} className="animate-rise" style={{ animationDelay: `${i * 70}ms` }}>
            <CollectionCard c={c} cover={getCollectionCover(c)} count={getRecipesByCollection(c.slug).length} variant="tall" />
          </div>
        ))}
      </div>
    </div>
  );
}
