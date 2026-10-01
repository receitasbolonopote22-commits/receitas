"use client";

import { useFavorites, useHydrated } from "@/lib/storage";
import { IconHeart } from "./Icons";

export default function FavoriteButton({ id, title, compact = false }: { id: string; title: string; compact?: boolean }) {
  const { has, toggle } = useFavorites();
  const hydrated = useHydrated();
  const on = hydrated && has(id);
  return (
    <button
      type="button"
      onClick={() => toggle(id)}
      aria-pressed={on}
      aria-label={on ? `Remover ${title} dos favoritos` : `Salvar ${title} nos favoritos`}
      className={`btn ${on ? "bg-rose text-ink hover:bg-rose/90" : "btn-ghost"} ${compact ? "!px-4" : "flex-1 sm:flex-none"}`}
    >
      <IconHeart filled={on} size={22} className={on ? "animate-[rise_.35s_ease]" : ""} />
      {on ? "Salva nos favoritos" : "Favoritar"}
    </button>
  );
}
