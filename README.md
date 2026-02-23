# 💰 머니투게더 (Money Together)

> 부부가 함께 쓰는 실시간 공유 가계부

부부가 함께 쓰는 **공유 가계부 웹 앱**입니다.  
지출·수입·저축·투자 내역을 함께 기록하고, 카테고리별 통계와 월별 소비 패턴을 한눈에 파악할 수 있습니다.

---

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| **대시보드** | 월 예산 대비 지출 현황, 멤버별 지출 비중 시각화 |
| **내역 입력** | 커스텀 숫자 키패드 · 카테고리 선택 · 멤버 지정 |
| **거래 내역** | 날짜·멤버·카테고리 그룹별 필터링, 리스트/달력 뷰 전환 |
| **통계** | 카테고리별·월별 소비 추이 차트 (Recharts) |
| **초대 / 온보딩** | QR 코드 기반 그룹 초대, 신규 가구 생성 플로우 |
| **실시간 동기화** | Supabase Realtime으로 양쪽 디바이스 즉시 반영 |

---

## 🛠️ 기술 스택

| 영역 | 기술 |
|------|------|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS, Framer Motion |
| **UI Components** | shadcn/ui, Radix UI, Lucide React |
| **Charts** | Recharts |
| **Backend / DB** | [Supabase](https://supabase.com/) (PostgreSQL, Realtime, Auth) |
| **Deploy** | Vercel (권장) |

---

## 🗄️ 데이터베이스 구조

```
groups          -- 가구(부부) 그룹
members         -- 그룹 내 구성원 (남편 / 아내)
categories      -- 지출 카테고리 (식비, 교통, 카페, 생활, 주거, 병원, 기타 등)
transactions    -- 거래 내역 (금액, 카테고리, 멤버, 날짜, 설명)
```

스키마 전체는 [`supabase-schema.sql`](./supabase-schema.sql)을 참고하세요.

---

## 🚀 시작하기

### 1. 저장소 클론

```bash
git clone https://github.com/<your-username>/money-together.git
cd money-together
```

### 2. 패키지 설치

```bash
npm install
# 또는
yarn install
```

### 3. 환경 변수 설정

`.env.local` 파일을 생성하고 아래 값을 입력합니다.

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Supabase 데이터베이스 세팅

Supabase 대시보드 → SQL Editor에서 [`supabase-schema.sql`](./supabase-schema.sql) 전체를 실행합니다.

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인합니다.

---

## 📁 프로젝트 구조

```
money-together/
├── app/
│   ├── (main)/
│   │   ├── page.tsx          # 대시보드 (홈)
│   │   ├── add/              # 내역 입력
│   │   ├── history/          # 거래 내역
│   │   ├── stats/            # 통계
│   │   ├── invite/           # 초대 (QR)
│   │   └── profile/          # 프로필
│   ├── login/                # 로그인
│   └── onboarding/           # 온보딩 (그룹 생성)
├── components/
│   ├── dashboard/            # 대시보드 컴포넌트
│   ├── entry/                # 내역 입력 컴포넌트
│   ├── history/              # 거래 내역 컴포넌트
│   ├── stats/                # 통계 컴포넌트
│   └── ui/                   # 공통 UI (shadcn/ui)
├── lib/
│   └── supabase/             # Supabase 클라이언트 & 쿼리
├── types/                    # TypeScript 타입 정의
└── supabase-schema.sql       # DB 스키마
```

---

## 🎨 디자인 컨셉

- **Apple 미니멀리즘** 스타일 — iOS 순정 앱 감성
- 배경: `#F5F5F7` (Light Gray) / 카드: `#FFFFFF`
- 포인트 컬러: Deep Blue
- 모든 카드·버튼에 `rounded-2xl` 이상의 둥근 모서리
- 하단 탭 바에 **Glassmorphism** (Backdrop Blur) 효과

---

## 📜 라이선스

Private project — All rights reserved.
