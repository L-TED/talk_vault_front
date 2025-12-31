import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // 모든 쿠키 확인 (디버깅)
  const allCookies = request.cookies.getAll();
  const refreshToken = request.cookies.get("refreshToken");
  const { pathname } = request.nextUrl;

<<<<<<< HEAD
  // 디버깅 로그 (개발 환경에서만)
  console.log("🔒 Middleware Check:", {
    pathname,
    hasRefreshToken: !!refreshToken,
    allCookies: allCookies.map((c) => `${c.name}=${c.value.substring(0, 20)}...`),
    cookieNames: allCookies.map((c) => c.name),
  });

=======
>>>>>>> parent of 09675a8 (deploy02)
  // 보호된 경로: 토큰 없으면 로그인으로 리다이렉트
  if (
    (pathname.startsWith("/upload") ||
      pathname.startsWith("/mypage") ||
      pathname.startsWith("/home")) &&
    !refreshToken
  ) {
<<<<<<< HEAD
    console.warn("⚠️ No refreshToken cookie found, redirecting to /login");
    console.warn("Available cookies:", allCookies.map((c) => c.name).join(", "));
=======
>>>>>>> parent of 09675a8 (deploy02)
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 로그인 페이지: 토큰 있으면 홈으로 리다이렉트
  if (pathname === "/login" && refreshToken) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/upload/:path*", "/mypage/:path*", "/home/:path*", "/login"],
};
