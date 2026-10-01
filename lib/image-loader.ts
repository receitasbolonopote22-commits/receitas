"use client";

/**
 * Loader do next/image: as receitas têm duas versões pré-geradas
 * (<slug>-sm.webp com 480px e <slug>-lg.webp com 1080px).
 * Para qualquer outra imagem, devolve o próprio caminho.
 */
export default function imageLoader({ src, width }: { src: string; width: number; quality?: number }) {
  if (src.endsWith("-lg.webp") && width <= 480) return src.replace(/-lg\.webp$/, "-sm.webp");
  return src;
}
