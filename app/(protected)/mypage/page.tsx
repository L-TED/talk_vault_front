"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { uploadApi } from "@/lib/api";
import { History } from "@/types/upload.types";
import HistoryTable from "@/components/mypage/HistoryTable";

const Mypage = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const [histories, setHistories] = useState<History[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistories();
  }, []);

  const fetchHistories = async () => {
    try {
      setIsLoading(true);
      const data = await uploadApi.getHistories();
      // 날짜별로 최신순 정렬
      const sortedData = data.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setHistories(sortedData);
    } catch (error) {
      console.error("히스토리 조회 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      // TODO: 실제 DELETE API 구현 필요
      setHistories((prev) => prev.filter((h) => h.id !== id));
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제에 실패했습니다.");
    }
  };

  const handleDownload = async (id: string) => {
    try {
      const blob = await uploadApi.downloadFile(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `history-${id}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("다운로드 실패:", error);
      alert("다운로드에 실패했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 네비게이션 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">마이페이지</h1>

            <div className="flex items-center gap-4">
              {/* 홈 버튼 */}
              <button
                onClick={() => router.push("/home")}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                TalkVault
              </button>

              {/* 프로필 이미지 */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold overflow-hidden">
                {user?.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt="프로필"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{user?.email?.[0]?.toUpperCase() || "U"}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">변환 히스토리</h2>
          <p className="text-gray-600">총 {histories.length}개의 변환 기록이 있습니다.</p>
        </div>

        {/* 히스토리 테이블 */}
        <HistoryTable
          histories={histories}
          onDelete={handleDelete}
          onDownload={handleDownload}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
};

export default Mypage;
