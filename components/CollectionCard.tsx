import Image from "next/image";
import Link from "next/link";
import type { CardImage, Collection } from "@/lib/types";
import { IconArrowRight } from "./Icons";

export default function CollectionCard({
  c,
  cover,
  count,
  variant = "wide",
}: {
  c: Collection;
  cover: CardImage | null;
  count: number;
  variant?: "wide" | "tall";
}) {
  return (
    <Link
      href={`/colecoes/${c.slug}`}
      className={`group relative isolate flex overflow-hidden rounded-3xl ring-1 ring-line transition-transform duration-300 ease-out-soft hover:-translate-y-1 hover:ring-saffron/50 ${
        variant === "wide" ? "aspect-[5/4] sm:aspect-[16/11]" : "aspect-[4/5]"
      }`}
      style={{ backgroundColor: c.accent }}
    >
      {cover ? (
        <Image
          src={cover.lg}
          alt=""
          fill
          sizes="(max-width: 640px) 88vw, (max-width: 1024px) 45vw, 420px"
          className="-z-10 object-cover transition-transform duration-700 ease-out-soft group-hover:scale-105"
          style={{ backgroundColor: cover.color }}
        />
      ) : (
        <div
          className="absolute inset-0 -z-10"
          style={{ background: `radial-gradient(120% 90% at 85% 10%, ${c.accent}, #1b1612 70%)` }}
        />
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/45 to-black/5" />
      <div className="mt-auto w-full p-5 sm:p-6">
        <p className="text-[0.85rem] font-bold uppercase tracking-[0.14em] text-saffron-2">{count} receitas</p>
        <h3 className="mt-1 font-display text-[1.6rem] leading-tight font-semibold sm:text-[1.85rem]">{c.name}</h3>
        <p className="mt-1.5 line-clamp-2 max-w-md text-[1rem] text-cream-2">{c.shortDescription}</p>
        <span className="mt-3 inline-flex items-center gap-1.5 font-bold text-cream group-hover:text-saffron-2">
          Abrir coleção <IconArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
