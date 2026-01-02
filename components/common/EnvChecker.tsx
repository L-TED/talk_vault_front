"use client";

import { useEffect, useState } from "react";

/**
 * 개발/디버깅용 환경변수 체커
 * 프로덕션에서는 제거하거나 조건부 렌더링
 */
export default function EnvChecker() {
  const [apiUrl, setApiUrl] = useState<string | undefined>();

  useEffect(() => {
    setApiUrl(process.env.NEXT_PUBLIC_API_URL);

    if (!process.env.NEXT_PUBLIC_API_URL) {
      console.error("⚠️ NEXT_PUBLIC_API_URL이 설정되지 않았습니다!");
      console.error("현재 요청 대상:", "http://localhost:8000 (기본값)");
    } else {
      console.log("✅ API Base URL:", process.env.NEXT_PUBLIC_API_URL);
    }
  }, []);

  // UI로 드러나는 디버깅은 금지: 콘솔 로그만 남기고 렌더링은 하지 않습니다.
  void apiUrl;
  return null;
}
