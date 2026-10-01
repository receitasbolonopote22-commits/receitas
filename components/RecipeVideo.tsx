"use client";

import Image from "next/image";
import { useState } from "react";
import type { CardImage, RecipeVideo as Video } from "@/lib/types";
import { PROVIDERS, videoThumbnail } from "@/lib/video";
import { IconPlay } from "./Icons";

/**
 * Vídeo da receita. Mostra só a capa com o botão "play"; o player do provedor
 * é carregado apenas quando a pessoa toca para assistir.
 * Vertical (9:16): largura limitada e centralizado no computador.
 */
export default function RecipeVideo({ video, title, fallback }: { video: Video; title: string; fallback: CardImage | null }) {
  const [playing, setPlaying] = useState(false);
  const vertical = video.orientation === "vertical";
  const thumb = videoThumbnail(video) ?? fallback?.lg ?? null;
  const embed = playing ? PROVIDERS[video.provider]?.embed(video.url) : null;

  return (
    <div className={`relative mx-auto overflow-hidden rounded-3xl bg-ink-3 ring-1 ring-line ${vertical ? "aspect-[9/16] w-full max-w-[min(100%,24rem)]" : "aspect-video w-full"}`}>
      {embed?.kind === "iframe" && (
        <iframe
          src={embed.src}
          title={`Vídeo: ${title}`}
          className="absolute inset-0 size-full"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      )}
      {embed?.kind === "video" && <video src={embed.src} className="absolute inset-0 size-full bg-black object-contain" controls autoPlay playsInline />}
      {!embed && (
        <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0 grid place-items-center" aria-label={`Assistir ao preparo de ${title}`}>
          {thumb && <Image src={thumb} alt="" fill sizes="(max-width: 768px) 100vw, 720px" className="object-cover opacity-80 transition-opacity group-hover:opacity-100" unoptimized={!thumb.startsWith("/")} />}
          <span className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" />
          <span className="relative flex flex-col items-center gap-3">
            <span className="grid size-20 place-items-center rounded-full bg-saffron text-ink shadow-xl transition-transform group-hover:scale-110">
              <IconPlay size={34} />
            </span>
            <span className="rounded-full bg-black/50 px-4 py-1.5 text-[1.02rem] font-bold">Assistir ao preparo</span>
          </span>
        </button>
      )}
    </div>
  );
}
