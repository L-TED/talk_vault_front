import { useAuthStore } from "@/store/auth.store";

// 그 외 공통 훅

// 현재 로그인한 유저 정보 가져오기
export const useCurrentUser = () => {
  const { user, isAuthenticated } = useAuthStore();
  return { user, isAuthenticated };
};

// 프로필 이미지 URL 가져오기
export const useProfileImage = () => {
  const { user } = useAuthStore();
  // 기본 프로필 이미지: 회색 원 + 사람 아이콘 (SVG data URL)
  const defaultAvatar =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23E5E7EB'/%3E%3Cpath d='M20 20c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z' fill='%239CA3AF'/%3E%3C/svg%3E";
  return user?.profileImageUrl || defaultAvatar;
};
