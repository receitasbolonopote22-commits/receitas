import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import RecipeRow from "@/components/RecipeRow";
import RecipeCard from "@/components/RecipeCard";
import { IconArrowRight, IconInfo } from "@/components/Icons";
import { getCollection, getCollectionCover, getCollections, getUsedCategories, getRecipesByCollection, mix, toCard, withPhotosFirst } from "@/lib/content";

export const dynamicParams = false;
export function generateStaticParams() {
  return getCollections().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/colecoes/[slug]">): Promise<Metadata> {
  const c = getCollection((await params).slug);
  if (!c) return {};
  const cover = getCollectionCover(c);
  return {
    title: c.name,
    description: c.shortDescription,
    alternates: { canonical: `/colecoes/${c.slug}` },
    openGraph: { title: c.name, description: c.shortDescription, url: `/colecoes/${c.slug}`, images: cover ? [cover.og] : undefined },
  };
}

export default async function CollectionPage({ params }: PageProps<"/colecoes/[slug]">) {
  const c = getCollection((await params).slug);
  if (!c) notFound();
  const recipes = getRecipesByCollection(c.slug);
  const cover = getCollectionCover(c);
  const cats = getUsedCategories()
    .map((cat) => ({ cat, list: recipes.filter((r) => r.categories.includes(cat.slug)) }))
    .filter((x) => x.list.length >= 4);
  const showRows = recipes.length > 24 && cats.length > 1;

  return (
    <div>
      <section className="relative isolate overflow-hidden" style={{ backgroundColor: c.accent }}>
        {cover && <Image src={cover.lg} alt="" fill preload sizes="100vw" className="-z-10 object-cover opacity-60 md:opacity-45" />}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/75 to-ink/30" />
        <div className="mx-auto max-w-[1400px] px-[var(--gutter)] pb-10 pt-32 sm:pb-14 sm:pt-40">
          <Link href="/colecoes" className="eyebrow hover:text-saffron-2">Coleções</Link>
          <h1 className="mt-3 max-w-3xl font-display text-[2.6rem] leading-[1.03] font-semibold text-balance sm:text-6xl">{c.name}</h1>
          <p className="mt-4 max-w-2xl text-[1.15rem] leading-relaxed text-cream-2">{c.description}</p>
          <p className="mt-5 text-[1.05rem] font-bold text-saffron-2">{recipes.length} receitas</p>
          {c.disclaimer && (
            <p className="mt-6 flex max-w-2xl gap-3 rounded-2xl bg-ink/60 p-4 text-[0.98rem] text-cream-2 ring-1 ring-line backdrop-blur">
              <IconInfo className="mt-0.5 shrink-0 text-saffron" /> {c.disclaimer}
            </p>
          )}
        </div>
      </section>

      {showRows ? (
        <div className="mt-8 space-y-10">
          {cats.map(({ cat, list }) => (
            <RecipeRow
              key={cat.slug}
              title={cat.name}
              emoji={cat.emoji}
              href={`/explorar?colecao=${c.slug}&categoria=${cat.slug}`}
              count={list.length}
              recipes={withPhotosFirst(mix(list, c.slug + cat.slug)).slice(0, 18).map(toCard)}
            />
          ))}
          <div className="px-[var(--gutter)]">
            <Link href={`/explorar?colecao=${c.slug}`} className="btn btn-primary w-full sm:w-auto">
              Ver todas as {recipes.length} receitas da coleção <IconArrowRight size={20} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-3 px-[var(--gutter)] sm:grid-cols-3 sm:gap-4 lg:grid-cols-5 xl:grid-cols-6">
          {withPhotosFirst(recipes).map((r, i) => (
            <RecipeCard key={r.id} r={toCard(r)} eager={i < 4} sizes="(max-width: 640px) 46vw, 220px" />
          ))}
        </div>
      )}
    </div>
  );
}
