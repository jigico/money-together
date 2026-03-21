---
description: 테스트 작성 워크플로우 - 특정 기능/컴포넌트에 대한 테스트 자동 생성 및 실행
---

# Test Writing Workflow

새 기능 구현 후 또는 테스트 커버리지가 필요한 영역에 대해 이 워크플로우를 따른다.

// turbo-all

## 1. 테스트 대상 파악

아래 중 해당하는 항목을 확인한다:
- 테스트할 컴포넌트 또는 유틸리티 함수 특정
- 기존 테스트 파일 존재 여부 확인 (`*.test.ts`, `*.spec.ts`)
- 테스트 프레임워크 확인 (Jest, Vitest 등)

## 2. 테스트 환경 확인

```powershell
# 테스트 스크립트 확인
cat package.json | Select-String "test"
```

테스트 프레임워크가 없는 경우 설치:
```powershell
# Next.js 프로젝트 기준
yarn add -D jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

## 3. 테스트 파일 작성

테스트 파일 위치: 대상 파일과 같은 디렉토리, 또는 `__tests__/` 폴더

```typescript
// 예시: utils/date.test.ts
import { getDateRange } from './date'

describe('getDateRange', () => {
  it('현재 월의 시작/종료 날짜를 올바르게 반환한다', () => {
    const result = getDateRange(new Date('2024-03-15'))
    expect(result.start).toEqual(new Date('2024-03-01T00:00:00'))
    expect(result.end).toEqual(new Date('2024-03-31T23:59:59'))
  })
})
```

테스트 케이스 작성 원칙:
- 정상 케이스 (Happy path)
- 엣지 케이스 (빈 값, 경계값 등)
- 에러 케이스 (예외 상황)

## 4. 테스트 실행

```powershell
yarn test
# 또는 특정 파일만
yarn test {파일명}
```

## 5. 변경사항 커밋

```powershell
git add .
git commit -m "test: {테스트 대상} 테스트 추가"
git push origin {현재 브랜치}
```
