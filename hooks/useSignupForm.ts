import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { setAccessToken } from "@/lib/auth";
import type { SignupRequest } from "@/types/auth.types";

export const useSignupForm = () => {
  const router = useRouter();
  const { setUser } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 유효성 검사 정규식
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const hasValidLength = password.length >= 8 && password.length <= 20;
  const hasEnglish = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[@$!%*#?&]/.test(password);
  const hasOnlyAllowedChars = /^[a-zA-Z0-9@$!%*#?&]*$/.test(password);

  // 개별 유효성 상태
  const isEmailValid = email.length > 0 && emailRegex.test(email);
  const isEmailInvalid = email.length > 0 && !emailRegex.test(email);
  const isPasswordTouched = password.length > 0;
  const isPasswordValid =
    hasValidLength && hasEnglish && hasNumber && hasSpecialChar && hasOnlyAllowedChars;
  const isPasswordMatch = confirmPassword.length > 0 && password === confirmPassword;
  const isPasswordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  // 폼 전체 유효성
  const isFormValid = isEmailValid && isPasswordValid && isPasswordMatch;

  const handleSignup = async () => {
    if (!isFormValid) {
      setError("모든 필드를 올바르게 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const signupData: SignupRequest = {
        email,
        password,
        profileImage: profileImage || undefined,
      };

      const response = await authApi.signup(signupData);

      // 토큰 저장
      setAccessToken(response.token);

      // Zustand 스토어에 유저 정보 저장
      setUser(response.user);

      // /mypage로 이동
      router.push("/mypage");
    } catch (err) {
      setError("회원가입에 실패했습니다. 다시 시도해주세요.");
      console.error("Signup error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // 상태값
    email,
    password,
    confirmPassword,
    profileImage,
    showPassword,
    showConfirmPassword,
    isLoading,
    error,

    // 상태 변경 함수
    setEmail,
    setPassword,
    setConfirmPassword,
    setProfileImage,
    setShowPassword,
    setShowConfirmPassword,

    // 유효성 검사 결과
    isEmailValid,
    isEmailInvalid,
    hasValidLength,
    hasEnglish,
    hasNumber,
    hasSpecialChar,
    hasOnlyAllowedChars,
    isPasswordTouched,
    isPasswordMatch,
    isPasswordMismatch,
    isFormValid,

    // 액션
    handleSignup,
  };
};
