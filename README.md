# TalkVault (KakaoTalk Conversation Converter) - Frontend

카카오톡 대화 텍스트(.txt)를 업로드/붙여넣기하여 PDF 및 Excel 파일로 변환하고, 변환 히스토리를 조회/다운로드하는 프론트엔드 애플리케이션입니다.

## ✅ 현재 구현 상태

- 로그인/회원가입 UI 및 폼 유효성 검사
- Access Token 기반 API 호출 + 401 발생 시 Refresh로 자동 갱신(axios interceptor)
- 대화 텍스트 붙여넣기 또는 `.txt` 파일 업로드 → 변환 요청
- 결과 페이지에서 변환 상태 폴링 후 파일 다운로드
- 마이페이지에서 변환 히스토리 목록 조회 및 다운로드

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
- `/mypage` : 히스토리 목록(다운로드, 삭제는 현재 로컬 처리)

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
  - `POST /upload` (multipart/form-data)
  - `GET /histories` (결과 페이지는 여기서 id로 검색/폴링)
  - `GET /histories/:id/download` (파일 다운로드)

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

- 마이페이지 삭제 버튼은 현재 로컬 상태에서만 제거(TODO: 실제 DELETE API 연동)
- `/upload` 라우트는 현재 플레이스홀더

## 📄 License

This project is private and proprietary.
