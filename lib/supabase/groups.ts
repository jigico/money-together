import { supabase } from './client'

export interface GroupResult {
    success: boolean
    error?: string
    groupId?: string
    inviteCode?: string
}

/**
 * 새 그룹 생성 및 사용자를 관리자로 등록
 * @param userId 사용자 ID
 * @param groupName 그룹 이름
 * @param memberName 멤버 이름 (닉네임)
 */
export async function createGroup(
    userId: string,
    groupName: string,
    memberName: string
): Promise<GroupResult> {
    try {

        // 1. 그룹 생성 (invite_code는 트리거로 자동 생성)
        const { data, error: groupError } = await supabase
            .from('groups')
            // @ts-ignore
            .insert({ name: groupName } as any)
            .select('id, invite_code')
            .single()

        const group = data as { id: string; invite_code: string } | null

        if (groupError || !group) {
            return {
                success: false,
                error: groupError?.message || '그룹 생성에 실패했습니다.',
            }
        }

        // 2. 사용자를 그룹의 관리자로 등록
        const memberData = {
            group_id: group.id,
            user_id: userId,
            name: memberName,
            role: 'admin',
            avatar: '👤',
            color: '#3B82F6',
            bg_color: '#3B82F6',
        }

        const { error: memberError } = await supabase
            .from('members')
            // @ts-ignore
            .insert(memberData as any)

        if (memberError) {
            // 멤버 등록 실패 시 그룹도 삭제 (롤백)
            console.error('[createGroup] Member insert failed, rolling back group')
            await supabase.from('groups').delete().eq('id', group.id)

            return {
                success: false,
                error: '관리자 등록에 실패했습니다. ' + (memberError.message || ''),
            }
        }

        return {
            success: true,
            groupId: group.id,
            inviteCode: group.invite_code,
        }
    } catch (error) {
        console.error('[createGroup] Exception:', error)
        return {
            success: false,
            error: '그룹 생성 중 오류가 발생했습니다.',
        }
    }
}

/**
 * 초대 코드로 그룹 참여
 * @param userId 사용자 ID
 * @param inviteCode 초대 코드
 * @param memberName 멤버 이름 (닉네임)
 */
export async function joinGroupByCode(
    _userId: string,
    inviteCode: string,
    memberName: string
): Promise<GroupResult> {
    try {
        // 조회 + 검증 + 가입을 서버 측 SECURITY DEFINER RPC로 원자적 처리.
        // (groups 테이블 전체 열거를 막기 위해 클라이언트 직접 조회를 제거)
        const { data, error } = await (supabase as any).rpc('join_group_by_code', {
            p_code: inviteCode.toUpperCase().trim(),
            p_member_name: memberName,
        })

        if (error) {
            console.error('[joinGroupByCode] RPC error:', error)
            return { success: false, error: '그룹 참여 중 오류가 발생했습니다.' }
        }

        // RPC는 TABLE(group_id, group_name, status) 한 행을 반환
        const row = Array.isArray(data) ? data[0] : data
        const status = row?.status as string | undefined

        switch (status) {
            case 'joined':
            case 'already_member':
                return { success: true, groupId: row.group_id }
            case 'already_in_other_group':
                return { success: false, error: '이미 다른 그룹에 참여 중입니다.' }
            case 'invalid_code':
                return { success: false, error: '유효하지 않은 초대 코드입니다.' }
            case 'unauthenticated':
                return { success: false, error: '로그인이 필요합니다.' }
            default:
                return { success: false, error: '그룹 참여에 실패했습니다.' }
        }
    } catch (error) {
        console.error('[joinGroupByCode] Exception:', error)
        return {
            success: false,
            error: '그룹 참여 중 오류가 발생했습니다.',
        }
    }
}

/**
 * 그룹의 초대 코드 조회
 * @param groupId 그룹 ID
 */
export async function getGroupInviteCode(groupId: string): Promise<string | null> {
    try {
        const { data, error } = await supabase
            .from('groups')
            .select('invite_code')
            .eq('id', groupId)
            .single()

        const group = data as { invite_code: string } | null

        if (error || !group) {
            return null
        }

        return group.invite_code
    } catch (error) {
        return null
    }
}
