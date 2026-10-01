import categories from "@/content/categories.json";

/** Nomes das categorias, disponíveis também nos componentes do navegador. */
export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(categories.map((c) => [c.slug, c.name]));
