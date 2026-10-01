#!/usr/bin/env node
/**
 * Gera as versões otimizadas das imagens das receitas.
 *
 *   content/images/<slug>.jpg|png|webp  ->  public/images/recipes/<slug>-sm.webp (480px)
 *                                           public/images/recipes/<slug>-lg.webp (1080px)
 *                                           public/images/recipes/<slug>-og.jpg  (800px, prévia ao compartilhar)
 *
 * Também grava content/_generated/images.json com largura, altura e cor média
 * (usada como fundo enquanto a imagem carrega).
 *
 * É incremental: só processa imagens novas ou alteradas. Roda sozinho antes de
 * `npm run dev` e `npm run build`.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const SRC = path.join(ROOT, "content/images");
const OUT = path.join(ROOT, "public/images/recipes");
const META = path.join(ROOT, "content/_generated/images.json");

fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(path.dirname(META), { recursive: true });

const meta = fs.existsSync(META) ? JSON.parse(fs.readFileSync(META, "utf8")) : {};
const files = fs.existsSync(SRC) ? fs.readdirSync(SRC).filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f)) : [];
const SIZES = { sm: 480, lg: 1080 };

let done = 0;
const queue = [...files];
async function worker() {
  while (queue.length) {
    const f = queue.shift();
    const base = f.replace(/\.[^.]+$/, "");
    const src = path.join(SRC, f);
    const mtime = fs.statSync(src).mtimeMs;
    const og = path.join(OUT, `${base}-og.jpg`);
    const outs = [...Object.keys(SIZES).map((k) => path.join(OUT, `${base}-${k}.webp`)), og];
    if (meta[base]?.mtime === mtime && outs.every((o) => fs.existsSync(o))) continue;
    const img = sharp(src).rotate();
    const { width, height } = await img.metadata();
    for (const [k, w] of Object.entries(SIZES)) {
      await sharp(src).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: k === "sm" ? 72 : 78 }).toFile(path.join(OUT, `${base}-${k}.webp`));
    }
    // JPG para prévias de link (WhatsApp, Facebook): formato com suporte universal
    await sharp(src).rotate().resize({ width: 800, height: 1000, fit: "cover", position: "attention" }).jpeg({ quality: 74, mozjpeg: true }).toFile(og);
    const { dominant } = await sharp(src).stats();
    const hex = "#" + [dominant.r, dominant.g, dominant.b].map((v) => v.toString(16).padStart(2, "0")).join("");
    meta[base] = { w: width, h: height, color: hex, mtime };
    done++;
  }
}
await Promise.all(Array.from({ length: 4 }, worker));

// remove metadados de imagens apagadas
for (const k of Object.keys(meta)) if (!files.some((f) => f.replace(/\.[^.]+$/, "") === k)) delete meta[k];
fs.writeFileSync(META, JSON.stringify(meta, null, 1) + "\n");
console.log(`Imagens: ${files.length} no total, ${done} processadas agora.`);
