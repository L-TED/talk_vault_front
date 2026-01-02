import axios from "axios";
import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  UpdateUserRequest,
} from "@/types/auth.types";
import type { FileUploadRequest, FileUploadResponse, History } from "@/types/upload.types";
import { getAccessToken, setAccessToken, removeAccessToken } from "./auth";

const DEV = process.env.NODE_ENV !== "production";
let lastHistoriesStackLogAt = 0;

const isHistoriesDebugEnabled = (): boolean => {
  if (DEV) return true;
  if (typeof window === "undefined") return false;
  // Opt-in debug for production via DevTools console:
  // localStorage.setItem('debug_histories','1')
  return window.localStorage.getItem("debug_histories") === "1";
};

const normalizeHistoryLike = <T extends Record<string, any>>(value: T): T => {
  if (!value || typeof value !== "object") return value;

  // Frontend is standardized on pdfUrl/excelUrl.
  // If an older backend sends pdfPath/excelPath, map them to Url fields.
  if (typeof (value as any).pdfUrl !== "string" && typeof (value as any).pdfPath === "string") {
    (value as any).pdfUrl = (value as any).pdfPath;
  }
  if (typeof (value as any).excelUrl !== "string" && typeof (value as any).excelPath === "string") {
    (value as any).excelUrl = (value as any).excelPath;
  }

  // Remove legacy fields so app code doesn't accidentally rely on them.
  if ("pdfPath" in (value as any)) delete (value as any).pdfPath;
  if ("excelPath" in (value as any)) delete (value as any).excelPath;

  return value;
};

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
  // Backend may take a few seconds to parse + generate + upload.
  // Give enough room to avoid client-side timeouts under slow networks.
  timeout: 30000,
});

