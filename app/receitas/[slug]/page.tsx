import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  cardImage,
  getAllRecipeSlugs,
  getCategories,
  getCollections,
  getRecipe,
  getRelated,
  recipeTime,
  toCard,
} from "@/lib/content";
import { formatMinutes, isoDuration } from "@/lib/text";
import { site } from "@/site.config";
import RecipeRow from "@/components/RecipeRow";
import { RecipePlaceholder } from "@/components/RecipeCard";
import FavoriteButton from "@/components/FavoriteButton";
import ShareButton from "@/components/ShareButton";
import IngredientChecklist from "@/components/IngredientChecklist";
import StepList from "@/components/StepList";
import RecipeVideo from "@/components/RecipeVideo";
import Nutrition from "@/components/Nutrition";
import KeepAwake from "@/components/KeepAwake";
import TrackRecent from "@/components/TrackRecent";
import { IconClock, IconInfo, IconLeaf, IconUsers } from "@/components/Icons";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllRecipeSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/receitas/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const r = getRecipe(slug);
  if (!r) return {};
  const canonical = `/receitas/${r.duplicateOf ?? r.slug}`;
  const description = r.description ?? `${r.title}: ingredientes e modo de preparo passo a passo.`;
  const img = cardImage(r);
  return {
    title: r.title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: r.title,
      description,
      url: `/receitas/${r.slug}`,
      images: img ? [{ url: img.og, width: 800, height: 1000, alt: img.alt }] : undefined,
    },
    twitter: { card: img ? "summary_large_image" : "summary", title: r.title, description, images: img ? [img.og] : undefined },
  };
}

