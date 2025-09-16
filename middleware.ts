import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

// route groups
const routes = {
  public: ["/", "/maintenance"],
  auth: ["/login", "/register"],
  admin: ["/admin"],
  unprotectedApi: ["/api/auth", "/api/health"],
};

// Utility to check if the current path matches any in a list
const isRouteMatch = (path: string, list: string[]) =>
  list.some((r) => path === r || path.startsWith(r + "/"));

const createRedirect = (
  req: NextRequest,
  path: string,
  params?: Record<string, string>
) => {
  const url = new URL(path, req.url);
  if (params)
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return NextResponse.redirect(url);
};

const createError = (msg: string, status = 401) =>
  NextResponse.json({ error: msg }, { status });

// middleware function
export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ua = req.headers.get("user-agent") || "";
  const crawlerPattern =
    /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegram|discord|googlebot|bingbot|yandexbot|baiduspider|duckduckbot|applebot|facebot|ia_archiver/i;
  const isBot = crawlerPattern.test(ua);

  // Skip Next.js internals & static assets
  if (/^\/(_next|favicon|sitemap|robots|manifest)|\.\w+$/.test(pathname))
    return NextResponse.next();

  try {
    const session = await auth();
    const user = session?.user;
    const isAuth = !!user;
    const isAdmin = user?.role === "admin";

    // Public
    if (isRouteMatch(pathname, routes.public)) {
      const response = NextResponse.next();
      response.headers.set("x-pathname", pathname);
      return response;
    }

    // Auth pages
    if (isRouteMatch(pathname, routes.auth)) {
      const response = isAuth
        ? createRedirect(req, "/dashboard")
        : NextResponse.next();
      if (!isAuth) response.headers.set("x-pathname", pathname);
      return response;
    }

    // Admin
    if (isRouteMatch(pathname, routes.admin)) {
      if (!isAuth)
        return createRedirect(req, "/register", { callbackUrl: pathname });
      if (!isAdmin) return createRedirect(req, "/dashboard");

      // cache control headers
      const response = NextResponse.next();
      response.headers.set(
        "Cache-Control",
        "no-cache, no-store, must-revalidate"
      );
      response.headers.set("Pragma", "no-cache");
      response.headers.set("Expires", "0");
      return response;
    }

    // API
    if (pathname.startsWith("/api")) {
      if (routes.unprotectedApi.some((r) => pathname.startsWith(r)))
        return NextResponse.next();
      if (pathname.startsWith("/api/admin")) {
        if (!isAuth) return createError("Authentication required");
        if (!isAdmin) return createError("Admin access required", 403);
        return NextResponse.next();
      }
      if (!isAuth) return createError("Authentication required");
      return NextResponse.next();
    }

    // Default: protected
    if (!isAuth) {
      if (isBot) {
        const response = NextResponse.next();
        response.headers.set("x-pathname", pathname);
        return response;
      }
      return createRedirect(req, "/login", { callbackUrl: pathname });
    }
    const response = NextResponse.next();
    response.headers.set("x-pathname", pathname);
    return response;
  } catch {
    if (!isRouteMatch(pathname, [...routes.public, ...routes.auth])) {
      if (isBot) return NextResponse.next();
      return createRedirect(req, "/login", {
        callbackUrl: pathname,
        error: "session_error",
      });
    }
    return NextResponse.next();
  }
}

// matcher to apply middleware to all routes except for the ones specified
export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
