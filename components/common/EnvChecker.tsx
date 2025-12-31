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

  // 개발 환경에서만 표시
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-gray-900 text-white p-3 rounded-lg text-xs shadow-lg z-50 max-w-xs">
      <div className="font-bold mb-1">🔧 환경 체크</div>
      <div className="space-y-1">
        <div>
          <span className="text-gray-400">API URL:</span>
          <div className={`font-mono ${apiUrl ? "text-green-400" : "text-red-400"}`}>
            {apiUrl || "❌ 미설정 (localhost:8000 사용 중)"}
          </div>
        </div>
        <div>
          <span className="text-gray-400">ENV:</span>
          <span className="font-mono text-blue-400 ml-1">{process.env.NODE_ENV}</span>
        </div>
      </div>
    </div>
  );
}
