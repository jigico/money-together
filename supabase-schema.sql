-- Money Together Supabase 데이터베이스 스키마 (Multi-Household Support)
-- 최종 업데이트: 2026-06-10 (보안 RLS 적용)

-- 1. Groups 테이블 (부부/가구 그룹)
CREATE TABLE IF NOT EXISTS groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 초대 코드 자동 생성 트리거
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.invite_code := upper(substr(md5(random()::text), 1, 8));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_invite_code
  BEFORE INSERT ON groups
  FOR EACH ROW
  WHEN (NEW.invite_code IS NULL)
  EXECUTE FUNCTION generate_invite_code();

-- 2. Members 테이블 (가족 구성원) - Auth 사용자와 연결
CREATE TABLE IF NOT EXISTS members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'member' NOT NULL,
  avatar TEXT NOT NULL,
  color TEXT NOT NULL,
  bg_color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Categories 테이블 (지출 카테고리) - 전체 공통 사용
-- is_system: true = 시스템 카테고리(미분류 등), 선택 UI에 노출 안 함
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  is_system BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Transactions 테이블 (거래 내역) - group_id 추가
-- category_id: ON DELETE SET DEFAULT → 카테고리 삭제 시 '미분류'로 자동 이관
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE SET DEFAULT,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  payee TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  transaction_type TEXT DEFAULT 'expense' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Frequent Transactions 테이블 (자주 쓰는 내역 템플릿)
CREATE TABLE IF NOT EXISTS frequent_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE SET DEFAULT,
  payee TEXT NOT NULL,
  description TEXT,
  amount INTEGER NULL,
  usage_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Budgets 테이블 (월별 예산)
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

-- ─────────────────────────────────────────────────────────────────────────────
-- 인덱스 생성 (성능 최적화)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS members_group_id_idx ON members(group_id);
CREATE INDEX IF NOT EXISTS members_user_id_idx ON members(user_id);
CREATE INDEX IF NOT EXISTS transactions_group_id_idx ON transactions(group_id);
CREATE INDEX IF NOT EXISTS transactions_date_idx ON transactions(date);
CREATE INDEX IF NOT EXISTS transactions_category_id_idx ON transactions(category_id);
CREATE INDEX IF NOT EXISTS transactions_member_id_idx ON transactions(member_id);
CREATE INDEX IF NOT EXISTS transactions_created_at_idx ON transactions(created_at);
CREATE INDEX IF NOT EXISTS transactions_payee_idx ON transactions(payee);
CREATE INDEX IF NOT EXISTS frequent_transactions_group_id_idx ON frequent_transactions(group_id);
CREATE INDEX IF NOT EXISTS frequent_transactions_usage_count_idx ON frequent_transactions(usage_count DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- Row Level Security (RLS) 활성화
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE frequent_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS 헬퍼 함수: 현재 인증된 사용자의 group_id 조회
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.user_group_id()
RETURNS UUID AS $$
  SELECT group_id FROM public.members WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS 정책 (Auth 기반 - 그룹 단위 격리)
-- ─────────────────────────────────────────────────────────────────────────────

-- Groups
CREATE POLICY "Members can read own group"
  ON groups FOR SELECT USING (id = public.user_group_id());
CREATE POLICY "Authenticated users can create groups"
  ON groups FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Members can update own group"
  ON groups FOR UPDATE USING (id = public.user_group_id());
-- 온보딩/초대 시 초대 코드로 그룹 조회 허용
CREATE POLICY "Authenticated users can lookup groups by invite code"
  ON groups FOR SELECT USING (auth.uid() IS NOT NULL);

-- Members
CREATE POLICY "Members can read group members"
  ON members FOR SELECT USING (group_id = public.user_group_id());
CREATE POLICY "Users can insert themselves as members"
  ON members FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());
CREATE POLICY "Users can update own member info"
  ON members FOR UPDATE USING (user_id = auth.uid());

-- Categories (공통 데이터 - 인증된 사용자만 읽기)
CREATE POLICY "Authenticated users can read categories"
  ON categories FOR SELECT USING (auth.uid() IS NOT NULL);

-- Transactions (그룹 단위 격리)
CREATE POLICY "Members can read group transactions"
  ON transactions FOR SELECT USING (group_id = public.user_group_id());
CREATE POLICY "Members can insert group transactions"
  ON transactions FOR INSERT WITH CHECK (group_id = public.user_group_id());
CREATE POLICY "Members can update group transactions"
  ON transactions FOR UPDATE USING (group_id = public.user_group_id());
CREATE POLICY "Members can delete group transactions"
  ON transactions FOR DELETE USING (group_id = public.user_group_id());

-- Frequent Transactions (그룹 단위 격리)
CREATE POLICY "Members can read group frequent_transactions"
  ON frequent_transactions FOR SELECT USING (group_id = public.user_group_id());
CREATE POLICY "Members can insert group frequent_transactions"
  ON frequent_transactions FOR INSERT WITH CHECK (group_id = public.user_group_id());
CREATE POLICY "Members can update group frequent_transactions"
  ON frequent_transactions FOR UPDATE USING (group_id = public.user_group_id());
CREATE POLICY "Members can delete group frequent_transactions"
  ON frequent_transactions FOR DELETE USING (group_id = public.user_group_id());

-- Budgets (그룹 단위 격리)
CREATE POLICY "Members can read group budgets"
  ON budgets FOR SELECT USING (group_id = public.user_group_id());
CREATE POLICY "Members can upsert group budgets"
  ON budgets FOR INSERT WITH CHECK (group_id = public.user_group_id());
CREATE POLICY "Members can update group budgets"
  ON budgets FOR UPDATE USING (group_id = public.user_group_id());

-- ─────────────────────────────────────────────────────────────────────────────
-- Data API 접근 권한 (인증된 사용자만, anon 차단)
-- ─────────────────────────────────────────────────────────────────────────────
GRANT SELECT, INSERT, UPDATE ON public.groups TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.members TO authenticated;
GRANT SELECT ON public.categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.frequent_transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.budgets TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- RPC 함수: delete_category_safe (권한 검증 포함)
-- ─────────────────────────────────────────────────────────────────────────────
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

-- RPC 함수: increment_frequent_usage (권한 검증 포함)
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
-- 초기 데이터 삽입
-- ─────────────────────────────────────────────────────────────────────────────

-- Categories 초기 데이터 (모든 그룹이 공유)
INSERT INTO categories (name, icon, color, is_system) VALUES
  ('미분류', '📂', '#9ca3af', true),
  ('식비', '🍽️', '#f87171', false),
  ('교통', '🚗', '#60a5fa', false),
  ('카페', '☕', '#fbbf24', false),
  ('생활', '🧺', '#a78bfa', false),
  ('주거', '🏠', '#34d399', false),
  ('병원', '🏥', '#ec4899', false),
  ('기타', '📦', '#9ca3af', false)
ON CONFLICT (name) DO NOTHING;
