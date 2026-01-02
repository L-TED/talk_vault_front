"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  const historyKey = params.id;

  const [history, setHistory] = useState<History | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  const inFlightRef = useRef(false);
  const timeoutIdRef = useRef<number | null>(null);
  const completedRef = useRef(false);
  const attemptRef = useRef(0);

  const baseName = useMemo(() => {
    const original = history?.originalFileName || "converted";
    return original.replace(/\.txt$/i, "");
  }, [history?.originalFileName]);

  const availableFileLabel = useMemo(() => {
    if (!history) return "다운로드";
    if (history.pdfUrl) return "PDF 다운로드";
    if (history.excelUrl) return "Excel 다운로드";
    return "다운로드";
  }, [history]);

  useEffect(() => {
    let cancelled = false;

    // Backend implementation generates PDF/Excel synchronously during /upload.
    // If paths are missing, endless polling won't help; do a few short retries then stop.
    // Give DB/list propagation some time (still bounded; no infinite loop)
    const RETRY_DELAYS_MS = [0, 1000, 2000, 4000, 8000, 12000];
    completedRef.current = false;
    attemptRef.current = 0;

    const clearTimer = () => {
      if (timeoutIdRef.current) {
        window.clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
    };

    const scheduleNext = (delayMs: number) => {
      clearTimer();
      timeoutIdRef.current = window.setTimeout(() => {
        poll();
      }, delayMs);
    };

    const poll = async () => {
      try {
        if (cancelled || completedRef.current) return;
        if (inFlightRef.current) {
          // Avoid overlapping requests (e.g. StrictMode double-mount or slow network)
          const nextDelay =
            RETRY_DELAYS_MS[Math.min(attemptRef.current + 1, RETRY_DELAYS_MS.length - 1)];
          scheduleNext(nextDelay);
          return;
        }

        inFlightRef.current = true;
        const data = await uploadApi.getHistoryById(historyKey);

        inFlightRef.current = false;

        if (cancelled) return;

        if (!data) {
          attemptRef.current += 1;
          if (attemptRef.current >= RETRY_DELAYS_MS.length) {
            completedRef.current = true;
            clearTimer();
            setStatus("error");
            toast.error("변환 상태를 불러오지 못했습니다.");
            return;
          }
          setStatus("processing");
          scheduleNext(RETRY_DELAYS_MS[attemptRef.current]);
          return;
        }

        setHistory(data);

        const pdfReady = Boolean(data.pdfUrl);
        const excelReady = Boolean(data.excelUrl);

        if (pdfReady || excelReady) {
          setStatus("ready");
          completedRef.current = true;
          clearTimer();
          toast.success("변환이 완료되었습니다!");
          return;
        }

        // No output paths: retry a few times for eventual consistency, then stop.
        attemptRef.current += 1;
        if (attemptRef.current >= RETRY_DELAYS_MS.length) {
          completedRef.current = true;
          clearTimer();
          setStatus("error");
          toast.error("변환 상태를 불러오지 못했습니다.");
          return;
        }

        setStatus("processing");
        scheduleNext(RETRY_DELAYS_MS[attemptRef.current]);
      } catch (e) {
        inFlightRef.current = false;
        if (cancelled) return;
        setStatus("error");
        completedRef.current = true;
        clearTimer();
        toast.error("변환 상태를 불러오지 못했습니다.");
      }
    };

    // 첫 조회
    scheduleNext(RETRY_DELAYS_MS[0]);

    return () => {
      cancelled = true;
      clearTimer();
      inFlightRef.current = false;
      completedRef.current = true;
    };
  }, [historyKey]);

  const handleDownload = async () => {
    try {
      const directUrl = history?.pdfUrl || history?.excelUrl;
      if (directUrl && /^https?:\/\//i.test(directUrl)) {
        const res = await fetch(directUrl);
        if (!res.ok) throw new Error("direct download failed");
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = history?.savedFileName || `${baseName}.bin`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        return;
      }

      const resolvedId = history?.id || historyKey;
      const { blob, fileName } = await uploadApi.downloadFile(resolvedId);
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
    (Boolean(history?.pdfUrl) || Boolean(history?.excelUrl)) && status === "ready";

  return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center">
      <div className="w-full max-w-xl px-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-amber-800">변환 결과</h1>
          <p className="mt-2 text-amber-700">
            {isProcessing
              ? "변환 진행 중입니다. 잠시만 기다려주세요."
              : "다운로드가 준비되었습니다."}
          </p>
        </div>

        <div className="p-5 border border-rose-200 rounded-lg bg-white">
          <div className="text-sm text-amber-800">
            <div className="flex justify-between">
              <span className="text-amber-700">파일명</span>
              <span className="font-medium">{history?.originalFileName ?? "-"}</span>
            </div>
            <div className="mt-2 flex justify-between">
              <span className="text-amber-700">상태</span>
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
              className="w-full px-6 py-3 bg-amber-100 text-amber-900 font-bold rounded-lg hover:bg-amber-200 transition-colors disabled:bg-stone-200 disabled:text-amber-700 disabled:cursor-not-allowed"
              onClick={handleDownload}
              disabled={!canDownload}
            >
              {availableFileLabel}
            </button>

            <button
              className="w-full px-6 py-3 bg-rose-50 text-amber-900 font-bold border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
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
