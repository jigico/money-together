-- =====================================================
-- 마이그레이션 002: payee(지출처) 필드 추가
-- 실행 일시: 2026-04-14
-- 목적: 거래 내역에 지출처 필드를 별도로 관리
--       기존 description 값 → payee로 마이그레이션
--       description은 선택 필드(nullable)로 변경
-- =====================================================

-- 1. transactions 테이블에 payee 컬럼 추가 (기본값으로 기존 데이터 호환)
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS payee TEXT NOT NULL DEFAULT '';

-- 2. 기존 description 값을 payee로 복사 (데이터 보존)
UPDATE transactions
  SET payee = description
  WHERE payee = '';

-- 3. transactions: description을 선택 필드(nullable)로 변경
ALTER TABLE transactions
  ALTER COLUMN description DROP NOT NULL;

-- 4. transactions: payee의 DEFAULT 제거 (이후 신규 INSERT는 명시적 입력 필요)
ALTER TABLE transactions
  ALTER COLUMN payee DROP DEFAULT;

-- 5. frequent_transactions에도 payee 컬럼 추가
ALTER TABLE frequent_transactions
  ADD COLUMN IF NOT EXISTS payee TEXT NOT NULL DEFAULT '';

-- 6. frequent_transactions: 기존 description 값을 payee로 복사
UPDATE frequent_transactions
  SET payee = description
  WHERE payee = '';

-- 7. frequent_transactions: description을 선택 필드로 변경
ALTER TABLE frequent_transactions
  ALTER COLUMN description DROP NOT NULL;

-- 8. frequent_transactions: payee의 DEFAULT 제거
ALTER TABLE frequent_transactions
  ALTER COLUMN payee DROP DEFAULT;

-- 9. payee 인덱스 추가 (검색 성능 최적화)
CREATE INDEX IF NOT EXISTS transactions_payee_idx ON transactions(payee);
