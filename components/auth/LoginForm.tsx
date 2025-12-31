"use client";

import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import { useLoginForm } from "@/hooks/useLoginForm";

const LoginForm = () => {
  const { email, password, isLoading, error, setEmail, setPassword, handleLogin } = useLoginForm();

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800">로그인</h1>
        </div>

        <div className="space-y-5">
          <div>
            <Input
              style="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              text="이메일을 입력하세요"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <Input
              style="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              text="비밀번호를 입력하세요"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <div className="text-red-500 text-sm text-center">{error}</div>}

          <div>
            <Button
              style="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              text={isLoading ? "로그인 중..." : "로그인"}
              onClick={handleLogin}
              disabled={isLoading}
            />
          </div>

          <div>
            <a href="/signup">
              <Button
                style="w-full px-4 py-3 bg-white text-blue-600 font-semibold border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                text="회원가입"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
