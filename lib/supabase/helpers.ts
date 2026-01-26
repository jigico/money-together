import { supabase } from './client'

// 현재 그룹 ID 가져오기 (MVP: Supabase에서 조회)
// 캐싱을 사용하여 반복 호출 최적화
let cachedGroupId: string | null = null

export async function getCurrentGroupId(): Promise<string | null> {
    // 이미 캐시된 값이 있으면 반환
    if (cachedGroupId) {
        return cachedGroupId
    }

    // MVP 단계에서는 'MVP 부부' 그룹의 ID를 가져옴
    // 추후 인증 시에는 로그인한 사용자의 group_id를 반환
    try {
        const { data, error } = await supabase
            .from('groups')
            .select('id')
            .eq('name', 'MVP 부부')
            .single() as { data: { id: string } | null, error: any }

        if (error || !data) {
            console.error('Error fetching current group:', error)
            return null
        }

        // 캐시에 저장
        cachedGroupId = data.id
        return data.id
    } catch (error) {
        console.error('Error in getCurrentGroupId:', error)
        return null
    }
}

// 캐시 초기화 (로그아웃 시 등)
export function clearGroupCache() {
    cachedGroupId = null
}
