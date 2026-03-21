---
description: 새 기능 개발 워크플로우 - 이슈 생성부터 PR까지 자동화
---

# Feature Development Workflow

새로운 기능을 개발할 때 반드시 이 워크플로우를 따른다.

// turbo-all

## 1. GitHub Issue 생성

기능 요청을 분석하여 이슈를 생성한다.

```powershell
gh issue create --title "{기능 제목}" --body "{기능 상세 설명}" --label "enhancement"
```

- 이슈 번호를 기억해둔다 (이후 단계에서 사용)
- 라벨이 없으면 먼저 생성: `gh label create "enhancement" --color "#a2eeef"`

## 2. 작업 브랜치 생성

이슈 번호를 기반으로 브랜치를 생성하고 전환한다.

```powershell
git checkout -b "feature/#{이슈번호}-{기능명-kebab-case}"
```

예시: `feature/#15-recurring-expense`

## 3. 코드 구현

기능을 구현한다. 구현 전 반드시:
- 기존 코드 구조 파악
- 관련 컴포넌트/파일 확인
- 타입 정의 확인 (TypeScript)

## 4. 변경사항 커밋

```powershell
git add .
git commit -m "feat: {기능 설명} (closes #{이슈번호})"
```

## 5. 원격 브랜치 푸시

```powershell
git push origin "feature/#{이슈번호}-{기능명-kebab-case}"
```

## 6. Pull Request 생성

```powershell
gh pr create --title "feat: {기능 제목}" --body "## 변경 사항\n\n{변경 내용 상세 설명}\n\n## 관련 이슈\n\nCloses #{이슈번호}" --base master
```

PR 생성 후 AI 리뷰 워크플로우가 자동으로 실행된다.
