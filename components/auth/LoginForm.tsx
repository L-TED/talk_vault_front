"use client";

import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import { useLoginForm } from "@/hooks/useLoginForm";

const LoginForm = () => {
  const { email, password, isLoading, error, setEmail, setPassword, handleLogin } = useLoginForm();

  return (
    <div className="min-h-screen flex items-center justify-center bg-rose-50">
      <div className="w-full max-w-md px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-amber-800">로그인</h1>
        </div>

        <div className="space-y-5">
          <div>
            <Input
              style="w-full px-4 py-3 border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent text-amber-900 placeholder:text-amber-600"
              text="이메일을 입력하세요"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <Input
              style="w-full px-4 py-3 border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent text-amber-900 placeholder:text-amber-600"
              text="비밀번호를 입력하세요"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <div className="text-amber-700 text-sm text-center">{error}</div>}

          <div>
            <Button
              style="w-full px-4 py-3 bg-amber-100 text-amber-900 font-bold rounded-lg hover:bg-amber-200 transition-colors disabled:bg-stone-200 disabled:text-amber-700 disabled:cursor-not-allowed"
              text={isLoading ? "로그인 중..." : "로그인"}
              onClick={handleLogin}
              disabled={isLoading}
            />
          </div>

          <div>
            <a href="/signup">
              <Button
                style="w-full px-4 py-3 bg-white text-amber-900 font-bold border-2 border-amber-100 rounded-lg hover:bg-rose-100 transition-colors"
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
