import Hero from "@/components/Hero";
import RecipeRow from "@/components/RecipeRow";
import CollectionCard from "@/components/CollectionCard";
import ContinueExploring from "@/components/ContinueExploring";
import Scroller from "@/components/Scroller";
import { RowHeader } from "@/components/RecipeRow";
import {
  getCategory,
  getCollection,
  getCollectionCover,
  getCollections,
  getFeatured,
  getQuickRecipes,
  getRecipeCount,
  getRecipesByCategory,
  getRecipesByCollection,
  mix,
  toCard,
  withPhotosFirst,
} from "@/lib/content";
import type { Recipe } from "@/lib/types";

/**
 * Fileiras da página inicial. Para mudar a ordem ou incluir uma nova fileira,
 * edite esta lista: { tipo: "categoria" | "colecao", slug }.
 */
const ROWS: ({ type: "category" | "collection"; slug: string; title?: string; emoji?: string } | { type: "quick" } | { type: "collections" })[] = [
  { type: "category", slug: "cafe-da-manha" },
  { type: "category", slug: "almoco" },
  { type: "category", slug: "jantar" },
  { type: "collections" },
  { type: "category", slug: "bolos" },
  { type: "collection", slug: "doces-sem-acucar", title: "Doces sem açúcar", emoji: "🍫" },
  { type: "category", slug: "sucos-e-bebidas" },
  { type: "collection", slug: "low-carb", title: "Low carb", emoji: "🥑" },
  { type: "quick" },
  { type: "category", slug: "lanches" },
  { type: "category", slug: "saladas" },
  { type: "category", slug: "sopas-e-cremes" },
  { type: "collection", slug: "natal-zero-acucar", title: "Natal zero açúcar", emoji: "🎄" },
  { type: "category", slug: "paes-e-salgados" },
];

const LIMIT = 18;
const cards = (list: Recipe[], seed: string) => withPhotosFirst(mix(list, seed)).slice(0, LIMIT).map(toCard);

export default function Home() {
  const featured = getFeatured();
  const heroMain = featured.find((r) => r.slug === "torta-mousse-de-maracuja") ?? featured[0];
  const posters = featured.filter((r) => r.image && r.slug !== heroMain.slug);
  const collections = getCollections();

  return (
    <>
      <Hero main={toCard(heroMain)} posters={[posters[1], heroMain, posters[4]].filter(Boolean).map(toCard)} count={getRecipeCount()} />

      <div className="relative z-10 -mt-6 space-y-9 sm:space-y-12">
        <RecipeRow title="Em destaque" emoji="✨" recipes={featured.map(toCard)} eager />
        <ContinueExploring />

        {ROWS.map((row, i) => {
          if (row.type === "collections")
            return (
              <section key="cols" aria-label="Coleções">
                <RowHeader title="Coleções" emoji="📚" href="/colecoes" />
                <Scroller label="Coleções" cardWidth="clamp(17rem, 82vw, 26rem)">
                  {collections.map((c) => (
                    <div role="listitem" key={c.slug}>
                      <CollectionCard c={c} cover={getCollectionCover(c)} count={getRecipesByCollection(c.slug).length} />
                    </div>
                  ))}
                </Scroller>
              </section>
            );
          if (row.type === "quick") {
            const quick = getQuickRecipes(20);
            if (quick.length < 6) return null;
            return <RecipeRow key="quick" title="Receitas rápidas (até 20 min)" emoji="⚡" href="/explorar?tempo=20" recipes={cards(quick, "quick")} count={quick.length} />;
          }
          if (row.type === "category") {
            const cat = getCategory(row.slug);
            const list = getRecipesByCategory(row.slug);
            if (!cat) return null;
            return <RecipeRow key={i} title={row.title ?? cat.name} emoji={row.emoji ?? cat.emoji} href={`/explorar?categoria=${cat.slug}`} recipes={cards(list, cat.slug)} count={list.length} />;
          }
          const col = getCollection(row.slug);
          const list = getRecipesByCollection(row.slug);
          if (!col) return null;
          return <RecipeRow key={i} title={row.title ?? col.name} emoji={row.emoji} href={`/colecoes/${col.slug}`} recipes={cards(list, col.slug)} count={list.length} />;
        })}
      </div>
    </>
  );
}
