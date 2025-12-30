"use client";

import { useState } from "react";
import { uploadApi } from "@/lib/api";
import type { FileUploadRequest } from "@/types/upload.types";

interface FileUploaderProps {
  onUploadSuccess?: (historyId: string) => void;
}

const FileUploader = ({ onUploadSuccess }: FileUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 파일 선택 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // txt 파일만 허용
      if (!selectedFile.name.endsWith(".txt")) {
        setError("txt 파일만 업로드 가능합니다.");
        return;
      }

      setFile(selectedFile);
      setTextContent("");
      setError(null);
    }
  };

  // 텍스트 붙여넣기 핸들러
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextContent(e.target.value);
    setFile(null);
    setError(null);
  };

  // PDF 변환 핸들러
  const handleConvertToPdf = async () => {
    await handleUpload("pdf");
  };

  // Excel 변환 핸들러
  const handleConvertToExcel = async () => {
    await handleUpload("excel");
  };

  // 파일 업로드 및 변환
  const handleUpload = async (format: "pdf" | "excel") => {
    let uploadFile: File;

    // 텍스트가 입력된 경우 파일로 변환
    if (textContent && !file) {
      const blob = new Blob([textContent], { type: "text/plain" });
      uploadFile = new File([blob], "pasted-text.txt", { type: "text/plain" });
    } else if (file) {
      uploadFile = file;
    } else {
      setError("파일을 선택하거나 텍스트를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const uploadData: FileUploadRequest = { file: uploadFile };
      const response = await uploadApi.uploadFile(uploadData);

      // 업로드 성공 시 콜백 실행
      if (onUploadSuccess && response.history.id) {
        onUploadSuccess(response.history.id);
      }

      // 상태 초기화
      setFile(null);
      setTextContent("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "파일 업로드에 실패했습니다.");
      console.error("Upload error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    file,
    textContent,
    isLoading,
    error,
    handleFileChange,
    handleTextChange,
    handleConvertToPdf,
    handleConvertToExcel,
  };
};

export default FileUploader;
