import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    if (
      (pathname.startsWith("/admin") || pathname === "/api/articles") &&
      !token
    ) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", req.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        const reqMethod = req.method ?? "GET";

        if (pathname.startsWith("/admin")) return !!token;

        if (
          pathname.startsWith("/api/articles") &&
          ["POST", "PUT", "DELETE"].includes(reqMethod)
        ) {
          return !!token;
        }

        if (pathname.startsWith("/api/upload")) return !!token;

        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/api/articles/:path*", "/api/upload"],
};
