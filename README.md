# 💰 머니투게더 (Money Together)

> 부부가 함께 사용하는 실시간 공유 가계부 웹 앱

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Realtime-3ECF8E?logo=supabase)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com/)

**배포 주소** → `https://money-together.vercel.app`

---

## 🔐 테스트 계정

직접 서비스를 체험해 보실 수 있도록 테스트 계정을 제공합니다.

| 항목 | 값 |
|------|-----|
| **이메일** | `test@nav.com` |
| **비밀번호** | `12341234` |

> ℹ️ 해당 계정에는 실제 사용 흐름을 체험할 수 있도록 샘플 데이터가 입력되어 있습니다.

---

## 📌 프로젝트 개요

**머니투게더**는 부부가 기존에 '공유 엑셀'로 가계부를 관리하며 겪었던 동기화 지연 및 모바일 접근성의 불편함을 해결하기 위해 시작된 **모바일 반응형 웹 앱** 프로젝트입니다. 

한 명이 스마트폰으로 지출을 입력하면 상대방 디바이스에 **실시간으로 즉시 반영**되어 번거로운 과정 없이 공동 예산 관리와 파악이 가능합니다.

- **개발 기간**: 2026.01 ~ 진행 중 (1인 풀스택 개발)
- **목표**: 일상생활의 불편함을 기술로 해결하고, 실사용 가능한 수준의 UX와 실시간 데이터 동기화를 구현하는 것을 목표로 한 개인 프로젝트

---

## ✨ 핵심 기능

| 기능 | 설명 |
|------|------|
| 🏠 **대시보드** | 월 예산 대비 지출 현황, 멤버별 지출 비중 시각화 |
| ✏️ **내역 입력** | 커스텀 숫자 키패드, 카테고리 선택, 멤버 지정 |
| 📋 **거래 내역** | 날짜·멤버·카테고리 필터링, 리스트/달력 뷰 전환 |
| 📊 **통계** | 카테고리별·월별 소비 추이 차트 |
| ⚡ **자주 쓰는 내역** | 반복 지출을 템플릿화하여 원탭으로 입력 |
| 🔗 **그룹 초대** | QR 코드 기반 배우자 초대 및 온보딩 플로우 |
| 🔄 **실시간 동기화** | Supabase Realtime으로 양쪽 디바이스 즉시 반영 |

---

## 🤖 AI-Assisted Development (AI 협업 경험)

본 프로젝트는 기획부터 구현까지 **다양한 AI 어시스턴트와 협력하여 개발 효율을 높인 과정**을 담고 있습니다. 무조건적으로 코딩을 의존하기보다, 각 개발 단계에 맞춰 AI를 활용하며 주도적으로 프로젝트를 이끌어나가는 경험을 구축했습니다.

1. **기획 및 스키마 설계 (Gemini)**
   - 요구사항을 구체화하고 해결하고자 하는 문제(엑셀 가계부의 불편함)를 정리하는 브레인스토밍 파트너로 활용
   - 안전한 데이터 관리를 위한 Supabase DB 스키마 및 RLS(Row Level Security) 초안 설계 보조
2. **UI/UX 프로토타이핑 (v0)**
   - 기획한 아이디어를 `shadcn/ui` 기반의 초기 UI 뼈대로 빠르게 시각화
   - 생성된 시안을 바탕으로 모바일 화면에 맞게 컴포넌트를 분리하고 디자인을 직접 다듬으며 완성도 향상
3. **구현 및 페어 프로그래밍 (Antigravity with Claude Sonnet)**
   - Supabase 실시간 연동, 상태 관리 등 복잡한 비즈니스 로직을 함께 고민하는 든든한 페어 프로그래밍 파트너로 활용
   - AI가 제안한 코드를 그대로 사용하기보다, 프로젝트 맥락에 맞게 구조를 개선하고 코드의 정합성을 꼼꼼히 리뷰하며 반영

---

## 🛠️ 기술 스택

| 영역 | 기술 | 선택 이유 |
|------|------|-----------|
| **Framework** | Next.js 15 (App Router) | 파일 기반 라우팅, SSR/CSR 혼합 전략 |
| **Language** | TypeScript | 타입 안정성 확보, API 응답 타입 명세 |
| **Styling** | Tailwind CSS + Framer Motion | 빠른 스타일링 + 부드러운 UI 인터랙션 |
| **UI Components** | shadcn/ui, Radix UI | 접근성 준수 컴포넌트, 커스터마이징 용이 |
| **Charts** | Recharts | React 친화적 선언형 차트 |
| **Backend / DB** | Supabase (PostgreSQL + Realtime + Auth) | BaaS로 빠른 MVP, Row Level Security로 데이터 격리 |
| **배포** | Vercel | Git push 자동 배포, Edge Network |

