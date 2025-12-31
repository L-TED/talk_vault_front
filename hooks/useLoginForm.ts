import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { setAccessToken } from "@/lib/auth";
import type { LoginRequest } from "@/types/auth.types";
import { toast } from "react-toastify";

// 로그인 기능을 수행하는 useAuth 커스텀 훅 생성
// 로그인 성공 시 store/auth.ts에 유저 정보를 저장하고 /mypage로 이동하는 로직

export const useLoginForm = () => {
  const router = useRouter();
  const { setUser } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      const errorMsg = "이메일과 비밀번호를 입력해주세요.";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const loginData: LoginRequest = { email, password };
      const response = await authApi.login(loginData);

      console.log("✅ Login successful:", response);

      // 토큰 저장
      setAccessToken(response.accessToken);

      // Zustand 스토어에 유저 정보 저장
      setUser(response.user);

      toast.success("로그인에 성공했습니다!");

      console.log("🔄 Redirecting to /mypage...");

      // 즉시 리다이렉트 (finally 실행 전에)
      setTimeout(() => {
        window.location.replace("/mypage");
      }, 100);

      // return으로 finally 블록 실행 방지
      return;
    } catch (err) {
      const errorMsg = "로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.";
      setError(errorMsg);
      toast.error(errorMsg);
      console.error("Login error:", err);
      setIsLoading(false);
    }
  };

  return {
    email,
    password,
    isLoading,
    error,
    setEmail,
    setPassword,
    handleLogin,
  };
};
