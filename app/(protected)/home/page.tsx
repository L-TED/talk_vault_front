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
    handleTextChange,
    handleConvertToPdf,
    handleConvertToExcel,
  } = FileUploader({
    onUploadSuccess: (historyId) => {
      // 업로드 성공 시 결과 페이지로 이동
      router.push(`/result/${historyId}`);
    },
  });

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between z-10">
        <div className="text-2xl font-bold text-blue-600">TalkVault</div>
        <div
          className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
          onClick={() => router.push("/mypage")}
        >
          <img
            src={profileImageUrl}
            alt="Profile"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/default-profile.png";
            }}
          />
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <div className="flex items-center justify-center min-h-screen pt-20">
        <div className="w-full max-w-3xl px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">대화 내용을 변환하세요</h1>
            <p className="text-gray-600">
              텍스트를 붙여넣거나 파일을 업로드하여 PDF 또는 Excel로 변환할 수 있습니다
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* 입력 영역 */}
          <div className="space-y-4">
            <div className="relative">
              <textarea
                className="w-full h-64 px-6 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-700"
                placeholder="여기에 대화 내용을 붙여넣으세요..."
                value={textContent}
                onChange={handleTextChange}
                disabled={isLoading}
              />

              {/* 파일 업로드 버튼 */}
              <div className="absolute bottom-4 right-4">
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
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
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 px-4 py-2 rounded-lg">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                </svg>
                <span className="font-medium">{file.name}</span>
                <span className="text-gray-500">({(file.size / 1024).toFixed(2)} KB)</span>
              </div>
            )}

            {/* 변환 버튼 */}
            <div className="flex gap-4">
              <button
                onClick={handleConvertToPdf}
                disabled={isLoading || (!file && !textContent)}
                className="flex-1 px-6 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? "변환 중..." : "PDF 변환하기"}
              </button>
              <button
                onClick={handleConvertToExcel}
                disabled={isLoading || (!file && !textContent)}
                className="flex-1 px-6 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? "변환 중..." : "EXCEL 변환하기"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
