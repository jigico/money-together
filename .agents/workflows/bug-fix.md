---
description: 버그 수정 워크플로우 - 이슈 생성부터 PR까지 자동화
---

# Bug Fix Workflow

버그를 수정할 때 반드시 이 워크플로우를 따른다.

// turbo-all

## 1. GitHub Issue 생성

버그 내용을 분석하여 이슈를 생성한다.

```powershell
gh issue create --title "[Bug] {버그 제목}" --body "## 버그 설명\n\n{버그 상세 설명}\n\n## 재현 방법\n\n{재현 단계}\n\n## 예상 동작\n\n{정상 동작 설명}\n\n## 실제 동작\n\n{실제 버그 동작 설명}" --label "bug"
```

- 이슈 번호를 기억해둔다 (이후 단계에서 사용)
- 라벨이 없으면 먼저 생성: `gh label create "bug" --color "#d73a4a"`

## 2. 작업 브랜치 생성

이슈 번호를 기반으로 브랜치를 생성하고 전환한다.

```powershell
git checkout -b "fix/#{이슈번호}-{버그명-kebab-case}"
```

예시: `fix/#23-date-range-calculation`

## 3. 버그 원인 파악 및 수정

수정 전 반드시:
- 버그 재현 경로 파악
- 원인이 되는 코드 위치 특정
- 수정 범위 최소화 (사이드 이펙트 방지)

## 4. 검증 (커밋 전 필수)

버그 수정 후 아래 검증을 **모두 통과**해야 다음 단계로 진행한다.

### 4-1. 빌드 검증
```powershell
yarn build
```
- 빌드 에러 0개 확인

### 4-2. 린트 검증
```powershell
yarn lint
```
- ESLint 에러 0개 확인

### 4-3. 브라우저 동작 확인
- 개발 서버에서 버그가 수정됐는지 직접 확인
- 다른 기능에 사이드 이펙트가 없는지 확인
- 콘솔 에러 없는지 확인

### 4-4. 검증 실패 시
- 에러를 수정하고 4-1부터 다시 실행
- **모든 검증 통과 전까지 커밋 금지**

## 5. 변경사항 커밋

```powershell
git add .
git commit -m "fix: {버그 수정 내용} (fixes #{이슈번호})"
```

## 6. 원격 브랜치 푸시

```powershell
git push origin "fix/#{이슈번호}-{버그명-kebab-case}"
```

## 7. Pull Request 생성

```powershell
gh pr create --title "fix: {버그 제목}" --body "## 버그 수정 내용\n\n{수정 내용 상세 설명}\n\n## 원인\n\n{버그 원인}\n\n## 검증 결과\n\n- [x] yarn build 통과\n- [x] yarn lint 통과\n- [x] 브라우저 동작 확인 (버그 수정 확인)\n\n## 관련 이슈\n\nFixes #{이슈번호}" --base master
```

PR 생성 후 AI 리뷰 워크플로우가 자동으로 실행된다.
