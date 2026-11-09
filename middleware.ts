import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;
  const user = req.auth?.user;
  const isLoggedIn = !!user;

  // Add basic security headers
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Admin routes protection (/admin and /admin/*)
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (user.role !== "SUPER_ADMIN" && user.role !== "MODERATOR") {
      // Forbidden: redirect to home or their role page
      return NextResponse.redirect(new URL("/", nextUrl.origin));
    }
    return response;
  }

  // Candidate routes protection (/candidate and /candidate/*)
  if (pathname.startsWith("/candidate")) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (user.role !== "CANDIDATE" && user.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/", nextUrl.origin));
    }
    return response;
  }

  // Employer routes protection (/employer and /employer/*)
  if (pathname.startsWith("/employer")) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (user.role !== "EMPLOYER" && user.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/", nextUrl.origin));
    }
    return response;
  }

  // Redirect already authenticated users away from /login and /register
  if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
    if (user.role === "CANDIDATE") {
      return NextResponse.redirect(new URL("/candidate", nextUrl.origin));
    }
    if (user.role === "EMPLOYER") {
      return NextResponse.redirect(new URL("/employer", nextUrl.origin));
    }
    if (user.role === "SUPER_ADMIN" || user.role === "MODERATOR") {
      return NextResponse.redirect(new URL("/admin", nextUrl.origin));
    }
  }

  return response;
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/candidate/:path*",
    "/employer/:path*",
    "/login",
    "/register",
  ],
};

