-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration 005: 그룹 열거(enumeration) 취약점 수정
-- 실행 일자: 2026-07-11
-- 목적:
--   [심각] migration 004의 "Authenticated users can lookup groups by invite code"
--   정책은 로그인한 모든 사용자가 groups 테이블 전체(그룹명 + 초대코드)를 필터 없이
--   조회할 수 있게 만든다. RLS permissive 정책은 OR로 결합되므로 "자기 그룹만" 정책이
--   무력화된다. 공격자는 전체 초대코드를 열거해 임의 그룹에 가입 → 타 가구의 모든
--   거래·예산을 열람할 수 있다.
--
--   해결:
--   1) 넓은 groups SELECT 정책 삭제 → 자기 그룹만 조회 가능
--   2) 초대코드 조회/가입을 SECURITY DEFINER RPC로 처리(정확히 일치하는 코드만 반환,
--      전체 열거 불가)
--   3) members 직접 INSERT는 "그룹의 첫 멤버(=생성자)"만 허용, 기존 그룹 가입은
--      반드시 RPC를 경유하도록 강제(심층 방어)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. 그룹 전체 열거를 허용하던 정책 삭제
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Authenticated users can lookup groups by invite code" ON public.groups;

-- 이제 groups SELECT는 "Members can read own group" (id = user_group_id()) 만 남아
-- 자기 그룹 외에는 조회 불가.

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. RLS를 우회해 특정 그룹의 멤버 존재 여부만 확인하는 헬퍼
--    (아래 members INSERT 정책의 서브쿼리가 RLS에 막히지 않도록 SECURITY DEFINER)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.group_has_members(gid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.members WHERE group_id = gid);
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. members INSERT 정책 강화
--    기존: 인증된 사용자가 자기 user_id로 아무 그룹에나 삽입 가능(=임의 가입 가능)
--    변경: 멤버가 0명인 그룹(=방금 생성된 그룹)의 첫 멤버(생성자)로만 직접 삽입 허용.
--          이미 멤버가 있는 그룹 가입은 join_group_by_code RPC로만 가능.
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can insert themselves as members" ON public.members;

CREATE POLICY "Users can create first member of a group"
  ON public.members FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
    AND NOT public.group_has_members(group_id)
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. 초대코드로 그룹 가입 RPC (SECURITY DEFINER)
--    - 정확히 일치하는 초대코드만 조회(열거 불가)
--    - 이미 가입/타 그룹 소속 여부 검증
--    - 검증 통과 시에만 멤버 삽입
--    반환 status: 'joined' | 'already_member' | 'already_in_other_group'
--                 | 'invalid_code' | 'unauthenticated'
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.join_group_by_code(p_code TEXT, p_member_name TEXT)
RETURNS TABLE(group_id UUID, group_name TEXT, status TEXT) AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_group_id UUID;
  v_group_name TEXT;
BEGIN
  IF v_uid IS NULL THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, 'unauthenticated'::TEXT;
    RETURN;
  END IF;

  SELECT g.id, g.name INTO v_group_id, v_group_name
  FROM public.groups g
  WHERE g.invite_code = upper(trim(p_code))
  LIMIT 1;

  IF v_group_id IS NULL THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, 'invalid_code'::TEXT;
    RETURN;
  END IF;

  -- 이미 어떤 그룹에 속해 있는지 확인 (members.user_id UNIQUE)
  IF EXISTS (SELECT 1 FROM public.members WHERE user_id = v_uid) THEN
    IF EXISTS (SELECT 1 FROM public.members WHERE user_id = v_uid AND members.group_id = v_group_id) THEN
      RETURN QUERY SELECT v_group_id, v_group_name, 'already_member'::TEXT;
    ELSE
      RETURN QUERY SELECT NULL::UUID, NULL::TEXT, 'already_in_other_group'::TEXT;
    END IF;
    RETURN;
  END IF;

  INSERT INTO public.members (group_id, user_id, name, role, avatar, color, bg_color)
  VALUES (v_group_id, v_uid, p_member_name, 'member', '👤', '#10B981', '#10B981');

  RETURN QUERY SELECT v_group_id, v_group_name, 'joined'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 실행 권한: 인증된 사용자만
REVOKE ALL ON FUNCTION public.join_group_by_code(TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.join_group_by_code(TEXT, TEXT) TO authenticated;

-- group_has_members는 정책 내부에서만 쓰이지만 명시적으로 제한
REVOKE ALL ON FUNCTION public.group_has_members(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.group_has_members(UUID) TO authenticated;
