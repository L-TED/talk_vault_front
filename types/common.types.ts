// API 응답 기본 구조
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// API 에러 응답
export interface ApiError {
  success: false;
  error: string;
  message: string;
}
