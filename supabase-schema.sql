-- Money Together Supabase 데이터베이스 스키마 (Multi-Household Support)

-- 1. Groups 테이블 (부부/가구 그룹)
CREATE TABLE IF NOT EXISTS groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Members 테이블 (가족 구성원) - group_id 추가
CREATE TABLE IF NOT EXISTS members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
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
-- (마이그레이션 실행 후 ON DELETE CASCADE → SET DEFAULT로 FK가 변경됨)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE SET DEFAULT,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  payee TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
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

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS members_group_id_idx ON members(group_id);
CREATE INDEX IF NOT EXISTS transactions_group_id_idx ON transactions(group_id);
CREATE INDEX IF NOT EXISTS transactions_date_idx ON transactions(date);
CREATE INDEX IF NOT EXISTS transactions_category_id_idx ON transactions(category_id);
CREATE INDEX IF NOT EXISTS transactions_member_id_idx ON transactions(member_id);
CREATE INDEX IF NOT EXISTS transactions_created_at_idx ON transactions(created_at);
CREATE INDEX IF NOT EXISTS transactions_payee_idx ON transactions(payee);
CREATE INDEX IF NOT EXISTS frequent_transactions_group_id_idx ON frequent_transactions(group_id);
CREATE INDEX IF NOT EXISTS frequent_transactions_usage_count_idx ON frequent_transactions(usage_count DESC);

-- Row Level Security (RLS) 활성화
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE frequent_transactions ENABLE ROW LEVEL SECURITY;

-- RLS 정책 (현재는 개발용으로 모두 허용, 추후 인증 추가 시 수정)
-- Groups
CREATE POLICY "Anyone can read groups" ON groups FOR SELECT USING (true);
CREATE POLICY "Anyone can insert groups" ON groups FOR INSERT WITH CHECK (true);

-- Members
CREATE POLICY "Anyone can read members" ON members FOR SELECT USING (true);
CREATE POLICY "Anyone can insert members" ON members FOR INSERT WITH CHECK (true);

-- Categories (공통 데이터)
CREATE POLICY "Anyone can read categories" ON categories FOR SELECT USING (true);

-- Transactions
CREATE POLICY "Anyone can read transactions" ON transactions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert transactions" ON transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update transactions" ON transactions FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete transactions" ON transactions FOR DELETE USING (true);

-- Frequent Transactions
CREATE POLICY "Anyone can read frequent_transactions" ON frequent_transactions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert frequent_transactions" ON frequent_transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update frequent_transactions" ON frequent_transactions FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete frequent_transactions" ON frequent_transactions FOR DELETE USING (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- Supabase RPC: delete_category_safe
-- 카테고리 삭제 시 참조 내역/템플릿을 미분류로 이관 후 삭제 (원자적 실행)
-- 사용: SELECT delete_category_safe('<category-uuid>');
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

-- 초기 데이터 삽입

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

-- MVP용 초기 그룹 및 멤버 생성
DO $$
DECLARE
  mvp_group_id UUID;
  husband_id UUID;
  wife_id UUID;
  food_id UUID;
  transport_id UUID;
  cafe_id UUID;
  shopping_id UUID;
BEGIN
  -- MVP 그룹 생성
  INSERT INTO groups (name) VALUES ('MVP 부부') RETURNING id INTO mvp_group_id;

  -- MVP 그룹의 멤버 생성
  INSERT INTO members (group_id, name, avatar, color, bg_color) VALUES
    (mvp_group_id, '남편', '남', '#0047AB', '#0047AB')
  RETURNING id INTO husband_id;

  INSERT INTO members (group_id, name, avatar, color, bg_color) VALUES
    (mvp_group_id, '아내', '여', '#fb7185', '#fb7185')
  RETURNING id INTO wife_id;

  -- 카테고리 ID 가져오기
  SELECT id INTO food_id FROM categories WHERE name = '식비' LIMIT 1;
  SELECT id INTO transport_id FROM categories WHERE name = '교통' LIMIT 1;
  SELECT id INTO cafe_id FROM categories WHERE name = '카페' LIMIT 1;
  SELECT id INTO shopping_id FROM categories WHERE name = '생활' LIMIT 1;

  -- 샘플 거래 추가 (MVP 그룹에만)
  INSERT INTO transactions (group_id, amount, category_id, member_id, payee, description, date) VALUES
    (mvp_group_id, 45000, food_id, husband_id, '저녁 식사', NULL, CURRENT_DATE),
    (mvp_group_id, 12000, transport_id, wife_id, '택시', NULL, CURRENT_DATE),
    (mvp_group_id, 8500, cafe_id, husband_id, '스타벅스', NULL, CURRENT_DATE - 1),
    (mvp_group_id, 125000, shopping_id, wife_id, '생활용품 구매', NULL, CURRENT_DATE - 1),
    (mvp_group_id, 15000, food_id, husband_id, '편의점', NULL, CURRENT_DATE - 3);
END $$;

-- NOTE: current_group 뷰는 MVP 초기 임시 뷰로, 현재 앱에서 사용하지 않음 (삭제됨)
-- 현재 그룹 ID는 helpers.ts의 getCurrentGroupId()에서 Auth 기반으로 조회함
