// User 인터페이스
export interface User {
  id: string;
  email: string;
  password: string;
  profileImageUrl?: string;
  refreshToken?: string;
  createdAt: Date;
}

// 로그인 요청
export interface LoginRequest {
  email: string;
  password: string;
}

// 회원가입 요청
export interface SignupRequest {
  email: string;
  password: string;
  profileImage?: File;
}

// 로그인 응답
export interface LoginResponse {
  token: string;
  user: Omit<User, "password" | "refreshToken">;
}

// 회원가입 응답
export interface SignupResponse {
  token: string;
  user: Omit<User, "password" | "refreshToken">;
}
