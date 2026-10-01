/**
 * Configurações gerais da plataforma. Troque aqui nome, textos e endereço.
 */
export const site = {
  name: "Mesa Posta",
  tagline: "Biblioteca de receitas",
  description:
    "Uma biblioteca de receitas para o dia a dia: café da manhã, almoço, jantar, doces sem açúcar, sucos e muito mais, com ingredientes, modo de preparo e informações claras.",
  /** Endereço público do site (sem barra no final). Pode ser definido pela variável NEXT_PUBLIC_SITE_URL. */
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://mesa-posta-receitas.vercel.app").replace(/\/$/, ""),
  locale: "pt_BR",
  /**
   * Permitir que buscadores (Google etc.) indexem as receitas?
   * Como as receitas são um produto pago e ainda não há login, o padrão é `false`
   * (robots.txt bloqueia e as páginas recebem "noindex"). Mude para `true` se quiser
   * que as páginas apareçam no Google.
   */
  allowIndexing: process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true",
  healthNotice:
    "Este conteúdo tem caráter informativo e não substitui a orientação individualizada de médicos, nutricionistas e outros profissionais de saúde.",
};
