import axios from 'axios';
import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
} from '@/types/auth.types';
import type {
  FileUploadRequest,
  FileUploadResponse,
  History,
} from '@/types/upload.types';

// Client용 Axios 인스턴스 (withCredentials)
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock API 함수들 (추후 실제 API로 교체)

export const authApi = {
  // 로그인
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          token: 'mock-jwt-token-12345',
          user: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: data.email,
            profile_image: undefined,
            created_at: new Date(),
          },
        });
      }, 1000);
    });
  },

  // 회원가입
  signup: async (data: SignupRequest): Promise<SignupResponse> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          token: 'mock-jwt-token-67890',
          user: {
            id: '123e4567-e89b-12d3-a456-426614174001',
            email: data.email,
            profile_image: data.profile_image ? 'mock-profile-url.jpg' : undefined,
            created_at: new Date(),
          },
        });
      }, 1000);
    });
  },

  // 로그아웃
  logout: async (): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 500);
    });
  },
};

export const uploadApi = {
  // 파일 업로드
  uploadFile: async (data: FileUploadRequest): Promise<FileUploadResponse> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          history: {
            id: '456e4567-e89b-12d3-a456-426614174002',
            user_id: '123e4567-e89b-12d3-a456-426614174000',
            title: data.title || '제목 없음',
            source: data.source,
            file_type: data.file_type,
            file_path: 'mock-file-path.pdf',
            created_at: new Date(),
          },
        });
      }, 1000);
    });
  },

  // 히스토리 목록 조회
  getHistories: async (): Promise<History[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '456e4567-e89b-12d3-a456-426614174002',
            user_id: '123e4567-e89b-12d3-a456-426614174000',
            title: '카카오톡 대화 변환',
            source: 'kakao',
            file_type: 'pdf',
            file_path: 'mock-file-1.pdf',
            created_at: new Date('2025-12-29'),
          },
          {
            id: '456e4567-e89b-12d3-a456-426614174003',
            user_id: '123e4567-e89b-12d3-a456-426614174000',
            title: '슬랙 대화 변환',
            source: 'slack',
            file_type: 'excel',
            file_path: 'mock-file-2.xlsx',
            created_at: new Date('2025-12-28'),
          },
        ]);
      }, 1000);
    });
  },

  // 특정 히스토리 조회
  getHistoryById: async (id: string): Promise<History> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: id,
          user_id: '123e4567-e89b-12d3-a456-426614174000',
          title: '카카오톡 대화 변환',
          source: 'kakao',
          file_type: 'pdf',
          file_path: 'mock-file-1.pdf',
          created_at: new Date('2025-12-29'),
        });
      }, 1000);
    });
  },

  // 파일 다운로드
  downloadFile: async (id: string): Promise<Blob> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock Blob 데이터
        const blob = new Blob(['Mock file content'], { type: 'application/pdf' });
        resolve(blob);
      }, 1000);
    });
  },
};

export default apiClient;
