import { useState, useEffect } from "react";
import { uploadApi } from "@/lib/api";
import type { History } from "@/types/upload.types";

// 히스토리 목록 조회, 삭제, 파일 다운로드 등 히스토리 관련 API 요청을 처리하는 커스텀 훅

export const useHistory = () => {
  const [histories, setHistories] = useState<History[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 히스토리 목록 조회
  const fetchHistories = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await uploadApi.getHistories();
      setHistories(data);
    } catch (err) {
      setError("히스토리 목록을 불러오는데 실패했습니다.");
      console.error("Fetch histories error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 특정 히스토리 조회
  const fetchHistoryById = async (id: string): Promise<History | null> => {
    try {
      const data = await uploadApi.getHistoryById(id);
      return data;
    } catch (err) {
      setError("히스토리를 불러오는데 실패했습니다.");
      console.error("Fetch history error:", err);
      return null;
    }
  };

  // 파일 다운로드
  const downloadFile = async (id: string, fileName: string) => {
    try {
      const blob = await uploadApi.downloadFile(id);

      // Blob을 다운로드 가능한 URL로 변환
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("파일 다운로드에 실패했습니다.");
      console.error("Download file error:", err);
    }
  };

  // 히스토리 삭제 (Mock API에는 없지만 미래 확장을 위해 추가)
  const deleteHistory = async (id: string) => {
    try {
      // TODO: 실제 삭제 API 연동 필요
      // await uploadApi.deleteHistory(id);

      // 로컬 상태에서 삭제
      setHistories((prev) => prev.filter((history) => history.id !== id));
    } catch (err) {
      setError("히스토리 삭제에 실패했습니다.");
      console.error("Delete history error:", err);
    }
  };

  // 컴포넌트 마운트 시 히스토리 목록 자동 조회
  useEffect(() => {
    fetchHistories();
  }, []);

  return {
    histories,
    isLoading,
    error,
    fetchHistories,
    fetchHistoryById,
    downloadFile,
    deleteHistory,
  };
};
