import axios from "axios";
import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
} from "@/types/auth.types";
import type { FileUploadRequest, FileUploadResponse, History } from "@/types/upload.types";
import { getAccessToken, setAccessToken, removeAccessToken } from "./auth";

// 환경변수 검증 및 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Production 환경에서 환경변수가 없으면 명확한 에러
if (!API_BASE_URL && process.env.NODE_ENV === "production") {
  throw new Error(
    "❌ CRITICAL: NEXT_PUBLIC_API_URL 환경변수가 설정되지 않았습니다!\n" +
      "Vercel Dashboard → Settings → Environment Variables에서 설정하세요.\n" +
      "Key: NEXT_PUBLIC_API_URL\n" +
      "Value: https://talk-vault-back.onrender.com"
  );
}

if (!API_BASE_URL && typeof window !== "undefined") {
  console.error("❌ NEXT_PUBLIC_API_URL 환경변수가 설정되지 않았습니다!");
  console.error("로컬 개발: .env 파일을 확인하세요");
  console.error("Vercel 배포: Dashboard에서 환경변수를 설정하세요");
}

// Client용 Axios 인스턴스 (withCredentials)
const apiClient = axios.create({
  baseURL: API_BASE_URL || "https://talk-vault-back.onrender.com",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request 인터셉터: Access Token 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response 인터셉터: 401 에러 시 토큰 갱신
apiClient.interceptors.response.use(
  (response: any) => {
    return response.data;
  },
  async (error: any) => {
    const originalRequest = error.config;

    // 401 에러이고 재시도하지 않은 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Refresh Token으로 새 Access Token 발급
        const response = await axios.post<{ accessToken: string }>(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = response.data.accessToken;
        setAccessToken(newAccessToken);

        // 실패한 요청 재시도
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh 실패 시 로그아웃 처리
        removeAccessToken();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    const errorMessage = error.response?.data?.message || "오류가 발생했습니다";
    return Promise.reject(new Error(errorMessage));
  }
);

// Auth API
export const authApi = {
  // 로그인 - POST /auth/login
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    console.log("📤 API 요청 시작:", data.email);
    const response = (await apiClient.post<LoginResponse>(
      "/auth/login",
      data
    )) as any as LoginResponse;

    console.log("📥 API 응답 원본:", response);

    // Access Token 저장
    if (response.accessToken) {
      setAccessToken(response.accessToken);
      console.log("✅ AccessToken 있음");
    } else {
      console.warn("⚠️ AccessToken 없음!");
    }

    return response;
  },

  // 회원가입 - POST /auth/signup
  signup: async (data: SignupRequest): Promise<SignupResponse> => {
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);
    if (data.profileImage) {
      formData.append("profileImage", data.profileImage);
    }

    const response = (await apiClient.post<SignupResponse>("/auth/signup", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })) as any as SignupResponse;

    // Access Token 저장
    if (response.accessToken) {
      setAccessToken(response.accessToken);
    }

    return response;
  },

  // 로그아웃 - POST /auth/logout
  logout: async (): Promise<void> => {
    await apiClient.post<void>("/auth/logout");
    removeAccessToken();
  },

  // 토큰 갱신 - POST /auth/refresh
  refresh: async (): Promise<{ accessToken: string }> => {
    const response = (await apiClient.post<{ accessToken: string }>("/auth/refresh")) as any as {
      accessToken: string;
    };
    if (response.accessToken) {
      setAccessToken(response.accessToken);
    }
    return response;
  },
};

// Users API
export const usersApi = {
  // 유저 프로필 조회 - GET /users/:id
  getUserById: async (id: string) => {
    const response = await apiClient.get(`/users/${id}`);
    return response;
  },

  // 유저 정보 수정 - PATCH /users/:id
  updateUser: async (id: string, data: Partial<SignupRequest>) => {
    const formData = new FormData();
    if (data.email) formData.append("email", data.email);
    if (data.password) formData.append("password", data.password);
    if (data.profileImage) formData.append("profileImage", data.profileImage);

    const response = await apiClient.patch(`/users/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response;
  },

  // 유저 삭제 - DELETE /users/:id
  deleteUser: async (id: string) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response;
  },
};

// Upload & History API
export const uploadApi = {
  // 파일 업로드 - POST /upload
  uploadFile: async (data: FileUploadRequest): Promise<FileUploadResponse> => {
    const formData = new FormData();
    formData.append("file", data.file);

    const response = (await apiClient.post<FileUploadResponse>("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })) as any as FileUploadResponse;
    return response;
  },

  // 히스토리 목록 조회 - GET /histories
  getHistories: async (): Promise<History[]> => {
    const response = (await apiClient.get<History[]>("/histories")) as any as History[];
    return response;
  },

  // 특정 히스토리 조회 (목록에서 필터링)
  getHistoryById: async (id: string): Promise<History | null> => {
    const histories = (await apiClient.get<History[]>("/histories")) as any as History[];
    const history = histories.find((h: History) => h.id === id);
    return history || null;
  },

  // 파일 다운로드 - GET /histories/:id/download
  downloadFile: async (id: string): Promise<Blob> => {
    const response = (await apiClient.get<Blob>(`/histories/${id}/download`, {
      responseType: "blob",
    })) as any as Blob;
    return response;
  },
};

export default apiClient;
