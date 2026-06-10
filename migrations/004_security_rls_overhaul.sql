-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration 004: Security RLS Overhaul
-- 실행 일자: 2026-06-10
-- 목적: 모든 RLS 정책을 auth 기반으로 재작성, anon 권한 회수, SECURITY DEFINER 수정
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- 0. 헬퍼 함수: 현재 인증된 사용자의 group_id 조회
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.user_group_id()
RETURNS UUID AS $$
  SELECT group_id FROM public.members WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. 기존 permissive RLS 정책 모두 삭제
-- ─────────────────────────────────────────────────────────────────────────────

-- Groups
DROP POLICY IF EXISTS "Anyone can read groups" ON groups;
DROP POLICY IF EXISTS "Anyone can insert groups" ON groups;

-- Members
DROP POLICY IF EXISTS "Anyone can read members" ON members;
DROP POLICY IF EXISTS "Anyone can insert members" ON members;

-- Categories
DROP POLICY IF EXISTS "Anyone can read categories" ON categories;

-- Transactions
DROP POLICY IF EXISTS "Anyone can read transactions" ON transactions;
DROP POLICY IF EXISTS "Anyone can insert transactions" ON transactions;
DROP POLICY IF EXISTS "Anyone can update transactions" ON transactions;
DROP POLICY IF EXISTS "Anyone can delete transactions" ON transactions;

-- Frequent Transactions
DROP POLICY IF EXISTS "Anyone can read frequent_transactions" ON frequent_transactions;
DROP POLICY IF EXISTS "Anyone can insert frequent_transactions" ON frequent_transactions;
DROP POLICY IF EXISTS "Anyone can update frequent_transactions" ON frequent_transactions;
DROP POLICY IF EXISTS "Anyone can delete frequent_transactions" ON frequent_transactions;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. 새로운 auth 기반 RLS 정책 생성
-- ─────────────────────────────────────────────────────────────────────────────

-- == Groups ==
-- 자기 그룹만 조회 가능
CREATE POLICY "Members can read own group"
  ON groups FOR SELECT
  USING (id = public.user_group_id());

-- 인증된 사용자만 그룹 생성 가능 (온보딩 시)
CREATE POLICY "Authenticated users can create groups"
  ON groups FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 그룹 업데이트는 해당 그룹 멤버만
CREATE POLICY "Members can update own group"
  ON groups FOR UPDATE
  USING (id = public.user_group_id());

-- == Members ==
-- 같은 그룹 멤버만 조회 가능
CREATE POLICY "Members can read group members"
  ON members FOR SELECT
  USING (group_id = public.user_group_id());

-- 인증된 사용자가 멤버 등록 가능 (온보딩/초대 시)
-- 단, 자신의 user_id로만 등록 가능
CREATE POLICY "Users can insert themselves as members"
  ON members FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- 자기 자신의 멤버 정보만 수정 가능
CREATE POLICY "Users can update own member info"
  ON members FOR UPDATE
  USING (user_id = auth.uid());

-- == Categories (공통 데이터 - 읽기만 허용) ==
CREATE POLICY "Authenticated users can read categories"
  ON categories FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- == Transactions ==
-- 자기 그룹의 거래만 조회
CREATE POLICY "Members can read group transactions"
  ON transactions FOR SELECT
  USING (group_id = public.user_group_id());

-- 자기 그룹에만 거래 추가
CREATE POLICY "Members can insert group transactions"
  ON transactions FOR INSERT
  WITH CHECK (group_id = public.user_group_id());

-- 자기 그룹의 거래만 수정
CREATE POLICY "Members can update group transactions"
  ON transactions FOR UPDATE
  USING (group_id = public.user_group_id());

-- 자기 그룹의 거래만 삭제
CREATE POLICY "Members can delete group transactions"
  ON transactions FOR DELETE
  USING (group_id = public.user_group_id());

-- == Frequent Transactions ==
CREATE POLICY "Members can read group frequent_transactions"
  ON frequent_transactions FOR SELECT
  USING (group_id = public.user_group_id());

CREATE POLICY "Members can insert group frequent_transactions"
  ON frequent_transactions FOR INSERT
  WITH CHECK (group_id = public.user_group_id());

CREATE POLICY "Members can update group frequent_transactions"
  ON frequent_transactions FOR UPDATE
  USING (group_id = public.user_group_id());

CREATE POLICY "Members can delete group frequent_transactions"
  ON frequent_transactions FOR DELETE
  USING (group_id = public.user_group_id());

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. anon 역할 권한 회수 + authenticated만 허용
-- ─────────────────────────────────────────────────────────────────────────────

