"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useHistory } from "@/hooks/useHistory";

export default function MyPage() {
  const router = useRouter();
  const { histories, isLoading, error, fetchHistories, downloadFile } = useHistory();

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between z-10">
        <div
          className="text-2xl font-bold text-blue-600 cursor-pointer"
          onClick={() => router.push("/home")}
        >
          TalkVault
        </div>
        <button
          className="text-sm text-gray-700 hover:text-gray-900"
          onClick={() => router.push("/home")}
        >
          업로드로 이동
        </button>
      </header>

      <div className="pt-24 px-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">내 변환 이력</h1>
          <button
            className="px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
            onClick={fetchHistories}
            disabled={isLoading}
          >
            새로고침
          </button>
        </div>

        {isLoading ? (
          <div className="text-gray-600">불러오는 중...</div>
        ) : histories.length === 0 ? (
          <div className="text-gray-600">아직 변환 이력이 없습니다.</div>
        ) : (
          <div className="space-y-3">
            {histories.map((h) => (
              <div
                key={h.id}
                className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-gray-800">{h.originalFileName}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(h.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:bg-gray-300"
                    disabled={!h.pdfPath && !h.excelPath}
                    onClick={() => downloadFile(h.id, h.savedFileName)}
                  >
                    다운로드
                  </button>
                  <button
                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                    onClick={() => router.push(`/result/${h.id}`)}
                  >
                    상세
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
