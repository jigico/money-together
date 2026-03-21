---
description: Supabase DB 마이그레이션 워크플로우 - 스키마 변경 및 supabase-schema.sql 동기화
---

# DB Migration Workflow (Supabase)

데이터베이스 스키마를 변경할 때 반드시 이 워크플로우를 따른다.
이 프로젝트는 Supabase를 사용하며, 스키마 변경은 SQL로 직접 관리한다.

// turbo-all

## 1. 변경 내용 분석

아래 항목을 먼저 파악한다:
- 어떤 테이블에 어떤 변경이 필요한가 (컬럼 추가/삭제/수정, 테이블 신규 생성 등)
- RLS 정책 변경이 필요한가
- 인덱스 변경이 필요한가
- 기존 데이터 마이그레이션이 필요한가

## 2. 마이그레이션 SQL 작성

`supabase-schema.sql` 파일을 기준으로 변경 SQL을 작성한다.

**컬럼 추가 예시:**
```sql
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false;
```

**컬럼 삭제 예시:**
```sql
ALTER TABLE transactions DROP COLUMN IF EXISTS old_column;
```

**테이블 신규 생성 예시:**
```sql
CREATE TABLE IF NOT EXISTS recurring_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id),
  member_id UUID NOT NULL REFERENCES members(id),
  description TEXT NOT NULL,
  cycle TEXT NOT NULL, -- 'monthly', 'weekly'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS 활성화
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;

-- RLS 정책
CREATE POLICY "Anyone can read recurring_transactions" ON recurring_transactions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert recurring_transactions" ON recurring_transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update recurring_transactions" ON recurring_transactions FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete recurring_transactions" ON recurring_transactions FOR DELETE USING (true);

-- 인덱스
CREATE INDEX IF NOT EXISTS recurring_transactions_group_id_idx ON recurring_transactions(group_id);
```

## 3. Supabase SQL Editor에서 실행

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택 → **SQL Editor** 메뉴
3. 작성한 마이그레이션 SQL 붙여넣기 후 실행
4. 에러 없이 완료되면 다음 단계 진행

> ⚠️ 데이터 삭제 관련 작업(`DROP`, `DELETE`)은 실행 전 반드시 확인한다.

## 4. supabase-schema.sql 파일 업데이트

`supabase-schema.sql` 파일에 변경 내용을 반영하여 현재 스키마 상태와 동기화한다.
(이 파일은 현재 DB 상태의 문서 역할을 한다)

## 5. TypeScript 타입 업데이트 (해당하는 경우)

컬럼 추가/삭제 시 관련 TypeScript 타입도 업데이트한다:
- `types/` 디렉토리 내 관련 타입 파일
- Supabase 쿼리에서 사용하는 타입 정의

## 6. 변경사항 커밋

```powershell
git add .
git commit -m "db: {변경 내용 요약}"
git push origin {현재 브랜치}
```

커밋 메시지 예시:
- `db: transactions 테이블에 is_recurring 컬럼 추가`
- `db: recurring_transactions 테이블 신규 생성`
