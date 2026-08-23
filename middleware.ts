import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const acceptHeader = request.headers.get("accept") || "";
  const pathname = request.nextUrl.pathname;

  // Ignore static assets, images, next internal routes, api routes (except agent-markdown)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/agent-markdown") ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|mp4|webp|css|js|woff|woff2)$/)
  ) {
    const response = NextResponse.next();
    response.headers.set("Vary", "Accept, Accept-Encoding");
    return response;
  }

  // Handle explicit Markdown requests via Accept header or .md path extension
  const wantsMarkdown =
    acceptHeader.includes("text/markdown") ||
    pathname.endsWith(".md") ||
    (acceptHeader.includes("text/plain") && (pathname === "/llms.txt" || pathname === "/llms-full.txt"));

  if (wantsMarkdown) {
    const markdownUrl = new URL("/api/agent-markdown", request.url);
    markdownUrl.searchParams.set("path", pathname);

    const response = NextResponse.rewrite(markdownUrl);
    response.headers.set("Content-Type", "text/markdown; charset=utf-8");
    response.headers.set("Vary", "Accept, Accept-Encoding");
    return response;
  }

  // For standard requests, ensure Vary: Accept, Accept-Encoding is set on response headers
  const response = NextResponse.next();
  response.headers.set("Vary", "Accept, Accept-Encoding");
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
