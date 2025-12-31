"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { uploadApi } from "@/lib/api";
import { History } from "@/types/upload.types";
import HistoryTable from "@/components/mypage/HistoryTable";
import { useProfileImage } from "@/hooks/useCommon";

const Mypage = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const profileImageUrl = useProfileImage();
  const [histories, setHistories] = useState<History[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // 초기 데이터 로드만 수행, 인증 실패 판단은 interceptor가 담당
    const checkAuth = async () => {
      try {
        await uploadApi.getHistories();
        setIsCheckingAuth(false);
      } catch (error) {
        // interceptor가 이미 401 처리 및 /login 리다이렉트 수행
        // 여기서는 에러 로깅만
        console.error("API 호출 실패:", error);
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (!isCheckingAuth) {
      fetchHistories();
    }
  }, [isCheckingAuth]);

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
      // interceptor가 이미 인증 처리함, 여기서는 에러 로깅만
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
      const { blob, fileName } = await uploadApi.downloadFile(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || `history-${id}`;
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
            <button
              type="button"
              onClick={() => router.push("/home")}
              className="text-2xl font-bold text-blue-600"
              aria-label="TalkVault 홈으로 이동"
            >
              TalkVault
            </button>

            <div className="flex items-center gap-4">
              {/* 프로필 이미지 */}
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                <img
                  src={profileImageUrl}
                  alt="프로필"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    // 이미 기본 이미지로 변경했으면 무한루프 방지
                    if (!target.src.startsWith("data:")) {
                      target.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23E5E7EB'/%3E%3Cpath d='M20 20c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z' fill='%239CA3AF'/%3E%3C/svg%3E";
                    }
                  }}
                />
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
