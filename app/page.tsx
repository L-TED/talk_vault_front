export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-rose-50">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold mb-4 text-amber-800">Talk Vault</h1>
        <p className="text-amber-700 mb-4">텍스트를 PDF와 엑셀로 변환해드립니다!</p>
        <div className="flex flex-col gap-4">
          <a
            href="/login"
            className="inline-block px-4 py-2 bg-amber-100 text-amber-900 font-bold rounded hover:bg-amber-200 transition-colors"
          >
            로그인하기
          </a>
          <a
            href="/signup"
            className="inline-block px-4 py-2 bg-amber-100 text-amber-900 font-bold rounded hover:bg-amber-200 transition-colors"
          >
            회원가입하기
          </a>
        </div>
      </div>
    </div>
  );
}
