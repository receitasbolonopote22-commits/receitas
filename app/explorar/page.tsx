import type { Metadata } from "next";
import { Suspense } from "react";
import ExploreClient from "@/components/ExploreClient";
import { CardSkeleton } from "@/components/RecipeCard";
import { getCollections, getRecipeCount, getRecipesByCategory, getRecipesByCollection, getUsedCategories } from "@/lib/content";

export const metadata: Metadata = {
  title: "Explorar receitas",
  description: "Navegue por toda a biblioteca de receitas, com filtros por categoria e coleção.",
  alternates: { canonical: "/explorar" },
};

export default function ExplorePage() {
  const categories = getUsedCategories().map((c) => ({ slug: c.slug, name: c.name, emoji: c.emoji, count: getRecipesByCategory(c.slug).length }));
  const collections = getCollections().map((c) => ({ slug: c.slug, name: c.name, count: getRecipesByCollection(c.slug).length }));
  return (
    <div className="pt-24 sm:pt-28">
      <header className="px-[var(--gutter)]">
        <p className="eyebrow">Toda a biblioteca</p>
        <h1 className="mt-2 font-display text-[2.4rem] leading-tight font-semibold sm:text-5xl">Explorar receitas</h1>
      </header>
      <div className="mt-6">
        <Suspense
          fallback={
            <div className="grid grid-cols-2 gap-3 px-[var(--gutter)] sm:grid-cols-3 lg:grid-cols-5">
              {Array.from({ length: 10 }, (_, i) => <CardSkeleton key={i} />)}
            </div>
          }
        >
          <ExploreClient categories={categories} collections={collections} total={getRecipeCount()} />
        </Suspense>
      </div>
    </div>
  );
}
