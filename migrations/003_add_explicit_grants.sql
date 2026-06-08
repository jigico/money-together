-- =====================================================
-- 마이그레이션 003: 명시적 Data API 접근 권한 추가
-- 실행 일시: 2026-06-06
-- 목적: Supabase의 새로운 Data API 노출 정책 대응
--       public 스키마 테이블에 anon, authenticated 역할 명시적 GRANT 부여
-- =====================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.groups TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.members TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.frequent_transactions TO anon, authenticated;
