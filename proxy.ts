import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales } from "@/lib/wedding-config";

// Sends "/" and any un-prefixed path to the default language (Arabic).
// Shareable links like /en skip this entirely.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasLocale) return;

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico|.*\\..*).*)"],
};