// Request 인터셉터: Access Token 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    // If using FormData, do NOT force Content-Type.
    // The browser must set `multipart/form-data; boundary=...` automatically.
    const isFormData =
      typeof FormData !== "undefined" &&
      (config.data instanceof FormData ||
        // Some bundlers wrap FormData; fallback check
        (config.data && (config.data as any).constructor?.name === "FormData"));
    if (isFormData) {
      config.headers = config.headers || {};
      delete (config.headers as any)["Content-Type"];
    }

    const token = getAccessToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Trace callers of /histories to catch request loops
    if (isHistoriesDebugEnabled()) {
      try {
        const urlPath = String(config.url || "");
        if (urlPath.includes("/histories")) {
          const now = Date.now();
          // throttle to reduce noise when loops happen
          if (now - lastHistoriesStackLogAt > 1500) {
            lastHistoriesStackLogAt = now;
            console.log("[HistoriesDebug] /histories request stack", {
              method: config.method,
              url: `${config.baseURL || ""}${config.url || ""}`,
              stack: new Error().stack,
            });
          }
        }
      } catch {
        // ignore debug failures
      }
    }

    // Debug: request overview (avoid logging bodies)
    try {
      const url = `${config.baseURL || ""}${config.url || ""}`;
      console.log("[ApiDebug] request", {
        method: config.method,
        url,
        withCredentials: config.withCredentials,
        hasAuthHeader: Boolean((config.headers as any)?.Authorization),
        contentType: (config.headers as any)?.["Content-Type"],
        requestId: (config.headers as any)?.["X-Request-Id"],
      });
    } catch {
      // ignore debug failures
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
    // Debug: response status for observability
    try {
      console.log("[ApiDebug] response", {
        url: response?.config?.url,
        method: response?.config?.method,
        status: response?.status,
      });
    } catch {
      // ignore debug failures
    }

    // Some endpoints (e.g. file download) require full AxiosResponse to read headers.
    if (response?.config && (response.config as any).rawResponse) {
      return response;
    }

    // Normalize known response shapes for frontend compatibility.
    try {
      const urlPath = String(response?.config?.url || "");
      const data = response?.data;

      if (urlPath.includes("/histories")) {
        if (Array.isArray(data)) {
          return data.map((h) => normalizeHistoryLike(h));
        }
        if (data && typeof data === "object") {
          return normalizeHistoryLike(data);
        }
      }

      if (urlPath.includes("/upload") && data && typeof data === "object") {
        return normalizeHistoryLike(data);
      }
    } catch {
      // ignore normalization failures
    }

    return response.data;
  },
  async (error: any) => {
    const originalRequest = error.config;

    // Debug: error details (keep before any transformation)
    try {
      console.error("[ApiDebug] error", {
        url: originalRequest?.url,
        method: originalRequest?.method,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        responseData: error?.response?.data,
      });
    } catch {
      // ignore debug failures
    }

    // 401 에러이고 재시도하지 않은 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log("[ApiDebug] refresh start");
        // Refresh Token으로 새 Access Token 발급
        const refreshBaseUrl =
          API_BASE_URL ||
          (typeof apiClient.defaults.baseURL === "string" ? apiClient.defaults.baseURL : "");
        const response = await axios.post<{ accessToken: string }>(
          `${refreshBaseUrl}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        console.log("[ApiDebug] refresh success", { status: response.status });

        const newAccessToken = response.data.accessToken;
        setAccessToken(newAccessToken);

        // 실패한 요청 재시도
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        try {
          const anyRefreshErr = refreshError as any;
          console.error("[ApiDebug] refresh failed", {
            status: anyRefreshErr?.response?.status,
            responseData: anyRefreshErr?.response?.data,
          });
        } catch {
          // ignore
        }
        // Refresh 실패 시 로그아웃 처리
        removeAccessToken();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    // Preserve AxiosError so callers can inspect status/config/response.
    // Also normalize message when backend provides one.
    const backendMessage = error?.response?.data?.message;
    if (typeof backendMessage === "string" && backendMessage.trim().length > 0) {
      error.message = backendMessage;
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  // 로그인 - POST /auth/login
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    return (await apiClient.post<LoginResponse>("/auth/login", data)) as any as LoginResponse;
  },

  // 회원가입 - POST /auth/signup
  signup: async (data: SignupRequest): Promise<SignupResponse> => {
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);
    if (data.profileImage) {
      formData.append("profileImage", data.profileImage);
    }

    // Do not set Content-Type manually; the browser will add the correct multipart boundary.
    const response = (await apiClient.post<SignupResponse>(
      "/auth/signup",
      formData
    )) as any as SignupResponse;

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
    const response = (await apiClient.get(`/users/${id}`)) as any;

    // 백엔드 응답이 profileImage로 내려오는 경우(profileImageUrl로 정규화)
    if (response && typeof response === "object") {
      const profileImage = (response as any).profileImage;
      const profileImageUrl = (response as any).profileImageUrl;
      if (!profileImageUrl && typeof profileImage === "string") {
        (response as any).profileImageUrl = profileImage;
      }
      delete (response as any).profileImage;
    }

    return response;
  },

  // 유저 정보 수정 - PATCH /users/:id
  // 현재 백엔드는 JSON body로 email/profileImage(URL string)를 받습니다.
  updateUser: async (id: string, data: UpdateUserRequest) => {
    const payload: UpdateUserRequest = {};
    if (typeof data.email === "string") payload.email = data.email;
    if (typeof data.profileImage === "string") payload.profileImage = data.profileImage;

    const response = await apiClient.patch(`/users/${id}`, payload);
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
    // Ensure filename is present for multipart parsers
    formData.append("file", data.file, data.file.name);

    const startedAtMs = Date.now();

    const requestId =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    try {
      console.log("[UploadDebug] api uploadFile", {
        requestId,
        baseURL: API_BASE_URL || "https://talk-vault-back.onrender.com",
        path: "/upload",
        fileName: data.file?.name,
        fileType: data.file?.type,
        fileSize: data.file?.size,
      });
    } catch {
      // ignore debug failures
    }

    // Do not set Content-Type manually; the browser will add the correct multipart boundary.
    const uploadUrl = `/upload?requestId=${encodeURIComponent(requestId)}`;

    const fileName = data.file?.name;
    const fileSize = data.file?.size;

    const recoverFromHistories = async (reason: string): Promise<FileUploadResponse | null> => {
      const tryFindLatestMatch = async (): Promise<FileUploadResponse | null> => {
        const histories = await uploadApi.getHistories();
        const candidates = histories
          .filter((h) => {
            if (!h) return false;
            if (h.originalFileName !== fileName) return false;
            if (h.fileSize !== fileSize) return false;

            // createdAt comes from backend; tolerate string/Date.
            const createdAtMs = new Date((h as any).createdAt).getTime();
            // Only consider items created around this upload attempt (avoid picking old duplicates).
            return createdAtMs >= startedAtMs - 2 * 60 * 1000;
          })
          .sort((a, b) => {
            const ta = new Date((a as any).createdAt).getTime();
            const tb = new Date((b as any).createdAt).getTime();
            return tb - ta;
          });

        const latest = candidates[0];
        return latest ? (latest as any as FileUploadResponse) : null;
      };

      const delays = [0, 400, 800, 1500, 2500, 4000];
      for (const delayMs of delays) {
        if (delayMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }

        try {
          const found = await tryFindLatestMatch();
          if (found) {
            console.warn("[UploadDebug] recovered upload via /histories", {
              reason,
              requestId,
              fileName,
              fileSize,
              recoveredId: (found as any).id,
              elapsedMs: Date.now() - startedAtMs,
            });
            return found;
          }
        } catch {
          // ignore and retry (eventual consistency)
        }
      }

      return null;
    };

    try {
      const response = (await apiClient.post<FileUploadResponse>(uploadUrl, formData)) as any;

      // Happy path: backend returns the created history in the response body.
      if (response && typeof response === "object" && typeof (response as any).id === "string") {
        return response as FileUploadResponse;
      }

      // Some deployments can successfully process the upload but respond with an empty/invalid body.
      const recovered = await recoverFromHistories("empty-or-invalid-response-body");
      if (recovered) return recovered;

      throw new Error(
        "업로드 요청은 처리되었을 수 있지만 응답을 확인하지 못했습니다. 마이페이지에서 변환 기록을 확인해주세요."
      );
    } catch (e) {
      const anyErr = e as any;
      const isNetworkLikeFailure =
        !anyErr?.response ||
        anyErr?.code === "ECONNABORTED" ||
        String(anyErr?.message || "")
          .toLowerCase()
          .includes("network");

      // If the connection dropped or timed out, the server may still have finished processing.
      if (isNetworkLikeFailure) {
        const recovered = await recoverFromHistories("network-or-timeout");
        if (recovered) return recovered;
      }

      throw e;
    }
  },

  // 히스토리 목록 조회 - GET /histories
  getHistories: async (): Promise<History[]> => {
    if (isHistoriesDebugEnabled()) {
      try {
        const stack = new Error().stack;
        console.log("[HistoriesDebug] getHistories called", {
          at: new Date().toISOString(),
          stack,
        });
      } catch {
        // ignore debug failures
      }
    }

    const response = (await apiClient.get<History[]>("/histories")) as any as History[];
    return response;
  },

  // 특정 히스토리 조회 (목록에서 필터링)
  // NOTE: 일부 백엔드/배포에서는 /upload 응답의 식별자와 /histories의 id가 다를 수 있어
  // result 라우트 파라미터가 History.id 또는 History.savedFileName 둘 다일 수 있습니다.
  getHistoryById: async (key: string): Promise<History | null> => {
    const histories = await uploadApi.getHistories();

    const normalizeKey = (v: string) => v.replace(/\.(pdf|xlsx?)$/i, "");
    const rawKey = String(key || "");
    const normalizedKey = normalizeKey(rawKey);

    const history = histories.find((h: History) => {
      const id = String((h as any).id || "");
      const saved = String((h as any).savedFileName || "");
      const pdfUrl = String((h as any).pdfUrl || "");
      const excelUrl = String((h as any).excelUrl || "");

      return (
        id === rawKey ||
        id === normalizedKey ||
        saved === rawKey ||
        saved === normalizedKey ||
        (rawKey.length > 0 && (pdfUrl.includes(rawKey) || excelUrl.includes(rawKey))) ||
        (normalizedKey.length > 0 &&
          (pdfUrl.includes(normalizedKey) || excelUrl.includes(normalizedKey)))
      );
    });

    return history || null;
  },

  // 파일 다운로드 - GET /histories/:id/download
  downloadFile: async (id: string): Promise<{ blob: Blob; fileName: string }> => {
    const axiosResponse = (await apiClient.get(`/histories/${id}/download`, {
      responseType: "blob",
      // custom flag handled by response interceptor
      rawResponse: true,
    } as any)) as any;

    const blob = axiosResponse.data as Blob;

    const contentDisposition: string | undefined =
      axiosResponse?.headers?.["content-disposition"] ||
      axiosResponse?.headers?.["Content-Disposition"];

    let fileName = "download";
    if (typeof contentDisposition === "string") {
      // Examples:
      // attachment; filename="foo.xlsx"
      // attachment; filename=foo.xlsx
      const match = contentDisposition.match(/filename\*?=([^;]+)/i);
      if (match?.[1]) {
        fileName = match[1].trim();
        fileName = fileName.replace(/^UTF-8''/i, "");
        fileName = fileName.replace(/^"|"$/g, "");
        try {
          fileName = decodeURIComponent(fileName);
        } catch {
          // ignore decoding errors
        }
      }
    }

    return { blob, fileName };
  },

  // 히스토리 삭제 - DELETE /histories/:id
  deleteHistory: async (id: string): Promise<void> => {
    await apiClient.delete<void>(`/histories/${id}`);
  },
};

export default apiClient;
