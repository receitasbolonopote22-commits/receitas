#!/usr/bin/env node
/**
 * Importador: converte arquivos .dsl (transcrição revisada dos PDFs) em JSON de receitas.
 *
 * Uso:
 *   node scripts/import/import-dsl.mjs                  -> importa todos os .dsl de content/_import/dsl
 *   node scripts/import/import-dsl.mjs arquivo.dsl ...  -> importa só os arquivos indicados
 *
 * Receitas já existentes (mesmo id) são atualizadas, preservando campos editados
 * à mão: video, featured, relatedRecipes, image (quando origin = "manual").
 *
 * Formato .dsl: veja content/_import/FORMATO-DSL.md
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { categorize, extraCollections, tags as makeTags, sugarFlags, norm } from "./rules.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const IMPORT = path.join(ROOT, "content/_import");
const RECIPES = path.join(ROOT, "content/recipes");
const IMAGES = path.join(ROOT, "content/images");
const RAW = path.join(IMPORT, "images-raw");

const sources = JSON.parse(fs.readFileSync(path.join(IMPORT, "sources.json"), "utf8")).documents;
const docByFile = Object.fromEntries(sources.map((d) => [d.file, d]));

// ---------- helpers
export const slugify = (s) =>
  norm(s).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

const LOWER = new Set(["de", "da", "do", "das", "dos", "e", "com", "ao", "a", "o", "as", "os", "na", "no", "em", "para", "sem", "à", "ou"]);
function titleCase(s) {
  const words = s.toLowerCase().split(/(\s+|-|\/)/);
  let first = true;
  return words
    .map((w) => {
      if (!w.trim() || w === "-" || w === "/") return w;
      const keepLower = !first && LOWER.has(w);
      first = false;
      if (keepLower) return w;
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join("")
    .replace(/\bDiet\b/g, "Diet")
    .replace(/\(([a-zà-ú])/g, (m, c) => "(" + c.toUpperCase());
}

const num = (s) => (s == null ? null : Number(String(s).replace(/\./g, "").replace(",", ".")));

function minutesFrom(text) {
  const t = norm(text);
  let m;
  if ((m = t.match(/(\d+[.,]?\d*)\s*h(ora)?s?\b/))) {
    const h = num(m[1]);
    const extra = t.match(/h(?:oras?)?\s*e?\s*(\d+)\s*min/);
    return Math.round(h * 60 + (extra ? Number(extra[1]) : 0));
  }
  if ((m = t.match(/(\d+)\s*(min|minutos)/))) return Number(m[1]);
  return null;
}

const SENT = /(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ])/;
const splitSentences = (p) => p.split(SENT).map((s) => s.trim()).filter(Boolean);

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const clean = (s) => s.replace(/\s+/g, " ").replace(/\s+([,.;:!?])/g, "$1").trim();
const cleanItem = (s) => cap(clean(s).replace(/[;:.]+$/, "").replace(/\.$/, ""));
const cleanStep = (s) => {
  let t = cap(clean(s));
  if (!/[.!?)]$/.test(t)) t += ".";
  return t;
};

// ---------- parse
function parseDsl(text) {
  const docs = [];
  let doc = null;
  let rec = null;
  const flush = () => {
    if (rec) doc.recipes.push(rec);
    rec = null;
  };
  for (const raw of text.split("\n")) {
    const line = raw.replace(/\s+$/, "");
    if (!line.trim()) continue;
    if (line.startsWith("@doc ")) {
      if (doc) { flush(); docs.push(doc); }
      doc = { file: line.slice(5).trim(), recipes: [] };
      continue;
    }
    const m = line.match(/^=== ([pn])(\d+)([a-z]?)$/);
    if (m) {
      flush();
      rec = { key: `${m[1]}${m[2]}${m[3]}`, page: m[1] === "p" ? Number(m[2]) : null, kind: m[1], num: Number(m[2]),
        meta: [], ing: [{ title: null, items: [] }], steps: [{ title: null, steps: [] }], notes: [], flags: [], health: [], paras: [] };
      continue;
    }
    if (!rec) continue;
    let mm;
    if (line.startsWith("-# ")) rec.ing.push({ title: cleanItem(line.slice(3)), items: [] });
    else if (line.startsWith("- ")) rec.ing[rec.ing.length - 1].items.push(line.slice(2));
    else if (line.startsWith("# ")) rec.steps.push({ title: cap(clean(line.slice(2))), steps: [] });
    else if ((mm = line.match(/^\d+\.\s+(.*)$/))) rec.steps[rec.steps.length - 1].steps.push(mm[1]);
    else if ((mm = line.match(/^([a-zA-Z]+):\s?(.*)$/))) {
      const [, k, v] = mm;
      if (k === "meta") rec.meta.push(v);
      else if (k === "note") rec.notes.push(v);
      else if (k === "flag") rec.flags.push(v);
      else if (k === "health") rec.health.push(v);
      else if (k === "para") rec.steps[rec.steps.length - 1].steps.push(...splitSentences(v).map((s) => ({ para: s })));
      else if (k === "page") rec.page = Number(v);
      else rec[k] = v;
    }
  }
  if (doc) { flush(); docs.push(doc); }
  return docs;
}

// ---------- meta → campos
function applyMeta(r, out, docCfg) {
  for (const raw of r.meta) {
    const u = norm(raw);
    let m;
    if (/tempo medio de preparo|tempo de preparo/.test(u)) {
      out.prepTime = minutesFrom(raw.split(/POR[ÇC][ÕO]ES:|RECOMENDAMOS|PORÇÕES/i)[0]);
      const rest = raw.match(/POR[ÇC][ÕO]ES:\s*(.+)$/i);
      if (rest) out.servings = rest[1].toLowerCase();
      if (/consumo moderado/.test(u)) out.notes.push({ label: null, text: "Recomendamos o consumo moderado." });
    } else if ((m = raw.match(/^RENDIMENTO:\s*(.+)$/i))) {
      let v = m[1];
      if (/consumo moderado/i.test(v)) { out.notes.push({ label: null, text: "Consumo moderado." }); v = v.replace(/\s*consumo moderado/i, ""); }
      out.servings = docCfg.titleCase ? cap(v.toLowerCase()) : v;
    } else if ((m = raw.match(/^PORÇÃO\s+(.+)$/i))) {
      out.servingSize = m[1].toLowerCase().replace(/(\d)g\b/, "$1 g");
    } else if ((m = raw.match(/^CALORIAS POR PORÇÃO(?: DE ([\dG]+))?:\s*([\d.,]+)\s*KCAL/i))) {
      out.nutrition ||= emptyNutrition();
      out.nutrition.calories = num(m[2]);
      out.nutrition.basis = m[1] ? `por porção de ${m[1].toLowerCase().replace(/g$/, " g")}` : "por porção";
    } else if (/consumir (com )?moderad/.test(u)) {
      out.notes.push({ label: null, text: "Consumir com moderação." });
    } else if ((m = raw.match(/^Rendimento:\s*(.+)$/))) {
      out.servings = m[1].trim();
    } else if ((m = raw.match(/^Informação Nutricional:\s*(.+)$/))) {
      out.nutrition ||= emptyNutrition();
      const b = m[1].trim();
      out.nutrition.basis = /^por /.test(b) ? b : `por ${b.replace(/(\d)g$/, "$1 g")}`;
    } else if (/^Calorias:/.test(raw)) {
      out.nutrition ||= emptyNutrition();
      const g = (re) => { const x = raw.match(re); return x ? num(x[1]) : null; };
      out.nutrition.calories = g(/Calorias:\s*([\d.,]+)/);
      out.nutrition.fat = g(/Gord:\s*([\d.,]+)/);
      out.nutrition.carbs = g(/Carbs:\s*([\d.,]+)/);
      out.nutrition.protein = g(/Prot:\s*([\d.,]+)/);
      out.nutrition.approximate = true;
      out.nutrition.raw.push("Médias de cálculo informadas pelo material original.");
    } else {
      out.notes.push({ label: null, text: cap(raw.toLowerCase()) });
    }
  }
}
const emptyNutrition = () => ({ calories: null, carbs: null, protein: null, fat: null, fiber: null, basis: null, approximate: false, raw: [] });

// ---------- build
function build(r, docCfg) {
  const rawTitle = r.title || "";
  const letters = rawTitle.replace(/[^A-Za-zÀ-ú]/g, "");
  const upperRatio = letters ? letters.replace(/[^A-ZÀ-Ý]/g, "").length / letters.length : 0;
  const title = docCfg.titleCase && upperRatio > 0.6 ? titleCase(rawTitle) : rawTitle.trim();
  const out = {
    id: `${docCfg.key.toLowerCase()}-${r.key}`,
    slug: null,
    title,
    description: r.desc ? clean(r.desc) : null,
    collections: [...docCfg.collections],
    categories: [],
    tags: [],
    ingredients: [],
    instructions: [],
    prepTime: null, cookTime: null, totalTime: null,
    servings: r.yield ? r.yield.trim() : null,
    servingSize: r.portion ? r.portion.trim() : null,
    nutrition: null,
    notes: [],
    image: null,
    video: null,
    featured: false,
    source: { document: docCfg.file, page: r.page ?? (docCfg.key === "E2" ? 1 : null), originalTitle: r.origTitle ? r.origTitle.trim() : (title !== rawTitle.trim() ? rawTitle.trim() : null) },
    review: { status: "ok", flags: [...r.flags], healthClaims: [...r.health] },
    relatedRecipes: [],
  };
  if (r.sweet) out.notes.push({ label: "Observação sobre adoçante", text: cleanStep(r.sweet) });
  if (r.alert) out.notes.push({ label: "Consumo moderado", text: cleanStep(r.alert) });
  if (r.carbs) {
    out.nutrition = emptyNutrition();
    const m = r.carbs.match(/^(\d+(?:[.,]\d+)?)\s*g\s*(.*)$/);
    if (m) { out.nutrition.carbs = num(m[1]); out.nutrition.basis = m[2].trim() || null; }
    else out.nutrition.raw.push(`Carboidratos aproximados: ${r.carbs}`);
    out.nutrition.approximate = true;
  }
  applyMeta(r, out, docCfg);

  // ingredientes
  out.ingredients = r.ing
    .map((s) => ({ title: s.title, items: s.items.map(cleanItem).filter(Boolean) }))
    .filter((s) => s.items.length || s.title);
  // passos: parágrafos viram frases; dicas viram notas
  for (const sec of r.steps) {
    const steps = [];
    for (const s of sec.steps) {
      if (typeof s === "object") {
        if (/^(dica|sugestão|obs)/i.test(s.para)) { out.notes.push({ label: null, text: cleanStep(s.para) }); continue; }
        steps.push(cleanStep(s.para));
      } else {
        const sentences = splitSentences(s);
        if (s.length > 220 && sentences.length >= 3) steps.push(...sentences.map(cleanStep));
        else steps.push(cleanStep(s));
      }
    }
    if (steps.length || sec.title) out.instructions.push({ title: sec.title, steps });
  }
  out.instructions = out.instructions.filter((s) => s.steps.length);
  for (const n of r.notes) out.notes.push({ label: null, text: cleanStep(n) });

  // organização
  const ingText = out.ingredients.flatMap((s) => s.items).join(" | ");
  out.collections = [...new Set([...out.collections, ...extraCollections({ title })])];
  out.categories = r.mapcat
    ? r.mapcat.split(",").map((s) => s.trim())
    : categorize({ docKey: docCfg.key, cat: r.cat || "", title, docCategories: docCfg.categories });
  out.tags = makeTags({ title, docKey: docCfg.key, collections: out.collections });

  // sinalizações automáticas
  out.review.flags.push(...sugarFlags({ ingredientsText: ingText, collections: out.collections }));
  if (!out.ingredients.length) out.review.flags.push("Receita sem lista de ingredientes.");
  if (!out.instructions.length) out.review.flags.push("Receita sem modo de preparo.");
  if (out.nutrition?.calories && out.nutrition.calories > 800) {
    const msg = `Valor calórico informado (${out.nutrition.calories} kcal) parece alto; conferir no material original.`;
    if (!out.review.flags.some((f) => /calóric/.test(f))) out.review.flags.push(msg);
  }
  if (out.review.flags.length) out.review.status = "needs-review";
  return out;
}

// ---------- imagens
async function attachImage(rec, docCfg, r) {
  const key = r.kind === "n" ? `${docCfg.imageKey}-n${r.num}` : `${docCfg.imageKey}-p${r.num}${r.key.endsWith("b") ? "b" : ""}`;
  const src = path.join(RAW, `${key}.jpg`);
  if (!fs.existsSync(src)) return;
  const file = `${rec.slug}.jpg`;
  const dest = path.join(IMAGES, file);
  if (!fs.existsSync(dest)) {
    await sharp(src).resize({ width: 1200, height: 1600, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 84, mozjpeg: true }).toFile(dest);
  }
  rec.image = { file, alt: `Foto de ${rec.title}`, origin: "pdf" };
}

// ---------- main
async function main() {
  const args = process.argv.slice(2);
  const files = args.length ? args : fs.readdirSync(path.join(IMPORT, "dsl")).filter((f) => f.endsWith(".dsl")).sort().map((f) => path.join(IMPORT, "dsl", f));
  fs.mkdirSync(IMAGES, { recursive: true });

  // existentes (para preservar edições manuais e evitar slugs repetidos)
  const existing = new Map();
  const usedSlugs = new Map();
  for (const dir of fs.existsSync(RECIPES) ? fs.readdirSync(RECIPES) : []) {
    for (const f of fs.readdirSync(path.join(RECIPES, dir)).filter((x) => x.endsWith(".json"))) {
      const j = JSON.parse(fs.readFileSync(path.join(RECIPES, dir, f), "utf8"));
      existing.set(j.id, { json: j, path: path.join(RECIPES, dir, f) });
      usedSlugs.set(j.slug, j.id);
    }
  }

  const parsed = files.flatMap((f) => parseDsl(fs.readFileSync(f, "utf8")));
  // ordena pelos documentos de sources.json (estabilidade dos slugs)
  const order = sources.map((d) => d.file);
  parsed.sort((a, b) => order.indexOf(a.file) - order.indexOf(b.file));

  let created = 0, updated = 0;
  for (const doc of parsed) {
    const cfg = docByFile[doc.file];
    if (!cfg) throw new Error(`Documento sem configuração em sources.json: ${doc.file}`);
    doc.recipes.sort((a, b) => a.num - b.num || a.key.localeCompare(b.key));
    for (const r of doc.recipes) {
      const rec = build(r, cfg);
      const prev = existing.get(rec.id)?.json;
      if (prev) {
        rec.slug = prev.slug;
        rec.video = prev.video;
        rec.featured = prev.featured;
        rec.relatedRecipes = prev.relatedRecipes;
        if (prev.duplicateOf) rec.duplicateOf = prev.duplicateOf;
        rec.collections = [...new Set([...rec.collections, ...prev.collections])];
        if (prev.image?.origin === "manual") rec.image = prev.image;
      } else {
        let base = slugify(rec.title) || rec.id;
        let s = base, i = 2;
        while (usedSlugs.has(s) && usedSlugs.get(s) !== rec.id) s = `${base}-${i++}`;
        rec.slug = s;
      }
      usedSlugs.set(rec.slug, rec.id);
      if (!rec.image) await attachImage(rec, cfg, r);
      const dir = path.join(RECIPES, rec.collections[0]);
      fs.mkdirSync(dir, { recursive: true });
      const dest = path.join(dir, `${rec.slug}.json`);
      if (prev && existing.get(rec.id).path !== dest) fs.rmSync(existing.get(rec.id).path);
      fs.writeFileSync(dest, JSON.stringify(rec, null, 2) + "\n");
      if (prev) updated++;
      else created++;
    }
  }
  console.log(`Importação concluída: ${created} novas, ${updated} atualizadas.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
