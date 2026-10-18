import { NextResponse, type NextRequest } from "next/server";

/**
 * Мови: українська без префікса (/catalog), англійська під /en.
 * Внутрішньо все живе в app/[lang]: українські шляхи переписуємо на /uk/..., прямі /uk/... редіректимо на коротку форму.
 * Лише головна сторінка і лише за відсутності вибору користувача: англомовним браузерам пропонуємо /en.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/uk" || pathname.startsWith("/uk/")) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(url, 308);
  }
  if (pathname === "/en" || pathname.startsWith("/en/")) return NextResponse.next();

  if (pathname === "/" && !req.cookies.get("lang")) {
    const al = (req.headers.get("accept-language") ?? "").toLowerCase();
    const first = al.split(",")[0]?.trim() ?? "";
    if (first.startsWith("en")) {
      const url = req.nextUrl.clone();
      url.pathname = "/en";
      return NextResponse.redirect(url, 307);
    }
  }

  const url = req.nextUrl.clone();
  url.pathname = `/uk${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Не чіпаємо API, статику Next, метадані та файли з розширенням
  matcher: ["/((?!api|_next|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)"],
};