export default async function RecipePage({ params }: PageProps<"/receitas/[slug]">) {
  const { slug } = await params;
  const r = getRecipe(slug);
  if (!r) notFound();

  const img = cardImage(r);
  const time = recipeTime(r);
  const cats = getCategories().filter((c) => r.categories.includes(c.slug));
  const cols = getCollections().filter((c) => r.collections.includes(c.slug));
  const disclaimers = [...new Set(cols.map((c) => c.disclaimer).filter(Boolean))] as string[];
  const related = getRelated(r, 14).map(toCard);
  const tipNotes = r.notes;

  // Schema.org Recipe — somente com dados que existem no material de origem
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: r.title,
    ...(r.description && { description: r.description }),
    ...(img && { image: [new URL(img.lg, site.url).toString()] }),
    recipeCategory: cats.map((c) => c.name).join(", ") || undefined,
    recipeIngredient: r.ingredients.flatMap((s) => s.items),
    recipeInstructions: r.instructions.flatMap((s) => s.steps.map((text) => ({ "@type": "HowToStep", text }))),
    ...(r.servings && { recipeYield: r.servings }),
    ...(r.prepTime != null && { prepTime: isoDuration(r.prepTime) }),
    ...(r.cookTime != null && { cookTime: isoDuration(r.cookTime) }),
    ...(r.totalTime != null && { totalTime: isoDuration(r.totalTime) }),
    ...(r.video && { video: { "@type": "VideoObject", name: r.title, contentUrl: r.video.url } }),
  };
  const n = r.nutrition;
  if (n && (n.calories != null || n.carbs != null || n.protein != null || n.fat != null || n.fiber != null)) {
    ld.nutrition = {
      "@type": "NutritionInformation",
      ...(n.calories != null && { calories: `${n.calories} kcal` }),
      ...(n.carbs != null && { carbohydrateContent: `${n.carbs} g` }),
      ...(n.protein != null && { proteinContent: `${n.protein} g` }),
      ...(n.fat != null && { fatContent: `${n.fat} g` }),
      ...(n.fiber != null && { fiberContent: `${n.fiber} g` }),
      ...(n.basis && { servingSize: n.basis }),
    };
  }

  return (
    <article>
      <TrackRecent id={r.id} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />

      {/* Topo: foto + título */}
      <div className="relative isolate">
        {img && (
          <div className="absolute inset-0 -z-10 hidden overflow-hidden opacity-30 blur-3xl saturate-150 md:block" aria-hidden>
            <Image src={img.sm} alt="" fill sizes="240px" className="scale-125 object-cover" />
          </div>
        )}
        <div className="absolute inset-0 -z-10 hidden bg-gradient-to-b from-ink/30 via-ink/80 to-ink md:block" />

        <div className="mx-auto grid max-w-[1200px] gap-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-12 md:px-[var(--gutter)] md:pt-28">
          <div className="relative aspect-[4/5] max-h-[78svh] w-full overflow-hidden md:sticky md:top-24 md:max-h-none md:self-start md:rounded-[2rem] md:shadow-[0_40px_80px_-30px_rgb(0_0_0/0.9)] md:ring-1 md:ring-line">
            {img ? (
              <Image src={img.lg} alt={img.alt} fill preload sizes="(max-width: 768px) 100vw, 520px" className="object-cover" style={{ backgroundColor: img.color }} />
            ) : (
              <RecipePlaceholder title={r.title} categories={r.categories} large />
            )}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink to-transparent md:hidden" />
          </div>

          <div className="-mt-20 px-[var(--gutter)] md:mt-0 md:px-0">
            <nav aria-label="Categorias" className="relative flex flex-wrap gap-2">
              {cats.slice(0, 3).map((c) => (
                <Link key={c.slug} href={`/explorar?categoria=${c.slug}`} className="rounded-full bg-ink/70 px-3.5 py-1.5 text-[0.9rem] font-bold text-saffron-2 ring-1 ring-saffron/30 backdrop-blur hover:bg-saffron hover:text-ink">
                  {c.name}
                </Link>
              ))}
            </nav>
            <h1 className="mt-4 font-display text-[2.3rem] leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl lg:text-[3.4rem]">{r.title}</h1>
            {r.description && <p className="mt-4 max-w-2xl text-[1.18rem] leading-relaxed text-cream-2">{r.description}</p>}

            {(time != null || r.servings || r.servingSize) && (
              <dl className="mt-6 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
                {time != null && (
                  <div className="rounded-2xl border border-line bg-ink-2 px-4 py-3">
                    <dt className="flex items-center gap-1.5 text-[0.85rem] font-semibold uppercase tracking-wider text-muted"><IconClock size={17} /> Tempo</dt>
                    <dd className="mt-0.5 text-[1.15rem] font-bold">{formatMinutes(time)}</dd>
                  </div>
                )}
                {r.servings && (
                  <div className="rounded-2xl border border-line bg-ink-2 px-4 py-3">
                    <dt className="flex items-center gap-1.5 text-[0.85rem] font-semibold uppercase tracking-wider text-muted"><IconUsers size={17} /> Rendimento</dt>
                    <dd className="mt-0.5 text-[1.15rem] font-bold">{r.servings}</dd>
                  </div>
                )}
                {r.servingSize && (
                  <div className="col-span-2 rounded-2xl border border-line bg-ink-2 px-4 py-3 sm:col-span-1">
                    <dt className="flex items-center gap-1.5 text-[0.85rem] font-semibold uppercase tracking-wider text-muted"><IconLeaf size={17} /> Porção sugerida</dt>
                    <dd className="mt-0.5 text-[1.15rem] font-bold">{r.servingSize}</dd>
                  </div>
                )}
              </dl>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <FavoriteButton id={r.id} title={r.title} />
              <ShareButton title={r.title} text={r.description ?? `Receita: ${r.title}`} path={`/receitas/${r.slug}`} />
            </div>

            {/* Ingredientes */}
            <section aria-labelledby="ingredientes" className="mt-12">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <h2 id="ingredientes" className="font-display text-[1.9rem] font-semibold">Ingredientes</h2>
                <KeepAwake />
              </div>
              <IngredientChecklist id={r.id} sections={r.ingredients} />
            </section>

            {/* Modo de preparo */}
            {r.instructions.length > 0 && (
              <section aria-labelledby="preparo" className="mt-12">
                <h2 id="preparo" className="mb-5 font-display text-[1.9rem] font-semibold">Modo de preparo</h2>
                <StepList sections={r.instructions} />
              </section>
            )}

            {/* Vídeo (só aparece se existir) */}
            {r.video && (
              <section aria-labelledby="video" className="mt-12">
                <h2 id="video" className="mb-5 font-display text-[1.9rem] font-semibold">Assista ao preparo</h2>
                <RecipeVideo video={r.video} title={r.title} fallback={img} />
              </section>
            )}

            {/* Dicas e observações do material */}
            {tipNotes.length > 0 && (
              <section aria-labelledby="dicas" className="mt-12">
                <h2 id="dicas" className="mb-4 font-display text-[1.6rem] font-semibold">Dicas e observações</h2>
                <ul className="space-y-3">
                  {tipNotes.map((note, i) => (
                    <li key={i} className="rounded-2xl border border-line bg-ink-2 p-4 text-[1.08rem] leading-relaxed text-cream-2">
                      {note.label && <strong className="mb-0.5 block text-cream">{note.label}</strong>}
                      {note.text}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Informações nutricionais (só se existirem no material) */}
            {r.nutrition && <Nutrition n={r.nutrition} />}

            {disclaimers.length > 0 && (
              <aside className="mt-10 flex gap-3 rounded-2xl border border-saffron/25 bg-saffron/[0.06] p-4 text-[0.98rem] leading-relaxed text-cream-2">
                <IconInfo className="mt-0.5 shrink-0 text-saffron" />
                <div className="space-y-2">
                  {disclaimers.map((d) => <p key={d}>{d}</p>)}
                </div>
              </aside>
            )}

            {cols.length > 0 && (
              <p className="mt-8 text-[1rem] text-muted">
                Faz parte {cols.length > 1 ? "das coleções" : "da coleção"}{" "}
                {cols.map((c, i) => (
                  <span key={c.slug}>
                    {i > 0 && (i === cols.length - 1 ? " e " : ", ")}
                    <Link href={`/colecoes/${c.slug}`} className="font-semibold text-saffron underline-offset-4 hover:underline">{c.name}</Link>
                  </span>
                ))}
                .
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-16">
        <RecipeRow title="Você também pode gostar" recipes={related} />
      </div>
    </article>
  );
}
