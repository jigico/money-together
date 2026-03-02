import { supabase } from './client'
import type { Transaction, Category, Member, TransactionUI, CategoryDataUI, MemberSpendingUI, TransactionType } from '@/types/database'
import { transactionToUI, memberToUI } from '@/types/database'
import { getCurrentGroupId } from './helpers'

// 거래 내역 가져오기 (그룹 필터링 포함)
export async function getTransactions(startDate?: string, endDate?: string) {
    const groupId = await getCurrentGroupId()
    if (!groupId) {
        console.error('No group ID found')
        return []
    }

    let query = supabase
        .from('transactions')
        .select(`
      *,
      category:categories(*),
      member:members(*)
    `)
        .eq('group_id', groupId)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

    if (startDate) {
        query = query.gte('date', startDate)
    }
    if (endDate) {
        query = query.lte('date', endDate)
    }

    const { data, error } = await query

    if (error) {
        console.error('Error fetching transactions:', error)
        return []
    }

    // UI 형식으로 변환
    return data.map((tx: any) => transactionToUI(tx, tx.category, tx.member))
}

// 단일 거래 내역 가져오기 (ID로 조회)
export async function getSingleTransaction(id: string) {
    const groupId = await getCurrentGroupId()
    if (!groupId) {
        console.error('No group ID found')
        return null
    }

    const { data, error } = await supabase
        .from('transactions')
        .select(`
      *,
      category:categories(*),
      member:members(*)
    `)
        .eq('id', id)
        .eq('group_id', groupId)
        .single()

    if (error) {
        console.error('Error fetching transaction:', error)
        return null
    }

    // 타입 단언을 사용하여 데이터 반환
    const transaction = data as any

    return {
        ...transaction,
        ui: transactionToUI(transaction, transaction.category, transaction.member)
    }
}



// 멤버별 지출 합계 (그룹 필터링 포함)
export async function getMemberSpending(startDate?: string, endDate?: string): Promise<MemberSpendingUI[]> {
    const groupId = await getCurrentGroupId()
    if (!groupId) {
        console.error('No group ID found')
        return []
    }

    // 현재 그룹의 멤버 가져오기
    const { data: members, error: membersError } = await supabase
        .from('members')
        .select('*')
        .eq('group_id', groupId)

    if (membersError || !members) {
        console.error('Error fetching members:', membersError)
        return []
    }

    // Type assertion to ensure TypeScript knows the shape of members
    const typedMembers = members as Member[]

    // 각 멤버별 지출 합계 계산
    const memberSpending = await Promise.all(
        typedMembers.map(async (member) => {
            let query = supabase
                .from('transactions')
                .select('amount')
                .eq('group_id', groupId)
                .eq('member_id', member.id)
                .eq('transaction_type', 'expense')

            if (startDate) {
                query = query.gte('date', startDate)
            }
            if (endDate) {
                query = query.lte('date', endDate)
            }

            const { data: transactions }: { data: { amount: number }[] | null } = await query

            const totalAmount = transactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0

            return memberToUI(member, totalAmount)
        })
    )

    return memberSpending
}

// 카테고리별 지출 합계 (그룹 필터링 포함)
export async function getCategorySpending(startDate?: string, endDate?: string): Promise<CategoryDataUI[]> {
    const groupId = await getCurrentGroupId()
    if (!groupId) {
        console.error('No group ID found')
        return []
    }

    let query = supabase
        .from('transactions')
        .select(`
      amount,
      category:categories(*)
    `)
        .eq('group_id', groupId)
        .eq('transaction_type', 'expense')

    if (startDate) {
        query = query.gte('date', startDate)
    }
    if (endDate) {
        query = query.lte('date', endDate)
    }

    const { data, error } = await query

    if (error || !data) {
        console.error('Error fetching category spending:', error)
        return []
    }

    // 카테고리별로 그룹화
    const categoryMap = new Map<string, { name: string; value: number; color: string }>()

    data.forEach((tx: any) => {
        const categoryName = tx.category.name
        const existing = categoryMap.get(categoryName)

        if (existing) {
            existing.value += tx.amount
        } else {
            categoryMap.set(categoryName, {
                name: categoryName,
                value: tx.amount,
                color: tx.category.color,
            })
        }
    })

    return Array.from(categoryMap.values())
}

