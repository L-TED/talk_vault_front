"use client";

import Button from "@/components/common/Button";
import { useSignupForm } from "@/hooks/useSignupForm";

const SignupForm = () => {
  const {
    // useHooks
    email,
    password,
    confirmPassword,
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
    // 유효성 상태
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
    // 액션
    handleSignup,
  } = useSignupForm();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800">회원가입</h1>
        </div>

        <div className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <input
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="이메일을 입력하세요"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="mt-2 text-sm">
              <div
                className={`flex items-center gap-2 ${
                  isEmailValid
                    ? "text-blue-600"
                    : isEmailInvalid
                    ? "text-orange-500"
                    : "text-gray-500"
                }`}
              >
                {isEmailValid && <span>✓</span>}
                {isEmailInvalid && <span>✗</span>}
                <span>이메일 형식: example@domain.com</span>
              </div>
            </div>
          </div>

          <div>
            <div className="relative">
              <input
                className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="비밀번호를 입력하세요"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-600 hover:text-gray-800"
              >
                {showPassword ? "숨기기" : "보기"}
              </button>
            </div>
            <div className="mt-2 text-sm space-y-1">
              <div
                className={`flex items-center gap-2 ${
                  isPasswordTouched
                    ? hasValidLength
                      ? "text-blue-600"
                      : "text-orange-500"
                    : "text-gray-500"
                }`}
              >
                {isPasswordTouched && (hasValidLength ? <span>✓</span> : <span>✗</span>)}
                <span>길이: 8-20자</span>
              </div>
              <div
                className={`flex items-center gap-2 ${
                  isPasswordTouched
                    ? hasEnglish
                      ? "text-blue-600"
                      : "text-orange-500"
                    : "text-gray-500"
                }`}
              >
                {isPasswordTouched && (hasEnglish ? <span>✓</span> : <span>✗</span>)}
                <span>영문</span>
              </div>
              <div
                className={`flex items-center gap-2 ${
                  isPasswordTouched
                    ? hasNumber
                      ? "text-blue-600"
                      : "text-orange-500"
                    : "text-gray-500"
                }`}
              >
                {isPasswordTouched && (hasNumber ? <span>✓</span> : <span>✗</span>)}
                <span>숫자 포함</span>
              </div>
              <div
                className={`flex items-center gap-2 ${
                  isPasswordTouched
                    ? hasSpecialChar
                      ? "text-blue-600"
                      : "text-orange-500"
                    : "text-gray-500"
                }`}
              >
                {isPasswordTouched && (hasSpecialChar ? <span>✓</span> : <span>✗</span>)}
                <span>특수문자(@$!%*#?&) 포함</span>
              </div>
              <div
                className={`flex items-center gap-2 ${
                  isPasswordTouched
                    ? hasOnlyAllowedChars
                      ? "text-blue-600"
                      : "text-orange-500"
                    : "text-gray-500"
                }`}
              >
                {isPasswordTouched && (hasOnlyAllowedChars ? <span>✓</span> : <span>✗</span>)}
                <span>영문, 숫자, 특수문자만 사용</span>
              </div>
            </div>
          </div>

          <div>
            <div className="relative">
              <input
                className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="비밀번호를 재입력하세요"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-600 hover:text-gray-800"
              >
                {showConfirmPassword ? "숨기기" : "보기"}
              </button>
            </div>
            {isPasswordMismatch && (
              <div className="mt-2 text-sm text-orange-500 flex items-center gap-2">
                <span>✗</span>
                <span>비밀번호가 일치하지 않습니다</span>
              </div>
            )}
            {isPasswordMatch && (
              <div className="mt-2 text-sm text-blue-600 flex items-center gap-2">
                <span>✓</span>
                <span>비밀번호가 일치합니다</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              프로필 사진 (선택사항)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div>
            <button
              onClick={handleSignup}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? "회원가입 중..." : "회원가입"}
            </button>
          </div>

          <div>
            <a href="/login">
              <Button
                style="w-full px-4 py-3 bg-white text-blue-600 font-semibold border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                text="로그인으로 돌아가기"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
