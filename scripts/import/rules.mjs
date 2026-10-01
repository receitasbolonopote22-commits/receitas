// Regras de organização usadas pelo importador.
// Elas só ORGANIZAM (categorias, coleções extras, tags). Nunca alteram o conteúdo da receita.

export const norm = (s) =>
  (s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();


/** Categorias a partir do selo da fonte + palavras do título. */
export function categorize({ docKey, cat, title, docCategories }) {
  const t = norm(title).replace(/batata[- ]doce/g, "batata-d").replace(/polvilho doce/g, "polvilho-d");
  const c = norm(cat);
  const out = new Set(docCategories || []);

  const isDrink = /\b(suco|vitamina|smoothie|shake|cha |cha$|chocolate quente|ponche|quentao|gemada|cappuccino)\b/.test(t) ||
    /^(cha de|cha$)/.test(t) || /bebida|suco|cha funcional/.test(c);
  const isSoup = /\b(sopa|caldo|creme de (brocolis|alho|ervilha|abobora|vagem)|sopa creme)\b/.test(t);
  const isSalad = /\bsalada\b/.test(t) && !/salada de frutas/.test(t);
  const isCake = /\b(bolo|bolinho de microondas|cupcake|muffin|panetone|rocambole doce|bolo de rolo|brownie)\b/.test(t) && !/bolinho(s)? de (frango|arroz)/.test(t) && !/muffin de (legumes|atum)/.test(t);
  const isSauce = /^(calda|cobertura|ganache|chantilly|creme confeiteiro|geleia)\b/.test(t);
  const isBase = /\b(leite condensado|farinha d[ae]|biomassa|iogurte|coalhada|granola|farofa doce)\b/.test(t) || /base saudavel|preparo funcional/.test(c);
  const isBread = /\b(pao|paes|esfirra|pastel|empadinha|empadao|tortinhas|wrap|quiche|biscoito de polvilho)\b/.test(t) && !/pao de mel/.test(t);
  const isSide = !/arroz doce/.test(t) && /\b(arroz|farofa low carb|pure|tomates assados|chips de|couve flor de forno|acompanhamento)\b/.test(t) || /acompanhamento/.test(c);
  const isBreakfastFood = /\b(panqueca|crepioca|omelete|mingau|tapioca|ovos com|aveia com|granola|vitamina|smoothie|pao)\b/.test(t);
  const sweetWords = /\b(doce|bolo|brigadeiro|beijinho|mousse|pudim|torta (de limao|de ricota|mousse|delicia|de nozes|de chocolate|de maca|banoffee|de morango|de frutas)|tarte|sorvete|picole|gelado|gelatina|flan|cookie|biscoito|trufa|bombom|cocada|quindim|cajuzinho|pacoca|pe de moleque|olho de sogra|manjar|curau|canjica|arroz doce|rabanada|churros|sonho|strudel|maca do amor|creme de (avela|chocolate|limao|papaya|abacate)|chocolate|cheesecake|pave|barrinha|queijadinha|cupcake|muffin|panetone|suspiro|alfajor|cannoli|crostata|petit gateau|docinho|compota|copota|salada de frutas|espetinho de frutas|abacate cremoso|nutella|damasco com|crepe de geleia|crepe com geleia|delicia de manga)\b/;
  const savory = /\b(queijo branco|frango|atum|legumes|carne|peixe|salmao)\b/.test(t) && !/queijadinha/.test(t);
  const isSweet = !savory && (sweetWords.test(t.replace(/(\w{4,})s\b/g, "$1")) || /sobremesa|doce/.test(c) || docKey === "E3" || docKey === "B2");

  if (isDrink) out.add("sucos-e-bebidas");
  if (isSoup) out.add("sopas-e-cremes");
  if (isSalad) out.add("saladas");
  if (isCake) out.add("bolos");
  if (isSauce) out.add("caldas-e-coberturas");
  if (isBase && !isDrink) out.add("bases-e-preparos");
  if (isBread) out.add("paes-e-salgados");

  // Selos de refeição do material original
  if (/cafe da manha/.test(c)) out.add("cafe-da-manha");
  if (/almoco/.test(c)) out.add("almoco");
  if (/jantar/.test(c)) out.add("jantar");
  if (/lanche/.test(c)) out.add("lanches");
  if (/entrada|salada/.test(c)) out.add("saladas");
  if (/sopa/.test(c)) out.add("sopas-e-cremes");
  if (isSide) out.add("acompanhamentos");

  if (isSweet && !isDrink) out.add("doces-e-sobremesas");

  // Seções do Cardápio para diabéticos
  if (/cafe da manha, bolos/.test(c)) {
    if (isBreakfastFood || isCake || /biscoito|cuscuz|vitamina/.test(t)) out.add("cafe-da-manha");
    if (!isCake && !isDrink) out.add("lanches");
  }
  if (/pratos para almoco e jantar|prato saudavel|preparacao funcional|refeicao leve|almoco pratico/.test(c) || docKey === "B3") {
    const main = !isSweet && !isDrink && !isBase && !(isBreakfastFood && !/torta|lasanha|nhoque/.test(t));
    if (main && !isSide && !isSalad && !isBread) { out.add("almoco"); out.add("jantar"); }
    if (main && isSalad) out.add("almoco");
    if (isBreakfastFood && !isSweet) out.add("cafe-da-manha");
  }
  if (/omelete|crepioca|panqueca de (aveia|banana|coco|abobora)|mingau|pao de (aveia|micro|banana)|pao integral simples/.test(t)) out.add("cafe-da-manha");
  if (/bolinho de frango|muffin de (legumes|atum)|chips|esfirra|pastel|empadinha|tortinhas|wrap|barrinha|damasco com pasta/.test(t)) out.add("lanches");

  // Natal (Entregável 3) por seção
  if (/biscoitos e cookies/.test(c)) out.add("lanches");
  if (/paes doces|panetones/.test(c)) { out.add("paes-e-salgados"); out.add("doces-e-sobremesas"); }

  if (/pastel|empadinha|wrap|tortinhas|chips|empadao/.test(t)) out.delete("cafe-da-manha");
  if (out.size === 0) out.add(isSweet ? "doces-e-sobremesas" : "almoco");
  return [...out];
}

/** Coleções extras pelo nome da receita (o material de origem chama a receita assim). */
export function extraCollections({ title }) {
  const out = [];
  if (/low ?carb/i.test(title)) out.push("low-carb");
  return out;
}

export function tags({ title, docKey, collections }) {
  const t = norm(title);
  const out = new Set();
  if (/low ?carb/.test(t) || collections.includes("low-carb")) out.add("low-carb");
  if (/^cha de|^cha$/.test(t)) out.add("cha");
  if (docKey === "E3") out.add("natal");
  return [...out];
}

const SUGAR = [
  [/(?<!sem |zero |sem adicao de )acucar (mascavo|demerara|de coco|refinado)/, "açúcar"],
  [/\bacucar\b(?! (zero|diet|light))(?<!sem acucar)(?<!zero acucar)/, "açúcar"],
  [/\bmel\b(?! de)/, "mel"],
  [/\bmelado\b(?! zero)/, "melado"],
  [/\bmaple\b/, "maple"],
];

/** Sinaliza ingredientes com açúcar em coleções com foco em baixo açúcar. */
export function sugarFlags({ ingredientsText, collections }) {
  const focus = collections.some((c) => ["alimentacao-e-diabetes", "doces-sem-acucar", "natal-zero-acucar", "low-carb"].includes(c));
  if (!focus) return [];
  const t = norm(ingredientsText).replace(/sem acucar|zero acucar|sem adicao de acucar|acucar zero/g, "");
  const found = new Set();
  for (const [re, label] of SUGAR) if (re.test(t)) found.add(label);
  if (!found.size) return [];
  return [`Ingrediente com açúcar natural ou adicionado (${[...found].join(", ")}) em coleção focada em baixo açúcar; revisar a forma de apresentação.`];
}
