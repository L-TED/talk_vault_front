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
      console.log("1️⃣ 로그인 시작");
      const loginData: LoginRequest = { email, password };
      const response = await authApi.login(loginData);

      console.log("2️⃣ 응답 받음:", response);

      // 토큰 저장
      setAccessToken(response.accessToken);
      console.log("3️⃣ AccessToken 저장 완료");

      // Zustand 스토어에 유저 정보 저장
      setUser(response.user);
      console.log("4️⃣ User 정보 저장 완료");

      toast.success("로그인에 성공했습니다!");
      console.log("5️⃣ Toast 표시 완료");

      // /mypage로 이동
      console.log("6️⃣ router.push 실행 직전");
      router.push("/mypage");
      console.log("7️⃣ router.push 실행 완료");
    } catch (err) {
      console.error("❌ 에러 발생:", err);
      const errorMsg = "로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      console.log("8️⃣ finally 블록");
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