-- anon에서 모든 테이블 권한 회수
REVOKE ALL ON public.groups FROM anon;
REVOKE ALL ON public.members FROM anon;
REVOKE ALL ON public.categories FROM anon;
REVOKE ALL ON public.transactions FROM anon;
REVOKE ALL ON public.frequent_transactions FROM anon;

-- authenticated에 필요한 최소 권한만 부여
GRANT SELECT, INSERT, UPDATE ON public.groups TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.members TO authenticated;
GRANT SELECT ON public.categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.frequent_transactions TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. SECURITY DEFINER 함수 수정 (권한 검증 추가)
-- ─────────────────────────────────────────────────────────────────────────────

-- delete_category_safe: 호출자 그룹의 데이터만 영향
CREATE OR REPLACE FUNCTION delete_category_safe(target_id UUID)
RETURNS void AS $$
DECLARE
  uncategorized_id UUID;
  caller_group_id UUID;
BEGIN
  -- 호출자의 group_id 확인
  SELECT group_id INTO caller_group_id
  FROM members WHERE user_id = auth.uid();

  IF caller_group_id IS NULL THEN
    RAISE EXCEPTION '인증되지 않은 사용자입니다.';
  END IF;

  SELECT id INTO uncategorized_id FROM categories WHERE is_system = true LIMIT 1;
  IF uncategorized_id IS NULL THEN
    RAISE EXCEPTION '미분류 카테고리를 찾을 수 없습니다.';
  END IF;

  -- 해당 그룹의 트랜잭션만 업데이트
  UPDATE transactions
  SET category_id = uncategorized_id
  WHERE category_id = target_id AND group_id = caller_group_id;

  UPDATE frequent_transactions
  SET category_id = uncategorized_id
  WHERE category_id = target_id AND group_id = caller_group_id;

  DELETE FROM categories WHERE id = target_id AND is_system = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- increment_frequent_usage: 호출자 그룹의 데이터만 영향
CREATE OR REPLACE FUNCTION increment_frequent_usage(row_id UUID)
RETURNS void AS $$
DECLARE
  caller_group_id UUID;
BEGIN
  SELECT group_id INTO caller_group_id
  FROM members WHERE user_id = auth.uid();

  IF caller_group_id IS NULL THEN
    RAISE EXCEPTION '인증되지 않은 사용자입니다.';
  END IF;

  UPDATE frequent_transactions
  SET usage_count = usage_count + 1
  WHERE id = row_id AND group_id = caller_group_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. members.user_id 제약조건 강화
-- ─────────────────────────────────────────────────────────────────────────────

-- 기존 user_id가 NULL인 레코드가 있으면 삭제 (MVP 더미 데이터 정리)
DELETE FROM members WHERE user_id IS NULL;

-- NOT NULL 제약 추가
ALTER TABLE members ALTER COLUMN user_id SET NOT NULL;

-- UNIQUE 제약 추가 (한 유저는 한 그룹에만 참여)
ALTER TABLE members ADD CONSTRAINT members_user_id_unique UNIQUE (user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. budgets 테이블 생성 + RLS (코드에서 사용하지만 스키마에 없었음)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  amount INTEGER NOT NULL CHECK (amount > 0),
  updated_by UUID REFERENCES members(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (group_id, year, month)
);

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read group budgets"
  ON budgets FOR SELECT
  USING (group_id = public.user_group_id());

CREATE POLICY "Members can upsert group budgets"
  ON budgets FOR INSERT
  WITH CHECK (group_id = public.user_group_id());

CREATE POLICY "Members can update group budgets"
  ON budgets FOR UPDATE
  USING (group_id = public.user_group_id());

-- budgets는 anon 접근 불가, authenticated만
GRANT SELECT, INSERT, UPDATE ON public.budgets TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. 초대 코드 관련: groups 테이블 SELECT 정책 확장
--    (온보딩 시 초대 코드로 그룹을 조회해야 하므로, 아직 그룹에 속하지 않은
--     인증된 사용자도 invite_code로 검색할 수 있어야 함)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE POLICY "Authenticated users can lookup groups by invite code"
  ON groups FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 위 정책이 "Members can read own group"과 OR 관계로 작동하여,
-- 인증된 사용자는 모든 그룹의 기본 정보(id, invite_code)를 조회 가능.
-- 단, 민감 데이터(transactions 등)는 별도 RLS로 보호됨.
-- 더 제한적으로 하려면 이 정책 대신 RPC 함수를 사용할 수 있음.
