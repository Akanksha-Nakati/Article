import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    const isAdminRoute = pathname.startsWith("/admin");
    const isProtectedApi =
      pathname.startsWith("/api/articles") &&
      ["POST", "PUT", "DELETE"].includes(req.method ?? "GET");
    const isUploadApi = pathname.startsWith("/api/upload");

    if ((isAdminRoute || isProtectedApi || isUploadApi) && !token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", req.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Always run the middleware function above — let it handle auth logic
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/api/articles/:path*", "/api/upload"],
};
