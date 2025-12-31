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

  // Production에서는 숨김
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-orange-600 text-white p-4 rounded-lg text-xs font-mono z-[9999] max-w-md shadow-2xl">
      <div className="font-bold mb-2">🍪 Current Cookies</div>
      <div className="bg-black bg-opacity-50 p-2 rounded overflow-auto max-h-40">
        {cookies || "No cookies found"}
      </div>
      <div className="mt-2 text-[10px] opacity-75">F12 Console에서 상세 확인</div>
    </div>
  );
}
