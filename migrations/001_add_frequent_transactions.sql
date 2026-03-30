-- Migration: Quick Add Templates (자주 쓰는 내역)
-- 실행 일자: 2026-03-30
-- Supabase SQL Editor에서 실행하세요.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. categories 테이블에 is_system 컬럼 추가
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT false NOT NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. '미분류' 시스템 카테고리 삽입
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO categories (name, icon, color, is_system)
VALUES ('미분류', '📂', '#9ca3af', true)
ON CONFLICT (name) DO UPDATE SET is_system = true;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. transactions.category_id FK 변경: ON DELETE CASCADE → ON DELETE SET DEFAULT
--    (DEFAULT = 미분류 카테고리 UUID)
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  uncategorized_id UUID;
BEGIN
  SELECT id INTO uncategorized_id FROM categories WHERE is_system = true LIMIT 1;

  -- 기존 FK 제약 제거
  ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_category_id_fkey;

  -- DEFAULT 값 설정
  EXECUTE format(
    'ALTER TABLE transactions ALTER COLUMN category_id SET DEFAULT %L',
    uncategorized_id
  );

  -- 새 FK 추가 (ON DELETE SET DEFAULT)
  ALTER TABLE transactions
    ADD CONSTRAINT transactions_category_id_fkey
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET DEFAULT;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. frequent_transactions 테이블 신규 생성
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS frequent_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE SET DEFAULT,
  description TEXT NOT NULL,
  amount INTEGER NULL,
  usage_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- frequent_transactions.category_id DEFAULT 설정
DO $$
DECLARE
  uncategorized_id UUID;
BEGIN
  SELECT id INTO uncategorized_id FROM categories WHERE is_system = true LIMIT 1;
  EXECUTE format(
    'ALTER TABLE frequent_transactions ALTER COLUMN category_id SET DEFAULT %L',
    uncategorized_id
  );
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. RLS 활성화 및 정책 추가
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE frequent_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read frequent_transactions"
  ON frequent_transactions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert frequent_transactions"
  ON frequent_transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update frequent_transactions"
  ON frequent_transactions FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete frequent_transactions"
  ON frequent_transactions FOR DELETE USING (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. 인덱스 추가
-- ─────────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS frequent_transactions_group_id_idx
  ON frequent_transactions(group_id);
CREATE INDEX IF NOT EXISTS frequent_transactions_usage_count_idx
  ON frequent_transactions(usage_count DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. delete_category_safe RPC 함수 생성
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION delete_category_safe(target_id UUID)
RETURNS void AS $$
DECLARE
  uncategorized_id UUID;
BEGIN
  SELECT id INTO uncategorized_id FROM categories WHERE is_system = true LIMIT 1;
  IF uncategorized_id IS NULL THEN
    RAISE EXCEPTION '미분류 카테고리를 찾을 수 없습니다.';
  END IF;
  UPDATE transactions SET category_id = uncategorized_id WHERE category_id = target_id;
  UPDATE frequent_transactions SET category_id = uncategorized_id WHERE category_id = target_id;
  DELETE FROM categories WHERE id = target_id AND is_system = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. increment_frequent_usage RPC 함수 생성 (usage_count 원자적 +1)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION increment_frequent_usage(row_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE frequent_transactions
  SET usage_count = usage_count + 1
  WHERE id = row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
