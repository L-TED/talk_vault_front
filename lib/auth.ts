// Access Token 관리

const TOKEN_KEY = "access_token";

/**
 * 로컬 스토리지에 액세스 토큰 저장
 */
export const setAccessToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

/**
 * 로컬 스토리지에서 액세스 토큰 가져오기
 */
export const getAccessToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

/**
 * 로컬 스토리지에서 액세스 토큰 삭제
 */
export const removeAccessToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
};

/**
 * 액세스 토큰 존재 여부 확인
 */
export const hasAccessToken = (): boolean => {
  return !!getAccessToken();
};

/**
 * 모든 인증 데이터 삭제 (로그아웃 시 사용)
 */
export const clearAuth = (): void => {
  removeAccessToken();
};
