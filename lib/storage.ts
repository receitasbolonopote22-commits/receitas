"use client";

/**
 * Favoritos e "Continue explorando" ficam no próprio aparelho (localStorage).
 * Guardamos apenas os IDs das receitas — nada pessoal.
 *
 * Quando houver login/contas, basta trocar a implementação deste arquivo para
 * sincronizar com o servidor; os componentes continuam usando os mesmos hooks.
 */
import { useCallback, useSyncExternalStore } from "react";

const KEYS = { favorites: "mp:favoritos:v1", recent: "mp:recentes:v1" } as const;
type Key = keyof typeof KEYS;
const MAX_RECENT = 24;

const listeners = new Set<() => void>();
const cache: Partial<Record<Key, { raw: string | null; value: string[] }>> = {};
const EMPTY: string[] = [];

function read(key: Key): string[] {
  if (typeof window === "undefined") return EMPTY;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEYS[key]);
  } catch {
    return EMPTY;
  }
  const c = cache[key];
  if (c && c.raw === raw) return c.value;
  let value: string[] = EMPTY;
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    value = Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : EMPTY;
  } catch {
    value = EMPTY;
  }
  cache[key] = { raw, value };
  return value;
}

function write(key: Key, value: string[]) {
  try {
    window.localStorage.setItem(KEYS[key], JSON.stringify(value));
  } catch {
    /* modo privado ou armazenamento cheio: ignora */
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (!e.key || Object.values(KEYS).includes(e.key as (typeof KEYS)[Key])) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

function useList(key: Key) {
  return useSyncExternalStore(
    subscribe,
    () => read(key),
    () => EMPTY,
  );
}

export function useFavorites() {
  const ids = useList("favorites");
  const toggle = useCallback((id: string) => {
    const cur = read("favorites");
    write("favorites", cur.includes(id) ? cur.filter((x) => x !== id) : [id, ...cur]);
  }, []);
  const has = useCallback((id: string) => ids.includes(id), [ids]);
  return { ids, toggle, has };
}

export function useRecent() {
  return useList("recent");
}

export function addRecent(id: string) {
  const cur = read("recent").filter((x) => x !== id);
  write("recent", [id, ...cur].slice(0, MAX_RECENT));
}

/** Retorna true depois que o componente montou no navegador (evita divergência de hidratação). */
export function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
