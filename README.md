# TalkVault (KakaoTalk Conversation Converter) - Frontend

카카오톡 대화 텍스트(.txt)를 업로드/붙여넣기해 PDF/Excel로 변환하고, 변환 이력 조회/다운로드/삭제까지 제공하는 Next.js 프론트엔드입니다.

## ✅ What I Built

- 인증: Access Token(`sessionStorage`) + 401 시 Refresh 재발급(axios interceptor)
- 업로드: 텍스트 붙여넣기 또는 `.txt` 파일 업로드(파일 선택 + 드래그&드롭)
- 결과: `/histories` 기반으로 결과 조회 후 다운로드
- 마이페이지: 이력 목록 조회, 다운로드, 삭제(DELETE API 연동)

## 🧰 Tech Stack

- **Next.js:** 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **State:** Zustand (유저 프로필/인증 상태)
- **HTTP:** Axios (withCredentials)
- **UI Feedback:** react-toastify

## 🗺️ Routing

- `/` : 랜딩(로그인/회원가입 이동)
- `/login` : 로그인
- `/signup` : 회원가입
- `/home` : 변환 메인(텍스트/파일 입력)
- `/result/[id]` : 변환 결과(상태 확인/다운로드)
- `/mypage` : 히스토리 목록(다운로드/삭제)

> 참고: `(protected)` 그룹 라우트가 존재하지만, 현재 `middleware.ts`에서 서버 사이드 보호를 강제하지 않습니다. 인증 실패 처리(401)는 클라이언트의 axios interceptor가 담당합니다.

## 🔐 인증/토큰 처리 방식

- **Access Token**
  - 로그인 성공 시 발급된 토큰을 `sessionStorage`(+메모리 캐시)에 저장합니다.
  - API 요청 시 `Authorization: Bearer <token>` 헤더로 전송합니다.
- **Refresh Token**
  - `HttpOnly Cookie` 기반으로 동작한다고 가정하고, `withCredentials: true`로 요청합니다.
- **자동 갱신**
  - API 응답이 401이고 재시도 이력이 없으면 `/auth/refresh`를 호출해 토큰을 갱신한 뒤 원 요청을 재시도합니다.
  - Refresh도 실패하면 토큰을 제거하고 `/login`으로 이동합니다.

## 📦 API 계약(프론트가 사용하는 엔드포인트)

환경변수 `NEXT_PUBLIC_API_URL`을 baseURL로 사용합니다.

- Auth
  - `POST /auth/login`
  - `POST /auth/signup` (multipart/form-data)
  - `POST /auth/logout`
  - `POST /auth/refresh`
- Upload/History
  - `POST /upload` (multipart/form-data)
  - `GET /histories`
  - `GET /histories/:id/download` (서버가 URL이면 redirect 가능)
  - `DELETE /histories/:id`

> 데이터는 `pdfUrl/excelUrl`(public URL) 기반으로 처리합니다.

## 🚀 Getting Started

### Prerequisites

```bash
Node.js 18+
```

### Install

```bash
npm install
```

### Environment Variables

`.env`에 아래 값을 설정합니다.

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

> 운영 환경에서 `NEXT_PUBLIC_API_URL`이 없으면 빌드/런타임에서 명확한 에러를 내도록 되어 있습니다.

### Run

```bash
npm run dev
```

## 🧱 Directory Guide

```text
app/
  page.tsx                   # 랜딩
  (auth)/
    login/page.tsx
    signup/page.tsx
  (protected)/
    home/page.tsx            # 변환 메인
    result/[id]/page.tsx     # 변환 결과/다운로드
    mypage/page.tsx          # 히스토리 목록

components/
  auth/                      # LoginForm, SignupForm
  upload/                    # FileUploader(업로드/변환 요청)
  mypage/                    # HistoryTable
  common/                    # Button/Input 등

lib/
  api.ts                     # axios 인스턴스 + interceptor
  auth.ts                    # access token 저장(sessionStorage)

store/
  auth.store.ts              # Zustand auth store

hooks/
  useLoginForm.ts
  useSignupForm.ts
  useHistory.ts
  useCommon.ts
```

## 📝 Notes / TODO

- `/upload` 라우트는 현재 플레이스홀더(실제 업로드/변환은 `/home`에서 수행)
- 결과 페이지는 `/histories` 목록에서 단건을 찾아 사용(백엔드 단건 조회 API 미사용)
- 디버깅은 UI 오버레이 없이 콘솔 로그만 사용

## 📄 License

This project is private and proprietary.
