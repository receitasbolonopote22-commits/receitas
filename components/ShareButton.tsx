"use client";

import { useState } from "react";
import { IconCheck, IconShare } from "./Icons";

export default function ShareButton({ title, text, path }: { title: string; text: string; path: string }) {
  const [state, setState] = useState<"idle" | "menu" | "copied">("idle");
  const url = () => (typeof window !== "undefined" ? new URL(path, window.location.origin).toString() : path);

  const share = async () => {
    const data = { title, text, url: url() };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
      }
    }
    setState((s) => (s === "menu" ? "idle" : "menu"));
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url());
      setState("copied");
      setTimeout(() => setState("idle"), 2200);
    } catch {
      setState("idle");
    }
  };

  return (
    <div className="relative flex-1 sm:flex-none">
      <button type="button" onClick={share} className="btn btn-ghost w-full" aria-expanded={state === "menu"}>
        {state === "copied" ? <IconCheck size={22} /> : <IconShare size={22} />}
        {state === "copied" ? "Link copiado!" : "Compartilhar"}
      </button>
      {state === "menu" && (
        <div className="absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-2xl border border-line bg-ink-2 shadow-2xl animate-fade">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${title}\n${url()}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setState("idle")}
            className="block px-5 py-4 text-[1.02rem] font-semibold hover:bg-ink-3"
          >
            Enviar pelo WhatsApp
          </a>
          <button type="button" onClick={copy} className="block w-full border-t border-line px-5 py-4 text-left text-[1.02rem] font-semibold hover:bg-ink-3">
            Copiar link
          </button>
        </div>
      )}
    </div>
  );
}
