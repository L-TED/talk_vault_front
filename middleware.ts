// 쿠키 존재 여부로 라우팅 가드
import { NextResponse } from "next/server";

interface Request {
  nextUrl: {
    pathname: string;
  };
  cookies: {
    get: (name: string) => string | undefined;
  };
  url: string;
}

export function middleware(request: Request) {
  const { pathname } = request.nextUrl;
  if (!request.cookies.get("auth") && pathname.startsWith("/(protected)")) {
    return NextResponse.redirect(new URL("/(auth)", request.url));
  }

  return NextResponse.next();
}
