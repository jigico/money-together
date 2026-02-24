import { supabase } from './client'
import { getCurrentGroupId } from './helpers'
import type { TransactionType } from '@/types/database'

// 거래 추가 (그룹 ID 자동 포함)
export async function addTransaction(data: {
    amount: number
    category_id: string
    member_id: string
    description: string
    date?: string
    transaction_type?: TransactionType
}) {
    const groupId = await getCurrentGroupId()
    if (!groupId) {
        throw new Error('그룹 ID를 찾을 수 없습니다')
    }

    const { data: transaction, error } = await supabase
        .from('transactions')
        // @ts-ignore
        .insert([{
            group_id: groupId,
            amount: data.amount,
            category_id: data.category_id,
            member_id: data.member_id,
            description: data.description,
            date: data.date || new Date().toISOString().split('T')[0],
            transaction_type: data.transaction_type || 'expense',
        }] as any)
        .select()
        .single()

    if (error) {
        console.error('Error adding transaction:', error)
        throw new Error('거래 추가 실패')
    }

    return transaction
}

// 거래 수정
export async function updateTransaction(id: string, data: Partial<{
    amount: number
    category_id: string
    member_id: string
    description: string
    date: string
    transaction_type: TransactionType
}>) {
    const { data: transaction, error } = await supabase
        .from('transactions')
        // @ts-ignore
        .update(data as any)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('Error updating transaction:', error)
        throw new Error('거래 수정 실패')
    }

    return transaction
}

// 거래 삭제
export async function deleteTransaction(id: string) {
    const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting transaction:', error)
        throw new Error('거래 삭제 실패')
    }

    return true
}

// 내 멤버 이름 수정 (members 테이블 + Auth 메타데이터 동시 업데이트)
export async function updateMemberName(name: string): Promise<{ success: boolean; error?: string }> {
    try {
        // 1. 현재 사용자 ID 조회
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: '로그인이 필요합니다.' }

        // 2. 현재 그룹의 멤버 row 찾아 name 업데이트
        const groupId = await getCurrentGroupId()
        if (!groupId) return { success: false, error: '그룹 정보를 찾을 수 없습니다.' }

        const { error: memberError } = await supabase
            .from('members')
            // @ts-ignore
            .update({ name } as any)
            .eq('user_id', user.id)
            .eq('group_id', groupId)

        if (memberError) {
            return { success: false, error: '이름 변경에 실패했습니다.' }
        }

        // 3. Auth 메타데이터의 nickname도 동기화
        await supabase.auth.updateUser({ data: { nickname: name } })

        return { success: true }
    } catch (error) {
        console.error('Error updating member name:', error)
        return { success: false, error: '이름 변경 중 오류가 발생했습니다.' }
    }
}