---

## 🔑 기술적 구현 포인트

### 1. Supabase Realtime 실시간 동기화
WebSocket 기반의 Supabase Realtime을 활용하여 한 사용자의 거래 입력이 상대방 기기에 즉시 반영됩니다. 구독 채널을 `group_id` 단위로 격리하여 불필요한 이벤트 수신을 최소화했습니다.

### 2. Row Level Security (RLS) 기반 데이터 격리
Supabase RLS 정책을 통해 사용자는 자신이 속한 그룹의 데이터만 조회·수정할 수 있도록 서버 수준에서 강제합니다. 클라이언트 필터링에 의존하지 않아 보안성이 높습니다.

### 3. 커스텀 숫자 키패드 (모바일 UX)
모바일 환경에서 시스템 기본 키보드 대신 앱 내 커스텀 키패드를 구현했습니다. 화면 레이아웃 밀림 없이 일관된 입력 UX를 제공합니다.

### 4. 자주 쓰는 내역 (Quick Add Templates)
가계부를 작성할 때 매달 발생하는 반복적인 고정 지출이나 비슷한 소비를 매번 새로 입력해야 하는 불편함을 해결하기 위해 기획된 기능입니다. 자주 쓰는 지출 패턴을 템플릿으로 저장하고 원탭으로 불러오게 하여 입력 스트레스를 크게 줄였습니다. 더불어 중복 저장 방지 로직을 클라이언트와 DB 양단에 구현하여 데이터 정합성도 보장합니다.

---

## 🗄️ 데이터베이스 구조

```
groups              -- 가구(부부) 그룹
members             -- 그룹 내 구성원 (남편 / 아내)
categories          -- 지출 카테고리 (식비, 교통, 카페, 생활, 주거 등)
transactions        -- 거래 내역 (금액, 카테고리, 멤버, 날짜, 설명)
frequent_templates  -- 자주 쓰는 내역 템플릿
```

전체 스키마: [`supabase-schema.sql`](./supabase-schema.sql)

---

## 📁 프로젝트 구조

```
money-together/
├── app/
│   ├── (main)/
│   │   ├── page.tsx              # 대시보드 (홈)
│   │   ├── add/                  # 내역 입력
│   │   ├── history/              # 거래 내역
│   │   ├── stats/                # 통계
│   │   ├── frequent-templates/   # 자주 쓰는 내역 관리
│   │   ├── invite/               # QR 초대
│   │   └── profile/              # 프로필
│   ├── login/                    # 로그인
│   └── onboarding/               # 온보딩 (그룹 생성)
├── components/
│   ├── dashboard/
│   ├── entry/
│   ├── history/
│   ├── stats/
│   └── ui/                       # 공통 UI (shadcn/ui)
├── lib/
│   └── supabase/                 # Supabase 클라이언트 & 쿼리
├── types/                        # TypeScript 타입 정의
└── supabase-schema.sql           # DB 스키마
```

---

## 🚀 로컬 실행 방법

```bash
# 1. 저장소 클론
git clone https://github.com/<your-username>/money-together.git
cd money-together

# 2. 패키지 설치
yarn install

# 3. 환경 변수 설정 (.env.local)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# 4. DB 스키마 적용
# Supabase 대시보드 → SQL Editor → supabase-schema.sql 실행

# 5. 개발 서버 실행
yarn dev
```

브라우저: [http://localhost:3000](http://localhost:3000)

---

## 🎨 디자인 컨셉

Apple 미니멀리즘 스타일을 기반으로, 모바일 퍼스트 UI를 설계했습니다.

- **배경**: `#F5F5F7` / **카드**: `#FFFFFF` / **포인트**: Deep Blue
- 모든 카드·버튼에 `rounded-2xl` 이상의 둥근 모서리
- 하단 탭 바에 **Glassmorphism** (Backdrop Blur) 효과
- Framer Motion 기반 페이지 전환·인터랙션 애니메이션

---

## 📜 라이선스

Private project — All rights reserved.
