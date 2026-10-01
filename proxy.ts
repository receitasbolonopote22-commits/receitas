import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, accessToken, configuredPassword, safeEqual } from "@/lib/access";

/**
 * Porteiro do site: nada de conteúdo (páginas, fotos, busca) é entregue sem a senha.
 * Só ficam livres a tela de entrada e os arquivos visuais dela.
 */
export async function proxy(request: NextRequest) {
  const password = configuredPassword();

  if (!password) {
    // Em produção, sem senha configurada, o site fica fechado (falha segura).
    if (process.env.NODE_ENV === "production") {
      return new NextResponse("Site em configuração: defina a variável SITE_PASSWORD na hospedagem.", {
        status: 503,
        headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
      });
    }
    return NextResponse.next(); // desenvolvimento local sem senha
  }

  const cookie = request.cookies.get(ACCESS_COOKIE)?.value ?? "";
  if (cookie && safeEqual(cookie, await accessToken(password))) {
    const res = NextResponse.next();
    res.headers.set("x-robots-tag", "noindex, nofollow");
    return res;
  }

  const { pathname, search } = request.nextUrl;
  // Pedidos de arquivos/dados (não páginas): responde 401 em vez de redirecionar
  const isPage = request.method === "GET" && !/\.[a-z0-9]+$/i.test(pathname);
  if (!isPage) {
    return new NextResponse("Acesso restrito.", { status: 401, headers: { "cache-control": "no-store" } });
  }
  const url = request.nextUrl.clone();
  url.pathname = "/entrar";
  url.search = pathname === "/" ? "" : `?next=${encodeURIComponent(pathname + search)}`;
  const res = NextResponse.redirect(url, 307);
  res.headers.set("cache-control", "no-store");
  return res;
}

export const config = {
  matcher: [
    // Tudo, exceto: tela de entrada, arquivos internos do Next e ícones/imagem de prévia do link
    "/((?!entrar|api/entrar|api/sair|_next/static|_next/image|favicon\\.ico|icon\\.svg|apple-icon\\.png|manifest\\.webmanifest|robots\\.txt|opengraph-image\\.png|twitter-image\\.png).*)",
  ],
};
