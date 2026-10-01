import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // As imagens das receitas já são pré-otimizadas em WebP por `scripts/images.mjs`
    // (480px e 1080px). O loader abaixo só escolhe a versão certa — assim não há
    // custo de otimização de imagens na Vercel.
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
    deviceSizes: [480, 1080],
    imageSizes: [240],
  },
  poweredByHeader: false,
};

export default nextConfig;
