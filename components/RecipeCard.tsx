import Image from "next/image";
import Link from "next/link";
import type { CardImage, RecipeCardData } from "@/lib/types";
import { formatMinutes } from "@/lib/text";
import { ArtBowl, ArtBread, ArtCake, ArtCup, ArtPlate, ArtSun, IconClock } from "./Icons";
import { CATEGORY_LABELS } from "@/lib/labels";

/** Capa sem foto: composição tipográfica + ilustração de traço, por categoria. Nunca usa foto de outra receita. */
export function RecipePlaceholder({ title, categories, large = false }: { title: string; categories: string[]; large?: boolean }) {
  const c = categories;
  const [Art, tone] = c.includes("sucos-e-bebidas")
    ? [ArtCup, "from-[#2c3a22] to-[#1a2016] text-olive"]
    : c.includes("bolos") || c.includes("doces-e-sobremesas") || c.includes("caldas-e-coberturas")
      ? [ArtCake, "from-[#4a2a1f] to-[#221510] text-saffron-2"]
      : c.includes("sopas-e-cremes") || c.includes("saladas")
        ? [ArtBowl, "from-[#2d3a28] to-[#171c14] text-olive"]
        : c.includes("paes-e-salgados") || c.includes("lanches")
          ? [ArtBread, "from-[#47321c] to-[#211810] text-saffron"]
          : c.includes("cafe-da-manha")
            ? [ArtSun, "from-[#4b3415] to-[#1f170e] text-saffron-2"]
            : [ArtPlate, "from-[#3a2a22] to-[#1a1411] text-cream-2"];
  return (
    <div className={`absolute inset-0 overflow-hidden bg-gradient-to-br ${tone}`} aria-hidden>
      <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:14px_14px]" />
      <Art className={`absolute ${large ? "top-[14%] w-[34%]" : "top-[12%] w-[46%]"} left-1/2 -translate-x-1/2 opacity-80`} />
      <div className={`absolute inset-x-0 ${large ? "bottom-[30%] px-8" : "bottom-[34%] px-3"} text-center`}>
        <span className={`block font-display italic text-cream/90 leading-tight ${large ? "text-3xl" : "text-[0.95rem]"} line-clamp-3`}>
          {title}
        </span>
      </div>
    </div>
  );
}

export function RecipeCover({
  img,
  title,
  categories,
  sizes,
  eager = false,
  large = false,
}: {
  img: CardImage | null;
  title: string;
  categories: string[];
  sizes: string;
  eager?: boolean;
  large?: boolean;
}) {
  if (!img) return <RecipePlaceholder title={title} categories={categories} large={large} />;
  return (
    <Image
      src={img.lg}
      alt={img.alt}
      fill
      sizes={sizes}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      className="object-cover"
      style={{ backgroundColor: img.color }}
    />
  );
}

export default function RecipeCard({
  r,
  eager = false,
  sizes = "(max-width: 640px) 46vw, (max-width: 1024px) 28vw, 240px",
  showCategory = true,
}: {
  r: RecipeCardData;
  eager?: boolean;
  sizes?: string;
  showCategory?: boolean;
}) {
  const time = formatMinutes(r.time);
  const cat = r.categories[0] ? CATEGORY_LABELS[r.categories[0]] : null;
  return (
    <Link
      href={`/receitas/${r.slug}`}
      className="group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-ink-3 ring-1 ring-line outline-offset-4 transition-[transform,box-shadow] duration-300 ease-out-soft hover:-translate-y-1 hover:shadow-[0_18px_40px_-12px_rgb(0_0_0/0.7)] hover:ring-saffron/50"
    >
      <div className="absolute inset-0 transition-transform duration-700 ease-out-soft group-hover:scale-[1.05]">
        <RecipeCover img={r.img} title={r.title} categories={r.categories} sizes={sizes} eager={eager} />
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent px-3 pt-14 pb-3">
        <h3 className="font-display text-[1.05rem] leading-snug font-semibold text-cream line-clamp-2 sm:text-[1.1rem]">{r.title}</h3>
        {(time || (showCategory && cat)) && (
          <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[0.82rem] font-semibold text-cream-2/85">
            {time && (
              <span className="inline-flex items-center gap-1">
                <IconClock size={15} /> {time}
              </span>
            )}
            {time && showCategory && cat && <span aria-hidden>·</span>}
            {showCategory && cat && <span className="truncate">{cat}</span>}
          </p>
        )}
      </div>
    </Link>
  );
}

export function CardSkeleton() {
  return <div className="skeleton aspect-[4/5] rounded-2xl" />;
}
