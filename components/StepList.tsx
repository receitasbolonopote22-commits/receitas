"use client";

import { useState } from "react";
import type { InstructionSection } from "@/lib/types";
import { IconCheck } from "./Icons";

/** Modo de preparo com passos numerados; tocar em um passo marca como feito. */
export default function StepList({ sections }: { sections: InstructionSection[] }) {
  const [done, setDone] = useState<Set<string>>(new Set());
  const offsets = sections.map((_, i) => sections.slice(0, i).reduce((t, x) => t + x.steps.length, 0));
  return (
    <div className="space-y-8">
      {sections.map((s, si) => (
        <div key={si}>
          {s.title && <h3 className="mb-3 font-display text-[1.25rem] font-semibold text-saffron-2">{s.title}</h3>}
          <ol className="space-y-3">
            {s.steps.map((step, i) => {
              const n = offsets[si] + i + 1;
              const k = `${si}-${i}`;
              const on = done.has(k);
              return (
                <li key={k}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => setDone((p) => { const x = new Set(p); if (x.has(k)) x.delete(k); else x.add(k); return x; })}
                    className={`flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition-colors sm:p-5 ${on ? "border-olive/40 bg-olive/[0.07]" : "border-line bg-ink-2 hover:border-cream/25"}`}
                  >
                    <span className={`grid size-10 shrink-0 place-items-center rounded-full font-display text-[1.2rem] font-semibold ${on ? "bg-olive text-ink" : "bg-saffron text-ink"}`}>
                      {on ? <IconCheck size={20} /> : n}
                    </span>
                    <span className={`pt-1 text-[1.15rem] leading-relaxed ${on ? "text-muted" : "text-cream"}`}>{step}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      ))}
      <p className="text-[0.95rem] text-muted">Dica: toque em cada passo para marcar como concluído.</p>
    </div>
  );
}
