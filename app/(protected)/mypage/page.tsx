"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { authApi, uploadApi } from "@/lib/api";
import { clearAuth } from "@/lib/auth";
import { toast } from "react-toastify";
import { History } from "@/types/upload.types";
import HistoryTable from "@/components/mypage/HistoryTable";
import { useProfileImage } from "@/hooks/useCommon";

const Mypage = () => {
  const router = useRouter();
  const { user, logout } = useAuthStore();
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
      await uploadApi.deleteHistory(id);
      setHistories((prev) => prev.filter((h) => h.id !== id));
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제에 실패했습니다.");
    }
  };

  const handleDownload = async (id: string) => {
    try {
      const target = histories.find((h) => h.id === id);
      const directUrl = target?.pdfUrl || target?.excelUrl;

      // If backend stores Supabase public URLs, download directly.
      if (directUrl && /^https?:\/\//i.test(directUrl)) {
        const res = await fetch(directUrl);
        if (!res.ok) throw new Error("direct download failed");
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = target?.savedFileName || `history-${id}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return;
      }

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

  const handleLogout = async () => {
    try {
      await authApi.logout();
      toast.success("로그아웃되었습니다.");
    } catch (e) {
      // 로그아웃 API 실패 시에도 로컬 상태는 정리
      console.error("로그아웃 실패:", e);
      toast.error("로그아웃에 실패했습니다. 다시 시도해주세요.");
    } finally {
      clearAuth();
      logout();
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-rose-50">
      {/* 상단 네비게이션 */}
      <header className="fixed top-0 left-0 right-0 bg-rose-100 border-b border-rose-200 px-8 py-4 flex items-center justify-between z-10">
        <button
          type="button"
          onClick={() => router.push("/home")}
          className="text-[28px] font-extrabold text-amber-800 hover:cursor-pointer"
          aria-label="TalkVault 홈으로 이동"
        >
          TalkVault
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-bold text-amber-800 hover:text-amber-900 hover:bg-rose-200 rounded-md transition-colors"
          >
            로그아웃
          </button>

          <div
            className="w-10 h-10 rounded-full bg-rose-200 overflow-hidden"
            aria-label={user?.email ? `${user.email} 프로필` : "프로필"}
          >
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
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-amber-800 mb-2">변환 히스토리</h2>
          <p className="text-amber-700">총 {histories.length}개의 변환 기록이 있습니다.</p>
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
