## 🚀 '머니투게더' 프로젝트 마스터 프롬프트

### 1. 프로젝트 개요

* **프로젝트 명**: 머니투게더(Money Together)
* **목표**: 20대 후반 부부가 함께 자산을 관리하고 미래를 설계하기 위한 실시간 공유 가계부 서비스
* **사용자 컨텍스트**: 부부의 생활비를 관리하며, 투자 등 장기적인 재정 목표를 공유함

### 2. 기술 스택 (Tech Stack)

* **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS
* **UI Library**: shadcn/ui, Lucide React (Icons)
* **Backend/Database**: Supabase (PostgreSQL, Realtime, Auth)
* **Development Tool**: Google Antigravity (Agent-based IDE)

### 3. 디자인 시스템 가이드 (Apple Minimalist Style)

* **컨셉**: Apple의 미니멀리즘과 iOS 순정 앱의 감성을 그대로 재현
* **컬러**:
* **Background**: #F5F5F7 (Light Gray)
* **Point Color**: Deep Blue (주요 버튼, 강조 텍스트, 예산 상태 바)
* **Cards**: Pure White (#FFFFFF)


* **모양**: 모든 카드와 버튼은 `rounded-2xl` 이상의 둥근 모서리 적용
* **효과**: 선(Border)을 최소화하고 부드러운 그림자(Soft Shadow)와 여백(Padding)을 활용해 계층 분리
* **네비게이션**: 하단 탭 바에 Glassmorphism(Backdrop Blur) 효과 적용

### 4. 데이터 및 기능 요구사항

* **공유 기능**: 모든 지출 내역은 '남편'과 '아내'로 구분되어 저장되며, 실시간으로 양쪽 디바이스에 동기화되어야 함
* **핵심 기능**:
* **대시보드**: 월 예산 대비 지출 현황 및 멤버별 지출 비중 표시
* **내역 입력**: 커스텀 숫자 키패드와 카테고리 선택 기능을 포함한 모바일 전용 UI
* **통계**: 차트 라이브러리를 활용한 카테고리별/월별 소비 추이 분석



### 5. 초기 세팅 지시사항

1. 프로젝트 루트에 Next.js 환경을 구성하고 필요한 의존성(`lucide-react`, `shadcn/ui`, `@supabase/supabase-js`)을 설치해줘.
2. Tailwind 설정에 포인트 컬러인 Deep Blue를 테마 컬러로 등록해줘.
3. 이미 v0.app을 통해 생성된 홈 대시보드, 내역 입력, 통계 화면의 코드를 기반으로 프로젝트 구조를 잡아줘.
4. 모든 컴포넌트는 재사용 가능하도록 `components/` 폴더 내에 논리적으로 분리해서 작성해줘.