// 월별 지출 추이 (그룹 필터링 포함)
export async function getMonthlySpending(monthsBack: number = 5): Promise<{ month: string; amount: number }[]> {
    const groupId = await getCurrentGroupId()
    if (!groupId) {
        console.error('No group ID found')
        return []
    }

    const now = new Date()
    const monthlyData: { month: string; amount: number }[] = []

    for (let i = monthsBack - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const pad = (n: number) => String(n).padStart(2, '0')
        const y = date.getFullYear()
        const m = date.getMonth() + 1
        const startOfMonth = `${y}-${pad(m)}-01`
        const lastDay = new Date(y, m, 0).getDate()
        const endOfMonth = `${y}-${pad(m)}-${pad(lastDay)}`

        const { data }: { data: { amount: number }[] | null } = await supabase
            .from('transactions')
            .select('amount')
            .eq('group_id', groupId)
            .eq('transaction_type', 'expense')
            .gte('date', startOfMonth)
            .lte('date', endOfMonth)

        const totalAmount = data?.reduce((sum, tx) => sum + tx.amount, 0) || 0

        monthlyData.push({
            month: `${date.getMonth() + 1}월`,
            amount: totalAmount,
        })
    }

    return monthlyData
}

// Top 카테고리 (지출 상위 N개, 그룹 필터링 포함)
export async function getTopCategories(limit: number = 3, startDate?: string, endDate?: string) {
    const categorySpending = await getCategorySpending(startDate, endDate)

    // 금액 기준 내림차순 정렬 후 상위 N개
    const topCategories = categorySpending
        .sort((a, b) => b.value - a.value)
        .slice(0, limit)
        .map((category, index) => ({
            rank: index + 1,
            name: category.name,
            amount: category.value,
            icon: getIconForCategory(category.name),
            color: getCategoryColorClass(category.name),
        }))

    return topCategories
}

// 전체 지출 합계 가져오기 (그룹 필터링 포함)
export async function getTotalSpending(startDate?: string, endDate?: string): Promise<number> {
    const groupId = await getCurrentGroupId()
    if (!groupId) {
        console.error('No group ID found')
        return 0
    }

    let query = supabase
        .from('transactions')
        .select('amount')
        .eq('group_id', groupId)
        .eq('transaction_type', 'expense')

    if (startDate) {
        query = query.gte('date', startDate)
    }
    if (endDate) {
        query = query.lte('date', endDate)
    }

    const { data, error }: { data: { amount: number }[] | null; error: any } = await query

    if (error || !data) {
        console.error('Error fetching total spending:', error)
        return 0
    }

    return data.reduce((sum, tx) => sum + tx.amount, 0)
}

// 유형별 합계 가져오기 (income/expense/savings/investment)
export async function getTotalByType(
    type: TransactionType,
    startDate?: string,
    endDate?: string
): Promise<number> {
    const groupId = await getCurrentGroupId()
    if (!groupId) return 0

    let query = (supabase as any)
        .from('transactions')
        .select('amount')
        .eq('group_id', groupId)
        .eq('transaction_type', type)

    if (startDate) query = query.gte('date', startDate)
    if (endDate) query = query.lte('date', endDate)

    const { data, error } = await query

    if (error || !data) return 0
    return (data as { amount: number }[]).reduce((sum, tx) => sum + tx.amount, 0)
}

// 멤버별 재무 종합 요약 (수입/지출/저축/투자 + 상위 지출 카테고리)
export interface MemberFinancialSummary {
    memberId: string
    memberName: string
    memberAvatar: string
    memberColor: string
    memberBgColor: string
    income: number
    expense: number
    savings: number
    investment: number
    topCategories: { name: string; amount: number; color: string }[]
}

