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
  return user?.profileImageUrl || "/default-profile.png";
};
