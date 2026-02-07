import { supabase } from './client'

// 현재 그룹 ID 가져오기
// 캐싱을 사용하여 반복 호출 최적화
let cachedGroupId: string | null = null

export async function getCurrentGroupId(): Promise<string | null> {
    // 이미 캐시된 값이 있으면 반환
    if (cachedGroupId) {
        return cachedGroupId
    }

    try {
        // 현재 로그인한 사용자 조회
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            console.error('No authenticated user found')
            return null
        }

        // 사용자가 속한 그룹 조회
        const { data, error } = await supabase
            .from('members')
            .select('group_id')
            .eq('user_id', user.id)
            .single() as { data: { group_id: string } | null, error: any }

        if (error || !data) {
            console.error('Error fetching user group:', error)
            return null
        }

        // 캐시에 저장
        cachedGroupId = data.group_id
        return data.group_id
    } catch (error) {
        console.error('Error in getCurrentGroupId:', error)
        return null
    }
}

// 캐시 초기화 (로그아웃 시 등)
export function clearGroupCache() {
    cachedGroupId = null
}
