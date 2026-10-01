"use client";

import { useEffect, useState } from "react";
import type { SearchEntry } from "./types";
import { normalize } from "./text";

let promise: Promise<SearchEntry[]> | null = null;
let cached: SearchEntry[] | null = null;

/** Carrega o índice de busca uma única vez (arquivo estático, cacheado pela CDN). */
export function loadIndex(): Promise<SearchEntry[]> {
  if (cached) return Promise.resolve(cached);
  promise ??= fetch("/search-index.json")
    .then((r) => {
      if (!r.ok) throw new Error("index");
      return r.json() as Promise<SearchEntry[]>;
    })
    .then((d) => (cached = d))
    .catch((e) => {
      promise = null;
      throw e;
    });
  return promise;
}

export function useSearchIndex(enabled = true) {
  const [data, setData] = useState<SearchEntry[] | null>(cached);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!enabled || data) return;
    let alive = true;
    loadIndex()
      .then((d) => alive && setData(d))
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, [enabled, data]);
  return { data, error };
}

/**
 * Busca simples e rápida: todas as palavras digitadas precisam aparecer
 * (no nome, ingredientes, categorias, coleções ou tags). Resultados com a
 * palavra no nome aparecem primeiro.
 */
export function searchRecipes(index: SearchEntry[], query: string): SearchEntry[] {
  const words = normalize(query)
    .split(/\s+/)
    .map((w) => w.replace(/[^a-z0-9-]/g, ""))
    .filter((w) => w.length > 1);
  if (!words.length) return [];
  const stems = words.map((w) => (w.length > 4 ? w.replace(/(oes|aes|ais|eis|s)$/, "") : w));
  const out: { e: SearchEntry; score: number }[] = [];
  for (const e of index) {
    if (!stems.every((s) => e.k.includes(s))) continue;
    const title = normalize(e.title);
    let score = 0;
    for (const s of stems) {
      if (title.startsWith(s)) score += 6;
      else if (title.includes(" " + s)) score += 4;
      else if (title.includes(s)) score += 3;
      else if (e.k.indexOf(s) < e.k.indexOf("|")) score += 1.5;
    }
    if (e.img) score += 0.5;
    out.push({ e, score });
  }
  return out.sort((a, b) => b.score - a.score || a.e.title.localeCompare(b.e.title)).map((x) => x.e);
}
