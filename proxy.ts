import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// middleware.ts => proxy.ts로 파일명 변경
export function proxy(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const { pathname } = request.nextUrl;

  // 보호된 경로 - 토큰이 없으면 /login으로 리다이렉트
  if (
    pathname.startsWith("/upload") ||
    pathname.startsWith("/result") ||
    pathname.startsWith("/mypage")
  ) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 로그인 페이지 - 토큰이 있으면 /mypage로 리다이렉트
  if (pathname.startsWith("/login")) {
    if (token) {
      return NextResponse.redirect(new URL("/mypage", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/upload/:path*", "/result/:path*", "/mypage/:path*", "/login"],
};
