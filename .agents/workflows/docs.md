---
description: 문서화 워크플로우 - README, 코드 주석, 변경 이력 자동 업데이트
---

# Documentation Workflow

코드 변경 후 문서를 업데이트하거나, 문서만 단독으로 작성할 때 이 워크플로우를 따른다.

// turbo-all

## 1. 문서화 대상 파악

아래 중 해당하는 항목을 확인한다:
- `README.md` 업데이트 필요 여부 (새 기능, 설치 방법, 환경변수 변경 등)
- 컴포넌트/함수에 JSDoc 주석 추가 필요 여부
- `CHANGELOG.md` 업데이트 필요 여부

## 2. README 업데이트 (해당하는 경우)

업데이트 대상:
- 새로 추가된 기능 설명
- 변경된 환경변수 (`.env.example` 포함)
- 변경된 실행 방법 또는 배포 방법
- 스크린샷 또는 UI 변경 사항

## 3. 코드 주석 추가 (해당하는 경우)

복잡한 로직, 공개 함수/컴포넌트에 JSDoc 형식으로 주석 추가:

```typescript
/**
 * 날짜를 로컬 타임존 기준으로 범위를 계산한다
 * @param date - 기준 날짜
 * @returns { start: Date, end: Date } 시작/종료 일시
 */
```

## 4. 변경사항 커밋

```powershell
git add .
git commit -m "docs: {문서 업데이트 내용}"
```

## 5. 원격 브랜치 푸시

```powershell
git push origin master
```

> 문서 전용 변경은 PR 없이 master에 직접 푸시해도 무방하다.
> 코드 변경을 동반하는 경우 feature/fix 워크플로우와 함께 진행한다.
