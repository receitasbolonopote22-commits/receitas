import type { RecipeVideo } from "./types";

/**
 * Provedores de vídeo. Para adicionar um novo, crie uma entrada aqui com
 * `embed` (URL do player após o clique) e, se possível, `thumbnail`.
 * O resto da aplicação não precisa mudar.
 */
type Provider = {
  embed: (url: string) => { kind: "iframe" | "video"; src: string } | null;
  thumbnail?: (url: string) => string | null;
};

const youtubeId = (url: string) => {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([\w-]{11})/);
  return m ? m[1] : null;
};
const vimeoId = (url: string) => url.match(/vimeo\.com\/(?:video\/)?(\d+)/)?.[1] ?? null;

export const PROVIDERS: Record<RecipeVideo["provider"], Provider> = {
  youtube: {
    embed: (url) => {
      const id = youtubeId(url);
      return id ? { kind: "iframe", src: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1` } : null;
    },
    thumbnail: (url) => {
      const id = youtubeId(url);
      return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
    },
  },
  vimeo: {
    embed: (url) => {
      const id = vimeoId(url);
      return id ? { kind: "iframe", src: `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1` } : null;
    },
  },
  // Bunny Stream: use a URL de "embed" do painel (iframe.mediadelivery.net/embed/...)
  bunny: {
    embed: (url) => ({ kind: "iframe", src: url + (url.includes("?") ? "&" : "?") + "autoplay=true&preload=true" }),
  },
  // Arquivo de vídeo hospedado externamente (ex.: armazenamento próprio/CDN). Não coloque MP4 dentro do projeto.
  mp4: { embed: (url) => ({ kind: "video", src: url }) },
};

export function videoThumbnail(v: RecipeVideo) {
  return v.thumbnail ?? PROVIDERS[v.provider]?.thumbnail?.(v.url) ?? null;
}
