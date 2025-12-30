// History 인터페이스
export interface History {
  id: string;
  originalFileName: string;
  savedFileName: string;
  filePath: string;
  pdfPath?: string;
  excelPath?: string;
  fileSize: number;
  userId: string;
  createdAt: Date;
}

// 파일 업로드 요청
export interface FileUploadRequest {
  file: File;
}

// 파일 업로드 응답
export interface FileUploadResponse {
  history: History;
}
