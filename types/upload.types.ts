// History 인터페이스
export interface History {
  id: string;
  user_id: string;
  title?: string;
  source: "kakao" | "whatsapp" | "slack";
  file_type: "pdf" | "excel";
  file_path?: string;
  created_at: Date;
}

// 파일 업로드 요청
export interface FileUploadRequest {
  title?: string;
  source: "kakao" | "whatsapp" | "slack";
  file_type: "pdf" | "excel";
  file: File;
}

// 파일 업로드 응답
export interface FileUploadResponse {
  history: History;
}
