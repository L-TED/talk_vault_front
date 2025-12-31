import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Cross-domain 쿠키는 middleware에서 읽을 수 없으므로
  // 클라이언트 사이드에서 인증 체크 수행
  console.log("⚠️ Middleware 비활성화 - 모두 통과");
  return NextResponse.next();
}

export const config = {
  matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
  // ["/upload/:path*", "/mypage/:path*", "/home/:path*", "/login"],
};
