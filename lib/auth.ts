// Access Token 관리 (메모리 또는 상태로만 관리)
// Refresh Token은 httpOnly 쿠키로 백엔드에서 자동 관리

let accessToken: string | null = null;

// 브라우저 환경에서만 sessionStorage 사용 (탭 닫으면 삭제)
const STORAGE_KEY = "access_token";

/**
 * 메모리에 액세스 토큰 저장
 */
export const setAccessToken = (token: string): void => {
  accessToken = token;
  if (typeof window !== "undefined") {
    sessionStorage.setItem(STORAGE_KEY, token);
  }
};

/**
 * 메모리에서 액세스 토큰 가져오기
 */
export const getAccessToken = (): string | null => {
  if (!accessToken && typeof window !== "undefined") {
    accessToken = sessionStorage.getItem(STORAGE_KEY);
  }
  return accessToken;
};

/**
 * 메모리에서 액세스 토큰 삭제
 */
export const removeAccessToken = (): void => {
  accessToken = null;
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(STORAGE_KEY);
  }
};

/**
 * 액세스 토큰 존재 여부 확인
 */
export const hasAccessToken = (): boolean => {
  return !!accessToken;
};

/**
 * 모든 인증 데이터 삭제 (로그아웃 시 사용)
 */
export const clearAuth = (): void => {
  removeAccessToken();
};