export async function getMemberFinancialSummary(
    startDate?: string,
    endDate?: string
): Promise<MemberFinancialSummary[]> {
    const groupId = await getCurrentGroupId()
    if (!groupId) return []

    const { data: members, error: membersError } = await supabase
        .from('members')
        .select('*')
        .eq('group_id', groupId)

    if (membersError || !members) return []

    const summaries = await Promise.all(
        (members as Member[]).map(async (member) => {
            const types: TransactionType[] = ['income', 'expense', 'savings', 'investment']
            const totals = await Promise.all(
                types.map(async (type) => {
                    let query = (supabase as any)
                        .from('transactions')
                        .select('amount')
                        .eq('group_id', groupId)
                        .eq('member_id', member.id)
                        .eq('transaction_type', type)

                    if (startDate) query = query.gte('date', startDate)
                    if (endDate) query = query.lte('date', endDate)

                    const { data } = await query
                    return (data as { amount: number }[] | null)?.reduce((s, tx) => s + tx.amount, 0) || 0
                })
            )

            // 지출 카테고리별 집계
            let catQuery = (supabase as any)
                .from('transactions')
                .select('amount, category:categories(name, color)')
                .eq('group_id', groupId)
                .eq('member_id', member.id)
                .eq('transaction_type', 'expense')

            if (startDate) catQuery = catQuery.gte('date', startDate)
            if (endDate) catQuery = catQuery.lte('date', endDate)

            const { data: catData } = await catQuery

            const catMap = new Map<string, { amount: number; color: string }>()
                ; (catData as { amount: number; category: { name: string; color: string } }[] | null)?.forEach((tx) => {
                    const name = tx.category?.name
                    const color = tx.category?.color || '#9CA3AF'
                    if (!name) return
                    const existing = catMap.get(name)
                    if (existing) existing.amount += tx.amount
                    else catMap.set(name, { amount: tx.amount, color })
                })

            const sorted = Array.from(catMap.entries())
                .map(([name, v]) => ({ name, ...v }))
                .sort((a, b) => b.amount - a.amount)

            const top3 = sorted.slice(0, 3)
            const rest = sorted.slice(3)
            if (rest.length > 0) {
                const otherAmount = rest.reduce((s, c) => s + c.amount, 0)
                top3.push({ name: '기타', amount: otherAmount, color: '#9CA3AF' })
            }

            return {
                memberId: member.id,
                memberName: member.name,
                memberAvatar: member.avatar,
                memberColor: member.color,
                memberBgColor: member.bg_color,
                income: totals[0],
                expense: totals[1],
                savings: totals[2],
                investment: totals[3],
                topCategories: top3,
            }
        })
    )

    return summaries
}

// 카테고리 목록 가져오기 (공통)
export async function getCategories() {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

    if (error) {
        console.error('Error fetching categories:', error)
        return []
    }

    return data
}

// 현재 그룹의 멤버 목록 가져오기
export async function getMembers(): Promise<Member[]> {
    const groupId = await getCurrentGroupId()
    if (!groupId) {
        console.error('No group ID found')
        return []
    }

    const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('group_id', groupId)

    if (error) {
        console.error('Error fetching members:', error)
        return []
    }

    return data || []
}

// 카테고리별 아이콘 매핑
function getIconForCategory(categoryName: string): string {
    const iconMap: Record<string, string> = {
        '식비': '🍽️',
        '교통': '🚗',
        '카페': '☕',
        '생활': '🧺',
        '주거': '🏠',
        '병원': '🏥',
        '기타': '📦',
    }
    return iconMap[categoryName] || '📦'
}

// 카테고리별 색상 클래스 매핑
function getCategoryColorClass(categoryName: string): string {
    const colorMap: Record<string, string> = {
        '식비': 'bg-rose-100',
        '교통': 'bg-blue-100',
        '카페': 'bg-amber-100',
        '생활': 'bg-purple-100',
        '주거': 'bg-green-100',
        '병원': 'bg-pink-100',
        '기타': 'bg-gray-100',
    }
    return colorMap[categoryName] || 'bg-gray-100'
}
