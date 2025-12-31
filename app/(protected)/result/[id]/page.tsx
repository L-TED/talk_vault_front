"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { uploadApi } from "@/lib/api";
import type { History } from "@/types/upload.types";

type PageProps = {
  params: { id: string };
};

type Status = "loading" | "processing" | "ready" | "timeout" | "error";

export default function ResultPage({ params }: PageProps) {
  const router = useRouter();
  const historyId = params.id;

  const [history, setHistory] = useState<History | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  const baseName = useMemo(() => {
    const original = history?.originalFileName || "converted";
    return original.replace(/\.txt$/i, "");
  }, [history?.originalFileName]);

  const availableFileLabel = useMemo(() => {
    if (!history) return "다운로드";
    if (history.pdfPath) return "PDF 다운로드";
    if (history.excelPath) return "Excel 다운로드";
    return "다운로드";
  }, [history]);

  useEffect(() => {
    let cancelled = false;
    let intervalId: number | undefined;

    const POLL_INTERVAL_MS = 2000;
    const TIMEOUT_MS = 60_000;
    const startedAt = Date.now();

    const poll = async () => {
      try {
        const data = await uploadApi.getHistoryById(historyId);

        if (cancelled) return;

        if (!data) {
          setStatus("processing");
          return;
        }

        setHistory(data);

        const pdfReady = Boolean(data.pdfPath);
        const excelReady = Boolean(data.excelPath);

        if (pdfReady || excelReady) {
          setStatus("ready");
          if (intervalId) window.clearInterval(intervalId);
          toast.success("변환이 완료되었습니다!");
          return;
        }

        if (Date.now() - startedAt > TIMEOUT_MS) {
          setStatus("timeout");
          if (intervalId) window.clearInterval(intervalId);
          toast.error("변환 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.");
          return;
        }

        setStatus("processing");
      } catch (e) {
        if (cancelled) return;
        setStatus("error");
        if (intervalId) window.clearInterval(intervalId);
        toast.error("변환 상태를 불러오지 못했습니다.");
      }
    };

    // 첫 조회
    poll();
    // 이후 폴링
    intervalId = window.setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [historyId]);

  const handleDownload = async () => {
    try {
      const { blob, fileName } = await uploadApi.downloadFile(historyId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || history?.savedFileName || `${baseName}.bin`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      toast.error("다운로드에 실패했습니다.");
    }
  };

  const isProcessing = status === "loading" || status === "processing";
  const canDownload =
    (Boolean(history?.pdfPath) || Boolean(history?.excelPath)) && status === "ready";

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-xl px-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">변환 결과</h1>
          <p className="mt-2 text-gray-600">
            {isProcessing
              ? "변환 진행 중입니다. 잠시만 기다려주세요."
              : "다운로드가 준비되었습니다."}
          </p>
        </div>

        <div className="p-5 border border-gray-200 rounded-lg bg-gray-50">
          <div className="text-sm text-gray-700">
            <div className="flex justify-between">
              <span className="text-gray-500">파일명</span>
              <span className="font-medium">{history?.originalFileName ?? "-"}</span>
            </div>
            <div className="mt-2 flex justify-between">
              <span className="text-gray-500">상태</span>
              <span className="font-medium">
                {status === "ready" && "완료"}
                {status === "processing" && "처리 중"}
                {status === "loading" && "불러오는 중"}
                {status === "timeout" && "시간 초과"}
                {status === "error" && "오류"}
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button
              className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              onClick={handleDownload}
              disabled={!canDownload}
            >
              {availableFileLabel}
            </button>

            <button
              className="w-full px-6 py-3 bg-white text-gray-800 font-semibold border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => router.push("/mypage")}
            >
              마이페이지로 이동
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
