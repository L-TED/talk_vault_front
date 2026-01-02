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

  const debugPrefix = "[UploadDebug]";

  // 파일 선택 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      console.log(`${debugPrefix} file selected`, {
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size,
      });

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

    // Avoid logging content; log only length to debug payload size.
    console.log(`${debugPrefix} text changed`, { length: e.target.value.length });
  };

  // 파일 업로드 및 변환 (백엔드가 PDF와 Excel 모두 생성)
  const handleConvert = async () => {
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

    console.log(`${debugPrefix} convert start`, {
      source: file ? "file" : "text",
      fileName: uploadFile.name,
      fileType: uploadFile.type,
      fileSize: uploadFile.size,
      textLength: textContent ? textContent.length : 0,
    });

    setIsLoading(true);
    setError(null);

    try {
      const uploadData: FileUploadRequest = { file: uploadFile };
      const response = await uploadApi.uploadFile(uploadData);

      console.log(`${debugPrefix} convert success`, {
        id: response.id,
        originalFileName: response.originalFileName,
        savedFileName: response.savedFileName,
        fileSize: response.fileSize,
        pdfUrl: response.pdfUrl,
        excelUrl: response.excelUrl,
        createdAt: response.createdAt,
      });

      // 업로드 성공 시 콜백 실행
      if (onUploadSuccess) {
        const resultKey = response.savedFileName || response.id;
        if (resultKey) onUploadSuccess(resultKey);
      }

      // 상태 초기화
      setFile(null);
      setTextContent("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "파일 업로드에 실패했습니다.");

      const anyErr = err as any;
      console.error(`${debugPrefix} convert failed`, {
        message: anyErr?.message,
        name: anyErr?.name,
        code: anyErr?.code,
        status: anyErr?.response?.status,
        statusText: anyErr?.response?.statusText,
        responseData: anyErr?.response?.data,
        url: anyErr?.config?.url,
        method: anyErr?.config?.method,
        baseURL: anyErr?.config?.baseURL,
      });
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
    handleConvert,
  };
};

export default FileUploader;
