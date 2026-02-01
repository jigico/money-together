import { supabase } from './client'
import { getCurrentGroupId } from './helpers'

// 거래 추가 (그룹 ID 자동 포함)
export async function addTransaction(data: {
    amount: number
    category_id: string
    member_id: string
    description: string
    date?: string
}) {
    const groupId = await getCurrentGroupId()
    if (!groupId) {
        throw new Error('그룹 ID를 찾을 수 없습니다')
    }

    const { data: transaction, error } = await supabase
        .from('transactions')
        .insert([{
            group_id: groupId,
            amount: data.amount,
            category_id: data.category_id,
            member_id: data.member_id,
            description: data.description,
            date: data.date || new Date().toISOString().split('T')[0],
        }])
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
}>) {
    const { data: transaction, error } = await supabase
        .from('transactions')
        .update(data)
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
