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
    userId: string,
    inviteCode: string,
    memberName: string
): Promise<GroupResult> {
    try {
        // 1. 초대 코드로 그룹 조회
        const { data, error: groupError } = await supabase
            .from('groups')
            .select('id, name')
            .eq('invite_code', inviteCode.toUpperCase())
            .single()

        const group = data as { id: string; name: string } | null

        if (groupError || !group) {
            return {
                success: false,
                error: '유효하지 않은 초대 코드입니다.',
            }
        }

        // 2. 이미 그룹에 가입되어 있는지 확인
        const { data: existingMember } = await supabase
            .from('members')
            .select('id')
            .eq('group_id', group.id)
            .eq('user_id', userId)
            .single()

        if (existingMember) {
            return {
                success: false,
                error: '이미 이 그룹에 가입되어 있습니다.',
            }
        }

        // 3. 사용자를 멤버로 등록
        const { error: memberError } = await supabase
            .from('members')
            // @ts-ignore
            .insert({
                group_id: group.id,
                user_id: userId,
                name: memberName,
                role: 'member',
                avatar: '👤',
                color: '#10B981',
                bg_color: '#10B981',
            } as any)

        if (memberError) {
            return {
                success: false,
                error: '그룹 참여에 실패했습니다.',
            }
        }

        return {
            success: true,
            groupId: group.id,
        }
    } catch (error) {
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
