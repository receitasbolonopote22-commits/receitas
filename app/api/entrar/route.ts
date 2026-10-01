import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, COOKIE_MAX_AGE, accessToken, configuredPassword, normalizePassword, safeEqual, safeNext } from "@/lib/access";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const typed = String(form.get("senha") ?? "");
  const next = safeNext(String(form.get("next") ?? "/"));
  const password = configuredPassword();

  const ok = !!password && !!typed && safeEqual(await accessToken(normalizePassword(typed)), await accessToken(password));
  if (!ok) {
    await new Promise((r) => setTimeout(r, 800)); // desacelera tentativas automáticas
    const url = new URL("/entrar", request.url);
    url.searchParams.set("erro", "1");
    if (next !== "/") url.searchParams.set("next", next);
    return NextResponse.redirect(url, 303);
  }

  const res = NextResponse.redirect(new URL(next, request.url), 303);
  res.cookies.set(ACCESS_COOKIE, await accessToken(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  return res;
}
