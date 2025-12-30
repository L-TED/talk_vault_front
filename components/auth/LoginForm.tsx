import Input from "@/components/common/Input";
import Button from "@/components/common/Button";

const LoginForm = () => {
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
            />
          </div>

          <div>
            <Input
              style="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              text="비밀번호를 입력하세요"
              type="password"
            />
          </div>

          <div>
            <Button
              style="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              text="로그인"
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
