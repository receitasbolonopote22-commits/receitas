import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE } from "@/lib/access";

export function GET(request: NextRequest) {
  const res = NextResponse.redirect(new URL("/entrar", request.url), 303);
  res.cookies.set(ACCESS_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
