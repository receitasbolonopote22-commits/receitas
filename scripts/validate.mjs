#!/usr/bin/env node
/**
 * Valida o conteúdo e gera relatórios em content/_reports/:
 *   - inventario.md   quantidades, campos ausentes, por documento e categoria
 *   - duplicatas.md   possíveis duplicatas (nada é apagado automaticamente)
 *   - revisao.md      receitas sinalizadas para revisão editorial
 *
 * Sai com erro (e interrompe o build) se encontrar problemas estruturais:
 * slug repetido, coleção/categoria inexistente, imagem faltando, campos obrigatórios.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const C = (p) => path.join(ROOT, "content", p);
const read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));

const categories = read(C("categories.json"));
const collections = fs.readdirSync(C("collections")).filter((f) => f.endsWith(".json")).map((f) => read(C(`collections/${f}`)));
const recipes = [];
for (const dir of fs.readdirSync(C("recipes"))) {
  const d = C(`recipes/${dir}`);
  if (!fs.statSync(d).isDirectory()) continue;
  for (const f of fs.readdirSync(d).filter((x) => x.endsWith(".json"))) recipes.push({ ...read(path.join(d, f)), __file: `recipes/${dir}/${f}` });
}

const errors = [];
const warn = [];
const catSet = new Set(categories.map((c) => c.slug));
const colSet = new Set(collections.map((c) => c.slug));
const ids = new Map(), slugs = new Map();
for (const r of recipes) {
  const where = r.__file;
  if (!r.id || !r.slug || !r.title) errors.push(`${where}: id, slug e title são obrigatórios.`);
  if (ids.has(r.id)) errors.push(`${where}: id repetido (${r.id}) também em ${ids.get(r.id)}.`);
  if (slugs.has(r.slug)) errors.push(`${where}: slug repetido (${r.slug}) também em ${slugs.get(r.slug)}.`);
  ids.set(r.id, where); slugs.set(r.slug, where);
  if (!/^[a-z0-9-]+$/.test(r.slug)) errors.push(`${where}: slug inválido "${r.slug}" (use letras minúsculas, números e hífen).`);
  if (path.basename(where, ".json") !== r.slug) warn.push(`${where}: nome do arquivo diferente do slug (${r.slug}).`);
  for (const c of r.collections || []) if (!colSet.has(c)) errors.push(`${where}: coleção inexistente "${c}".`);
  for (const c of r.categories || []) if (!catSet.has(c)) errors.push(`${where}: categoria inexistente "${c}".`);
  if (!Array.isArray(r.ingredients) || !Array.isArray(r.instructions)) errors.push(`${where}: ingredients e instructions devem ser listas.`);
  if (r.image && !fs.existsSync(C(`images/${r.image.file}`))) errors.push(`${where}: imagem não encontrada em content/images/${r.image.file}.`);
  if (r.video) {
    if (!r.video.url || !r.video.provider) errors.push(`${where}: vídeo precisa de url e provider.`);
    if (!["vertical", "horizontal"].includes(r.video.orientation)) errors.push(`${where}: video.orientation deve ser "vertical" ou "horizontal".`);
  }
  if (r.duplicateOf && !recipes.some((x) => x.slug === r.duplicateOf)) errors.push(`${where}: duplicateOf "${r.duplicateOf}" não existe.`);
  for (const s of r.relatedRecipes || []) if (!recipes.some((x) => x.slug === s)) warn.push(`${where}: receita relacionada "${s}" não existe.`);
}
for (const c of collections) if (c.coverRecipe && !slugs.has(c.coverRecipe)) errors.push(`collections/${c.slug}.json: coverRecipe "${c.coverRecipe}" não existe.`);

// ---------- duplicatas
const norm = (s) => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const STOP = new Set("de da do das dos e com a o as os em para por ao na no um uma ou sem gosto colher colheres sopa cha xicara xicaras xic colh g ml".split(" "));
const tokens = (s) => new Set(norm(s).replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w) && !/^\d+$/.test(w)));
const jac = (a, b) => { if (!a.size || !b.size) return 0; let i = 0; for (const x of a) if (b.has(x)) i++; return i / (a.size + b.size - i); };
const sig = recipes.map((r) => ({
  r,
  t: tokens(r.title),
  i: tokens(r.ingredients.flatMap((s) => s.items).join(" ")),
  s: tokens(r.instructions.flatMap((s) => s.steps).join(" ")),
}));
const dups = { identical: [], probable: [], sameName: [] };
for (let a = 0; a < sig.length; a++) for (let b = a + 1; b < sig.length; b++) {
  const A = sig[a], B = sig[b];
  const t = jac(A.t, B.t);
  if (t < 0.34) continue;
  const i = jac(A.i, B.i), s = jac(A.s, B.s);
  const pair = { a: A.r, b: B.r, t, i, s };
  if (i >= 0.9 && s >= 0.85) dups.identical.push(pair);
  else if ((i >= 0.6 && s >= 0.5) || (t >= 0.8 && i >= 0.6)) dups.probable.push(pair);
  else if (norm(A.r.title) === norm(B.r.title)) dups.sameName.push(pair);
}
const ref = (r) => `**${r.title}** (\`${r.slug}\`, ${r.source.document}${r.source.page ? `, p. ${r.source.page}` : ""})`;
const pct = (x) => `${Math.round(x * 100)}%`;
let md = `# Possíveis duplicatas\n\nGerado automaticamente por \`npm run validate\`. Nenhuma receita é apagada automaticamente.\nSimilaridade calculada sobre nome, ingredientes e modo de preparo.\n\n`;
md += `## Praticamente idênticas (${dups.identical.length})\nMesmos ingredientes e mesmo preparo. Candidatas a manter só uma versão.\n\n`;
for (const p of dups.identical) md += `- ${ref(p.a)}\n  ↔ ${ref(p.b)} — nome ${pct(p.t)}, ingredientes ${pct(p.i)}, preparo ${pct(p.s)}\n`;
md += `\n## Prováveis duplicatas (${dups.probable.length})\nMuito parecidas, mas com diferenças. Revisar antes de decidir.\n\n`;
for (const p of dups.probable) md += `- ${ref(p.a)}\n  ↔ ${ref(p.b)} — nome ${pct(p.t)}, ingredientes ${pct(p.i)}, preparo ${pct(p.s)}\n`;
md += `\n## Mesmo nome, receitas diferentes (${dups.sameName.length})\nMantidas como versões distintas.\n\n`;
for (const p of dups.sameName) md += `- ${ref(p.a)}\n  ↔ ${ref(p.b)} — ingredientes ${pct(p.i)}, preparo ${pct(p.s)}\n`;

// ---------- revisão
const flagged = recipes.filter((r) => r.review?.flags?.length);
const claims = recipes.filter((r) => r.review?.healthClaims?.length);
let rv = `# Revisão editorial\n\nGerado por \`npm run validate\`.\n\n## Receitas sinalizadas (${flagged.length})\n\n`;
for (const r of flagged) rv += `### ${r.title}\n\`${r.__file}\` — ${r.source.document}${r.source.page ? `, p. ${r.source.page}` : ""}\n\n${r.review.flags.map((f) => `- ${f}`).join("\n")}\n\n`;
rv += `## Alegações de saúde do material original (${claims.length})\nGuardadas em \`review.healthClaims\` e NÃO exibidas no site. As descrições exibidas foram neutralizadas.\n\n`;
for (const r of claims) rv += `- **${r.title}** (\`${r.slug}\`): ${r.review.healthClaims.join(" ")}\n`;

// ---------- inventário
const by = (fn) => recipes.reduce((m, r) => { for (const k of [].concat(fn(r))) m[k] = (m[k] || 0) + 1; return m; }, {});
const missing = (fn) => recipes.filter(fn).length;
let inv = `# Inventário do conteúdo\n\nGerado por \`npm run validate\`.\n\n**Total de receitas cadastradas: ${recipes.length}**\n\n`;
inv += `## Por documento de origem\n\n| Documento | Receitas |\n|---|---|\n${Object.entries(by((r) => r.source.document)).map(([k, v]) => `| ${k} | ${v} |`).join("\n")}\n\n`;
inv += `## Por coleção\n\n| Coleção | Receitas |\n|---|---|\n${Object.entries(by((r) => r.collections)).map(([k, v]) => `| ${k} | ${v} |`).join("\n")}\n\n`;
inv += `## Por categoria\n\n| Categoria | Receitas |\n|---|---|\n${categories.map((c) => `| ${c.name} | ${by((r) => r.categories)[c.slug] || 0} |`).join("\n")}\n\n`;
inv += `## Campos ausentes no material de origem (ficam como null)\n\n| Campo | Receitas sem o dado |\n|---|---|\n`;
inv += [
  ["Descrição", (r) => !r.description],
  ["Tempo de preparo", (r) => r.prepTime == null && r.totalTime == null],
  ["Rendimento", (r) => !r.servings],
  ["Informação nutricional", (r) => !r.nutrition],
  ["Calorias", (r) => r.nutrition?.calories == null],
  ["Carboidratos", (r) => r.nutrition?.carbs == null],
  ["Foto", (r) => !r.image],
  ["Vídeo", (r) => !r.video],
].map(([n, f]) => `| ${n} | ${missing(f)} |`).join("\n");
inv += `\n\n## Revisão\n\n- Receitas sinalizadas para revisão: ${flagged.length}\n- Receitas com alegações de saúde guardadas: ${claims.length}\n- Duplicatas praticamente idênticas: ${dups.identical.length} pares\n- Prováveis duplicatas: ${dups.probable.length} pares\n- Mesmo nome, receitas diferentes: ${dups.sameName.length} pares\n`;

fs.mkdirSync(C("_reports"), { recursive: true });
fs.writeFileSync(C("_reports/duplicatas.md"), md);
fs.writeFileSync(C("_reports/revisao.md"), rv);
fs.writeFileSync(C("_reports/inventario.md"), inv);

for (const w of warn) console.warn("aviso:", w);
console.log(`Conteúdo: ${recipes.length} receitas, ${collections.length} coleções, ${categories.length} categorias.`);
console.log(`Duplicatas: ${dups.identical.length} idênticas, ${dups.probable.length} prováveis, ${dups.sameName.length} mesmo nome. Revisão: ${flagged.length} sinalizadas.`);
if (errors.length) {
  console.error(`\n${errors.length} erro(s) no conteúdo:`);
  for (const e of errors) console.error(" -", e);
  process.exit(1);
}
