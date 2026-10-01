import Link from "next/link";
import type { RecipeCardData } from "@/lib/types";
import RecipeCard from "./RecipeCard";
import Scroller from "./Scroller";
import { IconArrowRight } from "./Icons";

export const CARD_W = "clamp(9.5rem, 44vw, 13.5rem)";

export function RowHeader({ title, emoji, href, count }: { title: string; emoji?: string; href?: string; count?: number }) {
  return (
    <div className="mb-1 flex items-end justify-between gap-4 px-[var(--gutter)]">
      <h2 className="font-display text-[1.45rem] leading-tight font-semibold sm:text-[1.7rem]">
        {emoji && <span className="mr-2 align-[-0.05em] text-[0.9em]" aria-hidden>{emoji}</span>}
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="group inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-1 text-[0.95rem] font-bold text-saffron hover:text-saffron-2"
        >
          Ver tudo{count ? <span className="hidden text-cream-2/70 sm:inline"> ({count})</span> : null}
          <IconArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

export default function RecipeRow({
  title,
  emoji,
  href,
  recipes,
  count,
  eager = false,
}: {
  title: string;
  emoji?: string;
  href?: string;
  recipes: RecipeCardData[];
  count?: number;
  eager?: boolean;
}) {
  if (!recipes.length) return null;
  return (
    <section className="animate-rise" aria-label={title}>
      <RowHeader title={title} emoji={emoji} href={href} count={count} />
      <Scroller label={title} cardWidth={CARD_W}>
        {recipes.map((r, i) => (
          <div role="listitem" key={r.id}>
            <RecipeCard r={r} eager={eager && i < 3} sizes="(max-width: 640px) 44vw, 216px" />
          </div>
        ))}
      </Scroller>
    </section>
  );
}
