export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-rose-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-stone-800">Text Converting Tool</h1>
        <p className="text-stone-600 mb-4">텍스트를 PDF와 엑셀로 변환해드립니다!</p>
        <div className="flex flex-col gap-4">
          <a
            href="/login"
            className="inline-block px-4 py-2 bg-amber-200 text-stone-800 font-semibold rounded hover:bg-amber-300 transition-colors"
          >
            로그인하기
          </a>
          <a
            href="/signup"
            className="inline-block px-4 py-2 bg-amber-200 text-stone-800 font-semibold rounded hover:bg-amber-300 transition-colors"
          >
            회원가입하기
          </a>
        </div>
      </div>
    </div>
  );
}
