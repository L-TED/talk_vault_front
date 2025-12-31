import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // refreshToken 쿠키 확인 (백엔드에서 httpOnly로 설정)
  const refreshToken = request.cookies.get("refreshToken");
  const { pathname } = request.nextUrl;

  console.log("🔒 Middleware 실행:", pathname);
  console.log("🍪 RefreshToken 쿠키:", refreshToken);
  console.log("🍪 모든 쿠키:", request.cookies.getAll());

  // 보호된 경로: 토큰 없으면 로그인으로 리다이렉트
  if (
    (pathname.startsWith("/upload") ||
      pathname.startsWith("/mypage") ||
      pathname.startsWith("/home")) &&
    !refreshToken
  ) {
    console.log("❌ 토큰 없음 - 로그인으로 리다이렉트");
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
