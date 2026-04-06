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

### 왜 만들었는가?

**저는 아내와 공유 엑셀 파일로 가계부를 관리해왔습니다.**

그런데 실제로 쓰다 보면 문제가 반복됐습니다.

- 외출 중 마트에서 지출을 했는데, 엑셀을 켜서 입력하는 게 너무 번거롭고 결국 나중에 기억해서 쓰다 보니 누락이 생겼습니다.
- 한 명이 입력한 내역을 상대방이 바로 확인하려면 파일을 다시 열어야 했고, 간혹 동시 편집으로 충돌이 났습니다.
- 모바일에서 엑셀을 편집하는 UX는 불편해서 결국 PC 앞에서만 정리하게 됐습니다.

**"내가 직접 쓰고 싶은 가계부를 만들자"** — 그게 이 프로젝트의 시작입니다.

일상의 문제를 내가 배운 기술로 직접 해결한다는 동기부여 아래, 단순한 토이 프로젝트가 아니라 **실사용 수준의 퀄리티**를 목표로 설정했습니다.

- **개발 기간**: 2026.01 ~ 진행 중 (1인 풀스택 개발)

---

## 🔑 기술적 고민과 의사결정

### 1. 🔄 실시간 동기화 — "언제 동기화할 것인가?"

**문제**: 부부가 각자의 기기에서 가계부를 확인할 때, 최신 데이터를 어떻게 보여줄 것인가?

**고민한 선택지:**
- **Polling (주기적 요청)**: 구현은 쉽지만 불필요한 네트워크 요청이 많고, 실시간성이 떨어짐
- **WebSocket 기반 실시간 구독**: 구현 복잡도가 높지만, 진짜 "실시간" 경험 제공 가능

**의사결정**: Supabase Realtime(WebSocket)을 선택했지만, 그냥 전체를 구독하면 다른 그룹의 데이터 변경 이벤트까지 수신됩니다. 이를 방지하기 위해 **구독 채널을 `group_id` 단위로 격리**하여 불필요한 이벤트 수신을 차단하고 보안성을 함께 확보했습니다.

---

### 2. 🔐 데이터 보안 — "클라이언트 필터링은 신뢰할 수 없다"

**문제**: `group_id`로 데이터를 필터링하는 쿼리를 클라이언트에서 작성하면, 악의적인 사용자가 다른 그룹의 데이터를 요청할 수 있습니다.

**고민**: 프론트엔드 레벨의 필터링만으로 충분한가?

**의사결정**: 클라이언트 필터링에만 의존하지 않고, **Supabase RLS(Row Level Security)** 정책을 DB 레벨에서 설정했습니다. 어떤 쿼리가 들어오더라도 서버가 자신의 그룹 데이터만 반환하도록 강제합니다. "보안은 클라이언트가 아닌 서버에서" 라는 원칙을 직접 적용한 경험입니다.

---

### 3. 📱 커스텀 숫자 키패드 — "UX 문제는 기술 문제다"

**문제**: 모바일에서 금액 입력 시 시스템 키보드가 올라오면 화면 레이아웃이 밀리고, 화면의 절반 이상을 키보드가 덮어 카테고리 선택 영역이 가려집니다.

**고민**: `inputmode="numeric"` 속성으로 시스템 키패드를 활용하면 구현이 쉬우나, Bottom Sheet로 구성된 입력 UI 특성상 레이아웃 무너짐을 제어하기 어렵습니다.

**의사결정**: 시스템 키보드를 완전히 배제하고 **앱 내 커스텀 숫자 키패드**를 직접 구현했습니다. 레이아웃 밀림 없이 일관된 UX를 보장하며, 향후 계산기 기능 추가 등 확장에도 유리한 구조입니다.

---

### 4. ⚡ 자주 쓰는 내역 — "반복되는 고통을 없애라"

**문제**: 매달 내는 관리비, 자주 가는 카페 금액처럼 **동일하거나 유사한 지출을 매번 처음부터 입력**해야 합니다. 카테고리를 선택하고, 금액을 입력하고, 메모를 쓰는 7~8번의 탭이 반복됩니다.

**고민**:
- 단순히 "최근 내역 복사" 기능으로 충분한가? → 최근 내역이 아닌 자주 쓰는 특정 패턴을 고정하고 싶은 니즈가 있음
- 템플릿을 어디서 관리하게 할 것인가? → 입력 페이지 내 접근성 vs 별도 관리 페이지의 기능성

**의사결정**: 입력 페이지에서 **Bottom Sheet로 빠르게 호출**하고, 별도 관리 페이지에서 CRUD를 지원하는 구조로 분리했습니다. 또한 동일한 템플릿의 중복 저장을 방지하기 위해 **클라이언트 중복 체크 + DB Unique 제약** 두 레이어로 데이터 정합성을 보장했습니다.

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
