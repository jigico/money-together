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
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Transactions 테이블 (거래 내역) - group_id 추가
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  description TEXT DEFAULT '',
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS members_group_id_idx ON members(group_id);
CREATE INDEX IF NOT EXISTS transactions_group_id_idx ON transactions(group_id);
CREATE INDEX IF NOT EXISTS transactions_date_idx ON transactions(date);
CREATE INDEX IF NOT EXISTS transactions_category_id_idx ON transactions(category_id);
CREATE INDEX IF NOT EXISTS transactions_member_id_idx ON transactions(member_id);
CREATE INDEX IF NOT EXISTS transactions_created_at_idx ON transactions(created_at);

-- Row Level Security (RLS) 활성화
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

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

-- 초기 데이터 삽입

-- Categories 초기 데이터 (모든 그룹이 공유)
INSERT INTO categories (name, icon, color) VALUES
  ('식비', '🍽️', '#f87171'),
  ('교통', '🚗', '#60a5fa'),
  ('카페', '☕', '#fbbf24'),
  ('쇼핑', '🛍️', '#a78bfa'),
  ('주거', '🏠', '#34d399'),
  ('기타', '📦', '#9ca3af')
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
  SELECT id INTO shopping_id FROM categories WHERE name = '쇼핑' LIMIT 1;

  -- 샘플 거래 추가 (MVP 그룹에만)
  INSERT INTO transactions (group_id, amount, category_id, member_id, description, date) VALUES
    (mvp_group_id, 45000, food_id, husband_id, '저녁 식사', CURRENT_DATE),
    (mvp_group_id, 12000, transport_id, wife_id, '택시', CURRENT_DATE),
    (mvp_group_id, 8500, cafe_id, husband_id, '스타벅스', CURRENT_DATE - 1),
    (mvp_group_id, 125000, shopping_id, wife_id, '옷 쇼핑', CURRENT_DATE - 1),
    (mvp_group_id, 15000, food_id, husband_id, '편의점', CURRENT_DATE - 3);
END $$;

-- 현재 MVP 그룹 ID 확인용 뷰
CREATE OR REPLACE VIEW current_group AS
SELECT id as group_id, name FROM groups WHERE name = 'MVP 부부' LIMIT 1;
