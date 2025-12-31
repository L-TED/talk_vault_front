import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { setAccessToken } from "@/lib/auth";
import type { SignupRequest } from "@/types/auth.types";
import { toast } from "react-toastify";

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
      const errorMsg = "모든 필드를 올바르게 입력해주세요.";
      setError(errorMsg);
      toast.error(errorMsg);
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

      console.log("🚀 회원가입 요청 데이터:", {
        email,
        password,
        profileImage: profileImage?.name,
      });

      const response = await authApi.signup(signupData);

      console.log("✅ 회원가입 응답:", response);

      toast.success("회원가입에 성공했습니다!");

      // 로그인 페이지로 이동
      router.push("/login");
    } catch (err: any) {
      console.error("❌ 회원가입 에러:", err);
      console.error("에러 상세:", err.response?.data || err.message);

      const errorMsg =
        err.response?.data?.message || err.message || "회원가입에 실패했습니다. 다시 시도해주세요.";
      setError(errorMsg);
      toast.error(errorMsg);
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
