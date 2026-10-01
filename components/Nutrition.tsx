import type { Nutrition as N } from "@/lib/types";

const fmt = (v: number) => v.toLocaleString("pt-BR", { maximumFractionDigits: 2 });

/** Informações nutricionais — exibidas somente com os valores presentes no material de origem. */
export default function Nutrition({ n }: { n: N }) {
  const rows = [
    ["Calorias", n.calories, "kcal"],
    ["Carboidratos", n.carbs, "g"],
    ["Proteínas", n.protein, "g"],
    ["Gorduras", n.fat, "g"],
    ["Fibras", n.fiber, "g"],
  ].filter(([, v]) => v != null) as [string, number, string][];
  const raws = n.raw.filter((x) => !/médias de cálculo/i.test(x));
  if (!rows.length && !raws.length) return null;
  return (
    <section aria-labelledby="nutricao" className="mt-12">
      <h2 id="nutricao" className="font-display text-[1.6rem] font-semibold">Informações nutricionais</h2>
      {n.basis && <p className="mt-1 text-[1rem] text-muted">Valores {n.basis}{n.approximate ? ", aproximados" : ""}.</p>}
      {rows.length > 0 && (
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {rows.map(([label, v, unit]) => (
            <div key={label} className="rounded-2xl border border-line bg-ink-2 px-4 py-3">
              <dt className="text-[0.9rem] font-semibold text-muted">{label}</dt>
              <dd className="font-display text-[1.6rem] font-semibold leading-tight">
                {n.approximate && rows.length === 1 ? "≈ " : ""}
                {fmt(v)} <span className="font-sans text-[1rem] font-semibold text-cream-2">{unit}</span>
              </dd>
            </div>
          ))}
        </dl>
      )}
      {raws.map((t) => <p key={t} className="mt-3 text-[1.05rem] text-cream-2">{t}</p>)}
      <p className="mt-3 text-[0.92rem] text-muted">Valores informados pelo material original. Podem variar conforme marcas e quantidades usadas.</p>
    </section>
  );
}
