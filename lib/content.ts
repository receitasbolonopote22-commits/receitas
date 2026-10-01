/**
 * Camada de dados (somente servidor). Lê os arquivos JSON de `content/` no build
 * e entrega receitas, coleções e categorias para as páginas.
 *
 * Para trocar a origem dos dados no futuro (banco de dados, CMS, área /admin),
 * basta reimplementar as funções exportadas aqui mantendo as mesmas assinaturas —
 * as páginas e componentes não precisam mudar.
 */
import fs from "node:fs";
import path from "node:path";
import type { CardImage, Category, Collection, Recipe, RecipeCardData, SearchEntry } from "./types";
import { normalize } from "./text";

const ROOT = process.cwd();
const C = (...p: string[]) => path.join(ROOT, "content", ...p);

type ImageMeta = Record<string, { w: number; h: number; color: string }>;

type Store = {
  all: Recipe[];
  visible: Recipe[];
  bySlug: Map<string, Recipe>;
  collections: Collection[];
  categories: Category[];
  images: ImageMeta;
};

let store: Store | null = null;

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, "utf8")) as T;
}

function load(): Store {
  if (store && process.env.NODE_ENV === "production") return store;
  const all: Recipe[] = [];
  for (const dir of fs.readdirSync(C("recipes"))) {
    const d = C("recipes", dir);
    if (!fs.statSync(d).isDirectory()) continue;
    for (const f of fs.readdirSync(d)) if (f.endsWith(".json")) all.push(readJson<Recipe>(path.join(d, f)));
  }
  all.sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));
  const collections = fs
    .readdirSync(C("collections"))
    .filter((f) => f.endsWith(".json"))
    .map((f) => readJson<Collection>(C("collections", f)))
    .sort((a, b) => a.order - b.order);
  const categories = readJson<Category[]>(C("categories.json")).sort((a, b) => a.order - b.order);
  const metaFile = C("_generated", "images.json");
  const images = fs.existsSync(metaFile) ? readJson<ImageMeta>(metaFile) : {};
  store = {
    all,
    visible: all.filter((r) => !r.duplicateOf),
    bySlug: new Map(all.map((r) => [r.slug, r])),
    collections,
    categories,
    images,
  };
  return store;
}

// ---------- receitas
export const getAllRecipes = () => load().visible;
export const getRecipeCount = () => load().visible.length;
export const getRecipe = (slug: string) => load().bySlug.get(slug) ?? null;
/** Todas as receitas, inclusive cópias ocultas (para gerar as páginas). */
export const getAllRecipeSlugs = () => load().all.map((r) => r.slug);

export function getRecipesByCategory(slug: string) {
  return getAllRecipes().filter((r) => r.categories.includes(slug));
}
export function getRecipesByCollection(slug: string) {
  return getAllRecipes().filter((r) => r.collections.includes(slug));
}

/** Tempo de referência para exibição/filtro: total, senão preparo. */
export const recipeTime = (r: Recipe) => r.totalTime ?? r.prepTime ?? null;

export function getQuickRecipes(max = 20) {
  return getAllRecipes().filter((r) => {
    const t = recipeTime(r);
    return t != null && t <= max;
  });
}

/** Ordena dando prioridade a receitas com foto (fileiras mais bonitas), de forma estável. */
export function withPhotosFirst(list: Recipe[]) {
  return [...list].sort((a, b) => Number(!!b.image) - Number(!!a.image));
}

export function getFeatured() {
  const f = getAllRecipes().filter((r) => r.featured);
  return f.length ? f : withPhotosFirst(getAllRecipes()).slice(0, 10);
}

const STOP = new Set("de da do das dos e com a o em para ao na no um uma ou sem gosto colher colheres sopa cha xicara xicaras agua sal".split(" "));
const tokenize = (s: string) =>
  new Set(normalize(s).split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !STOP.has(w) && !/^\d+$/.test(w)));

