/**
 * Schema definitivo do conteúdo da plataforma.
 *
 * Cada receita é um arquivo JSON em `content/recipes/<colecao>/<slug>.json`.
 * Campos ausentes no material de origem devem ser `null` — nunca inventados.
 */

export type IngredientSection = {
  /** Subtítulo do grupo (ex.: "Massa", "Recheio"). `null` quando não há grupo. */
  title: string | null;
  items: string[];
};

export type InstructionSection = {
  title: string | null;
  steps: string[];
};

export type Nutrition = {
  calories: number | null; // kcal
  carbs: number | null; // g
  protein: number | null; // g
  fat: number | null; // g
  fiber: number | null; // g
  /** Base dos valores, como no material original (ex.: "por porção", "por 100g"). */
  basis: string | null;
  /** true quando o material original diz "aproximado" / "médias de cálculo". */
  approximate: boolean;
  /** Texto original, quando não for possível converter em número (ex.: "0 a 1 g por porção"). */
  raw: string[];
};

export type VideoProvider = "youtube" | "vimeo" | "bunny" | "mp4";

export type RecipeVideo = {
  url: string;
  provider: VideoProvider;
  thumbnail: string | null;
  orientation: "vertical" | "horizontal";
};

export type RecipeNote = {
  /** Rótulo opcional (ex.: "Observação sobre adoçante", "Dica"). */
  label: string | null;
  text: string;
};

export type RecipeImage = {
  /** Nome do arquivo em `content/images/` (ex.: "bolo-de-cenoura.jpg"). */
  file: string;
  alt: string;
  /** "pdf" = extraída do material original; "manual" = adicionada depois. */
  origin: "pdf" | "manual";
};

export type Recipe = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  collections: string[];
  categories: string[];
  tags: string[];
  ingredients: IngredientSection[];
  instructions: InstructionSection[];
  /** Minutos. `null` quando o material não informa. */
  prepTime: number | null;
  cookTime: number | null;
  totalTime: number | null;
  /** Rendimento, como escrito no material (ex.: "12 fatias"). */
  servings: string | null;
  /** Porção sugerida, como escrito no material. */
  servingSize: string | null;
  nutrition: Nutrition | null;
  notes: RecipeNote[];
  image: RecipeImage | null;
  video: RecipeVideo | null;
  featured: boolean;
  source: {
    document: string;
    page: number | null;
    originalTitle: string | null;
  };
  review: {
    status: "ok" | "needs-review";
    /** Pontos para revisão editorial (inconsistências da fonte, OCR etc.). */
    flags: string[];
    /** Alegações de saúde do material original, guardadas para revisão — não exibidas como promessa. */
    healthClaims: string[];
  };
  /**
   * Quando a receita é uma cópia idêntica de outra (ex.: página repetida no PDF),
   * aponta para o slug da versão principal. Ela continua acessível pelo link,
   * mas não aparece em listas, busca e coleções.
   */
  duplicateOf?: string | null;
  /** Slugs escolhidos manualmente. Se vazio, a plataforma calcula sugestões. */
  relatedRecipes: string[];
};

export type Collection = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  /** Slug de uma receita cuja foto vira a capa, ou caminho de imagem em /public. */
  coverRecipe: string | null;
  coverImage: string | null;
  heroImage: string | null;
  disclaimer: string | null;
  featured: boolean;
  order: number;
  /** Cor de destaque usada nas capas sem foto. */
  accent: string;
};

export type Category = {
  slug: string;
  name: string;
  emoji: string;
  order: number;
  /** Se deve aparecer como fileira na página inicial. */
  homeRow: boolean;
};

/** Versão compacta usada em cards, busca e listas (vai para o navegador). */
export type RecipeCardData = {
  id: string;
  slug: string;
  title: string;
  categories: string[];
  collections: string[];
  time: number | null;
  img: CardImage | null;
};

export type CardImage = {
  sm: string;
  lg: string;
  /** JPG 800×1000 usado nas prévias de compartilhamento. */
  og: string;
  w: number;
  h: number;
  color: string;
  alt: string;
};

export type SearchEntry = RecipeCardData & {
  /** Texto normalizado (sem acentos, minúsculo) para busca. */
  k: string;
};
