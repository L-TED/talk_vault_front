"use client";

import { useRouter } from "next/navigation";
import FileUploader from "@/components/upload/FileUploader";
import { useProfileImage } from "@/hooks/useCommon";

export default function HomePage() {
  const router = useRouter();
  const profileImageUrl = useProfileImage();
  const {
    file,
    textContent,
    isLoading,
    error,
    handleFileChange,
    handleFileDrop,
    handleTextChange,
    handleConvert,
  } = FileUploader({
    onUploadSuccess: (historyId) => {
      // 업로드 성공 시 결과 페이지로 이동 (변환 상태는 결과 페이지에서 비동기로 폴링)
      router.push(`/result/${historyId}`);
    },
  });

  return (
    <div className="min-h-screen bg-rose-50">
      {/* 헤더 */}
      <header className="fixed top-0 left-0 right-0 bg-rose-100 border-b border-rose-200 px-8 py-4 flex items-center justify-between z-10">
        <div className="text-2xl font-extrabold text-amber-800">TalkVault</div>
        <div
          className="w-10 h-10 rounded-full bg-rose-200 overflow-hidden cursor-pointer hover:ring-2 hover:ring-amber-300 transition-all"
          onClick={() => router.push("/mypage")}
        >
          <img
            src={profileImageUrl}
            alt="Profile"
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
      </header>

      {/* 메인 컨텐츠 */}
      <div className="flex items-center justify-center min-h-screen pt-20">
        <div className="w-full max-w-3xl px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-amber-800 mb-2">대화 내용을 변환하세요</h1>
            <p className="text-amber-700">
              텍스트를 붙여넣거나 파일을 업로드하면 PDF와 Excel이 자동으로 생성됩니다
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">
              {error}
            </div>
          )}

          {/* 입력 영역 */}
          <div className="space-y-4">
            <div
              className="relative"
              onDragOver={(e) => {
                e.preventDefault();
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (isLoading) return;
                const dropped = e.dataTransfer?.files?.[0];
                if (dropped) handleFileDrop(dropped);
              }}
            >
              <textarea
                className="w-full h-64 px-6 py-4 border-2 border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent resize-none text-amber-900 placeholder:text-amber-600"
                placeholder="여기에 대화 내용을 붙여넣거나 텍스트 파일을 드래그 해주세요!"
                value={textContent}
                onChange={handleTextChange}
                disabled={isLoading}
              />

              {/* 파일 업로드 버튼 */}
              <div className="absolute bottom-4 right-4">
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 bg-amber-100 text-amber-900 rounded-lg hover:bg-amber-200 transition-colors text-sm font-bold"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  파일 선택
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".txt"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isLoading}
                />
              </div>
            </div>

            {file && (
              <div className="flex items-center gap-2 text-sm text-amber-800 bg-amber-100 px-4 py-2 rounded-lg border border-amber-200">
                <svg className="w-5 h-5 text-amber-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                </svg>
                <span className="font-medium">{file.name}</span>
                <span className="text-amber-700">({(file.size / 1024).toFixed(2)} KB)</span>
              </div>
            )}

            {/* 변환 버튼 */}
            <button
              onClick={handleConvert}
              disabled={isLoading || (!file && !textContent)}
              className="w-full px-6 py-4 bg-amber-100 text-amber-900 font-bold rounded-lg hover:bg-amber-200 transition-colors disabled:bg-stone-200 disabled:text-amber-700 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>변환 중...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                    />
                  </svg>
                  <span>PDF 변환하기</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
