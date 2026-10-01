/**
 * Controle de acesso por SENHA ÚNICA (compartilhada por todas as clientes).
 *
 * - A senha fica na variável de ambiente SITE_PASSWORD (nunca no código).
 * - Ao entrar, o navegador recebe um cookie com uma "impressão digital" da senha atual.
 * - Ao TROCAR a senha, a impressão muda e todo mundo que estava logado é deslogado
 *   automaticamente — só entra de novo com a senha nova.
 *
 * Funciona no proxy (antes de qualquer página, imagem ou dado ser entregue).
 */
export const ACCESS_COOKIE = "mp_acesso";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 400; // ~1 ano (limite dos navegadores)

/** Normaliza o que a pessoa digita: ignora espaços nas pontas e maiúsculas/minúsculas. */
export const normalizePassword = (s: string) => s.trim().toLowerCase();

export function configuredPassword(): string | null {
  const p = process.env.SITE_PASSWORD;
  return p && p.trim() ? normalizePassword(p) : null;
}

/** Impressão digital da senha (HMAC-SHA256). O cookie guarda isto, nunca a senha. */
export async function accessToken(password: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(normalizePassword(password)), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode("mesa-posta:acesso:v1"));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Comparação em tempo constante (evita descobrir o valor por medição de tempo). */
export function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Só aceita voltar para caminhos internos do próprio site. */
export function safeNext(next: string | null | undefined) {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/entrar") || next.startsWith("/api/")) return "/";
  return next;
}
