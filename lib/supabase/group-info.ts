import { supabase } from './client'
import { getCurrentGroupId } from './helpers'

// 현재 그룹 정보 가져오기 (초대 코드 포함)
export async function getCurrentGroupInfo() {
    const groupId = await getCurrentGroupId()
    if (!groupId) {
        return null
    }

    const { data, error } = await supabase
        .from('groups')
        .select('id, name, invite_code, created_at')
        .eq('id', groupId)
        .single()

    if (error) {
        console.error('Error fetching group info:', error)
        return null
    }

    return data
}
