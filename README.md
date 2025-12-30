# KakaoTalk Conversation Converter

카카오톡 대화 내용을 분석하여 엑셀 파일로 변환하고, 변환 기록을 관리하는 웹 애플리케이션입니다.

## 📋 Project Overview

### Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **HTTP Client:** Axios
- **Authentication:** JWT (Access/Refresh Token)

### Core Features

- 카카오톡 대화 텍스트 붙여넣기 및 분석
- 분석된 데이터를 엑셀 파일로 변환
- 변환 기록(History) 관리 (조회, 다운로드, 삭제)
- 사용자 인증 및 권한 관리

## 🏗️ Architecture

### Directory Structure

```
converting_txt_front/
├── app/                      # Next.js App Router
│   ├── (auth)/              # 인증 관련 페이지
│   │   ├── login/           # 로그인 페이지
│   │   └── signup/          # 회원가입 페이지
│   ├── (protected)/         # 인증 필요 페이지
│   │   ├── mypage/          # 마이페이지 (메인)
│   │   ├── upload/          # 업로드 페이지
│   │   └── result/[id]/     # 변환 결과 상세
│   ├── layout.tsx           # 루트 레이아웃
│   └── page.tsx             # 홈 페이지
│
├── components/              # React 컴포넌트
│   ├── auth/               # 인증 관련 컴포넌트
│   ├── mypage/             # 마이페이지 컴포넌트
│   └── upload/             # 업로드 관련 컴포넌트
│
├── lib/                     # 유틸리티 & API
│   ├── api.ts              # Axios 인스턴스
│   ├── auth.ts             # 토큰 관리
│   └── utils.ts            # 헬퍼 함수
│
├── store/                   # 전역 상태 관리
│   └── auth.store.ts       # 인증 상태
│
├── types/                   # TypeScript 타입
│   └── types.ts            # 공통 타입 정의
│
└── middleware.ts            # 인증 미들웨어
```

### Component Responsibility

- **Server Components:** 데이터 페칭, 보안 로직 처리
- **Client Components:** 사용자 인터랙션, 상태 관리
- **Middleware:** 토큰 기반 인증 및 페이지 접근 제어

## 🔐 Authentication Flow

### Sign In

1. 이메일/비밀번호로 로그인 요청
2. 성공 시 Access Token & Refresh Token 발급
3. 토큰 저장 및 사용자 정보 조회
4. MyPage로 자동 이동
5. 실패 시 에러 메시지 표시

### Sign Up

1. 필수 입력: 이메일, 비밀번호
2. 선택 입력: 프로필 이미지
3. 회원가입 성공 시 로그인 페이지로 이동

### Token Management

- **Access Token:** API 요청 시 Authorization 헤더에 포함
- **Refresh Token:** Access Token 만료 시 자동 갱신
- **Storage:** Access Token은 메모리, Refresh Token은 HttpOnly Cookie

## 📱 Main Features

### 1. Text Upload & Conversion

- 카카오톡 대화 텍스트 붙여넣기
- 백엔드 API를 통한 데이터 분석
- 날짜, 발신자, 메시지 내용 추출
- 엑셀 파일 생성 및 저장

### 2. History Management

- 변환 기록 리스트 조회 (최신순 정렬)
- 필터링 옵션: 태그, 날짜, 내용
- Gmail 스타일 UI/UX
- 각 기록별 액션:
  - 📥 엑셀 파일 다운로드
  - 🗑️ 기록 삭제
  - 👁️ 상세 내용 보기

### 3. User Profile

- 프로필 정보 조회 및 수정
- 프로필 이미지 업로드
- 비밀번호 변경

## 🗄️ Database Schema (Backend Reference)

### Users Table

- `id` (PK)
- `email` (Unique)
- `password` (Hashed)
- `profileImage` (Optional)
- `createdAt`, `updatedAt`

### RefreshTokens Table

- `id` (PK)
- `userId` (FK)
- `token`
- `expiresAt`

### Histories Table

- `id` (PK)
- `userId` (FK)
- `tag` (카테고리/태그)
- `content` (텍스트 내용)
- `excelPath` (생성된 파일 경로)
- `createdAt`, `updatedAt`

## 🚀 Getting Started

### Prerequisites

```bash
Node.js 18+
npm or yarn or pnpm
```

### Installation

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env
```

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
npm start
```

## 📝 API Endpoints (Backend)

### Authentication

- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `POST /api/auth/refresh` - 토큰 갱신

### User

- `GET /api/users/me` - 내 정보 조회
- `PATCH /api/users/me` - 내 정보 수정

### History

- `GET /api/histories` - 변환 기록 목록
- `POST /api/histories` - 새 변환 작업
- `GET /api/histories/:id` - 특정 기록 조회
- `DELETE /api/histories/:id` - 기록 삭제
- `GET /api/histories/:id/download` - 엑셀 파일 다운로드

## 🎨 UI/UX Guidelines

- **Design System:** Tailwind CSS 기반 커스텀 디자인
- **Responsive:** 모바일, 태블릿, 데스크톱 대응
- **Accessibility:** ARIA 속성 및 키보드 네비게이션 지원
- **Loading States:** 스켈레톤 UI 및 로딩 인디케이터
- **Error Handling:** 사용자 친화적 에러 메시지

## 📄 License

This project is private and proprietary.

## 🤝 Contributing

Contact the project maintainer for contribution guidelines.
