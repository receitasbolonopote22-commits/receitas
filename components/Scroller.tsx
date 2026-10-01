"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { IconArrowLeft, IconArrowRight } from "./Icons";

/**
 * Trilho horizontal. No celular: deslizar com o dedo (scroll nativo com snap).
 * No computador: aparecem setas grandes nas laterais ao passar o mouse.
 */
export default function Scroller({ children, label, cardWidth }: { children: ReactNode; label: string; cardWidth?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () =>
      setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const go = (dir: 1 | -1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  const arrow =
    "absolute top-1/2 z-10 hidden -translate-y-1/2 place-items-center size-12 rounded-full bg-ink/85 text-cream ring-1 ring-line backdrop-blur transition-opacity hover:bg-saffron hover:text-ink [@media(hover:hover)]:md:grid opacity-0 group-hover/row:opacity-100 disabled:!opacity-0";

  return (
    <div className="group/row relative">
      <div
        ref={ref}
        className="row-scroller"
        style={cardWidth ? ({ "--card-w": cardWidth } as React.CSSProperties) : undefined}
        role="list"
        aria-label={label}
      >
        {children}
      </div>
      <button type="button" aria-label="Anterior" className={`${arrow} left-3`} onClick={() => go(-1)} disabled={edges.start}>
        <IconArrowLeft />
      </button>
      <button type="button" aria-label="Próximas" className={`${arrow} right-3`} onClick={() => go(1)} disabled={edges.end}>
        <IconArrowRight />
      </button>
    </div>
  );
}
