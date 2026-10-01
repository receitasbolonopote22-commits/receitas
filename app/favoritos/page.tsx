import type { Metadata } from "next";
import FavoritesClient from "@/components/FavoritesClient";

export const metadata: Metadata = {
  title: "Meus favoritos",
  description: "As receitas que você salvou neste aparelho.",
  alternates: { canonical: "/favoritos" },
  robots: { index: false },
};

export default function FavoritesPage() {
  return (
    <div className="pt-24 sm:pt-28">
      <header className="px-[var(--gutter)]">
        <p className="eyebrow">Salvas neste aparelho</p>
        <h1 className="mt-2 font-display text-[2.4rem] leading-tight font-semibold sm:text-5xl">Meus favoritos</h1>
      </header>
      <FavoritesClient />
    </div>
  );
}
