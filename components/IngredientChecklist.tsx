"use client";

import { useEffect, useState } from "react";
import type { IngredientSection } from "@/lib/types";
import { IconCheck } from "./Icons";

/** Lista de ingredientes que a pessoa vai marcando enquanto cozinha (fica salva no aparelho). */
export default function IngredientChecklist({ id, sections }: { id: string; sections: IngredientSection[] }) {
  const key = `mp:check:${id}`;
  const [checked, setChecked] = useState<Set<string>>(new Set());
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(key);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restaura o estado salvo após montar
      if (raw) setChecked(new Set(JSON.parse(raw)));
    } catch {}
  }, [key]);
  const total = sections.reduce((n, s) => n + s.items.length, 0);
  const toggle = (k: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      try {
        sessionStorage.setItem(key, JSON.stringify([...next]));
      } catch {}
      return next;
    });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-[0.98rem] text-muted" aria-live="polite">
          {checked.size ? `${checked.size} de ${total} separados` : "Toque para marcar o que já separou"}
        </p>
        {checked.size > 0 && (
          <button type="button" className="min-h-11 rounded-full px-3 font-semibold text-saffron hover:text-saffron-2" onClick={() => { setChecked(new Set()); try { sessionStorage.removeItem(key); } catch {} }}>
            Desmarcar tudo
          </button>
        )}
      </div>
      {sections.map((s, si) => (
        <div key={si} className={si ? "mt-6" : ""}>
          {s.title && <h3 className="mb-2 font-display text-[1.2rem] font-semibold text-saffron-2">{s.title}</h3>}
          <ul className="space-y-1.5">
            {s.items.map((item, ii) => {
              const k = `${si}-${ii}`;
              const on = checked.has(k);
              return (
                <li key={k}>
                  <label className={`flex min-h-12 cursor-pointer items-start gap-3.5 rounded-xl px-3 py-2.5 transition-colors ${on ? "bg-olive/10" : "hover:bg-ink-3/60"}`}>
                    <input type="checkbox" className="peer sr-only" checked={on} onChange={() => toggle(k)} />
                    <span
                      aria-hidden
                      className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg border-2 transition-colors peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-saffron ${on ? "border-olive bg-olive text-ink" : "border-cream/40"}`}
                    >
                      {on && <IconCheck size={18} />}
                    </span>
                    <span className={`text-[1.12rem] leading-snug ${on ? "text-muted line-through decoration-olive/70" : "text-cream"}`}>{item}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
