import { supabase } from './client'
import { getCurrentGroupId } from './helpers'

const DEFAULT_BUDGET = 2_000_000

export interface Budget {
    id: string
    group_id: string
    year: number
    month: number
    amount: number
    updated_by: string | null
    updated_at: string
}

// 해당 월 예산 조회 (없으면 전월 조회, 그것도 없으면 기본값)
export async function getBudget(year: number, month: number): Promise<number> {
    const groupId = await getCurrentGroupId()
    if (!groupId) return DEFAULT_BUDGET

    // 이번 달 예산 조회
    const { data: current } = await supabase
        .from('budgets')
        .select('amount')
        .eq('group_id', groupId)
        .eq('year', year)
        .eq('month', month)
        .single() as { data: { amount: number } | null }

    if (current) return current.amount

    // 전월 예산 조회
    const prevMonth = month === 1 ? 12 : month - 1
    const prevYear = month === 1 ? year - 1 : year

    const { data: prev } = await supabase
        .from('budgets')
        .select('amount')
        .eq('group_id', groupId)
        .eq('year', prevYear)
        .eq('month', prevMonth)
        .single() as { data: { amount: number } | null }

    return prev ? prev.amount : DEFAULT_BUDGET
}

// 예산 생성 또는 수정 (upsert)
export async function upsertBudget(
    year: number,
    month: number,
    amount: number,
    memberId: string
): Promise<{ success: boolean; error?: string }> {
    const groupId = await getCurrentGroupId()
    if (!groupId) return { success: false, error: '그룹 정보를 찾을 수 없습니다.' }

    const { error } = await (supabase
        .from('budgets') as any)
        .upsert(
            {
                group_id: groupId,
                year,
                month,
                amount,
                updated_by: memberId,
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'group_id,year,month' }
        )

    if (error) {
        console.error('Error upserting budget:', error)
        return { success: false, error: error.message }
    }

    return { success: true }
}