export function getRelated(recipe: Recipe, limit = 12): Recipe[] {
  const s = load();
  const manual = recipe.relatedRecipes.map((slug) => s.bySlug.get(slug)).filter((r): r is Recipe => !!r);
  if (manual.length >= limit) return manual.slice(0, limit);
  const mine = tokenize(recipe.title + " " + recipe.ingredients.flatMap((x) => x.items).join(" "));
  const scored = s.visible
    .filter((r) => r.slug !== recipe.slug && r.slug !== recipe.duplicateOf && !manual.includes(r))
    .map((r) => {
      let score = 0;
      for (const c of r.categories) if (recipe.categories.includes(c)) score += 3;
      for (const c of r.collections) if (recipe.collections.includes(c)) score += 1;
      const theirs = tokenize(r.title + " " + r.ingredients.flatMap((x) => x.items).join(" "));
      for (const w of theirs) if (mine.has(w)) score += 0.6;
      if (r.image) score += 1.5;
      return { r, score };
    })
    .sort((a, b) => b.score - a.score || a.r.title.localeCompare(b.r.title));
  return [...manual, ...scored.slice(0, limit - manual.length).map((x) => x.r)];
}

// ---------- coleções e categorias
export const getCollections = () => load().collections;
export const getCollection = (slug: string) => load().collections.find((c) => c.slug === slug) ?? null;
export const getCategories = () => load().categories;
export const getCategory = (slug: string) => load().categories.find((c) => c.slug === slug) ?? null;
/** Categorias que têm pelo menos uma receita. */
export const getUsedCategories = () => {
  const all = getAllRecipes();
  return getCategories().filter((c) => all.some((r) => r.categories.includes(c.slug)));
};

export function getCollectionCover(c: Collection): CardImage | null {
  if (c.coverRecipe) {
    const r = getRecipe(c.coverRecipe);
    if (r) return cardImage(r);
  }
  const first = getRecipesByCollection(c.slug).find((r) => r.image);
  return first ? cardImage(first) : null;
}

// ---------- imagens e dados compactos
export function cardImage(r: Recipe): CardImage | null {
  if (!r.image) return null;
  const base = r.image.file.replace(/\.[^.]+$/, "");
  const meta = load().images[base];
  if (!meta) return null;
  return {
    sm: `/images/recipes/${base}-sm.webp`,
    lg: `/images/recipes/${base}-lg.webp`,
    og: `/images/recipes/${base}-og.jpg`,
    w: meta.w,
    h: meta.h,
    color: meta.color,
    alt: r.image.alt || r.title,
  };
}

export function toCard(r: Recipe): RecipeCardData {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    categories: r.categories,
    collections: r.collections,
    time: recipeTime(r),
    img: cardImage(r),
  };
}

export function getSearchIndex(): SearchEntry[] {
  const cats = new Map(getCategories().map((c) => [c.slug, c.name]));
  const cols = new Map(getCollections().map((c) => [c.slug, c.name]));
  return getAllRecipes().map((r) => ({
    ...toCard(r),
    k: normalize(
      [
        r.title,
        r.tags.join(" "),
        r.categories.map((c) => cats.get(c) ?? c).join(" "),
        r.collections.map((c) => cols.get(c) ?? c).join(" "),
        "|",
        r.ingredients.flatMap((s) => s.items).join(" "),
      ].join(" "),
    ),
  }));
}

/** Embaralhamento determinístico (mesma ordem a cada build) para dar variedade às fileiras. */
export function mix<T extends { slug: string }>(list: T[], seed: string): T[] {
  const h = (s: string) => {
    let x = 2166136261;
    for (let i = 0; i < s.length; i++) x = Math.imul(x ^ s.charCodeAt(i), 16777619);
    return x >>> 0;
  };
  return [...list].sort((a, b) => h(seed + a.slug) - h(seed + b.slug));
}
