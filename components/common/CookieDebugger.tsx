"use client";

import { useEffect, useState } from "react";

/**
 * 쿠키 디버거 - 현재 설정된 모든 쿠키 확인
 */
export default function CookieDebugger() {
  const [cookies, setCookies] = useState<string>("");

  useEffect(() => {
    // 모든 쿠키 출력
    const allCookies = document.cookie;
    setCookies(allCookies || "❌ 쿠키 없음");

    console.group("🍪 Cookie Debug Info");
    console.log("Raw Cookies:", document.cookie);
    console.log("Parsed:");
    document.cookie.split(";").forEach((cookie) => {
      const [name, value] = cookie.trim().split("=");
      console.log(`  ${name}: ${value}`);
    });
    console.groupEnd();
  }, []);

  // UI로 드러나는 디버깅은 금지: 콘솔 로그만 남기고 렌더링은 하지 않습니다.
  void cookies;
  return null;
}
