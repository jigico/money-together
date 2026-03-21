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

// ─────────────────────────────────────────────────────────────────────────────
// 대시보드 집계 통합 쿼리
// 이전: getTotalSpending + getTotalByType x3 = 4개 별도 요청
// 이후: 단일 쿼리로 amount + transaction_type 가져와 클라이언트에서 집계
// ─────────────────────────────────────────────────────────────────────────────

export interface DashboardSummary {
    expense: number
    income: number
    savings: number
    investment: number
}

export async function getDashboardSummary(
    startDate: string,
    endDate: string
): Promise<DashboardSummary> {
    const empty: DashboardSummary = { expense: 0, income: 0, savings: 0, investment: 0 }

    const groupId = await getCurrentGroupId()
    if (!groupId) return empty

    const { data, error } = await (supabase as any)
        .from('transactions')
        .select('amount, transaction_type')
        .eq('group_id', groupId)
        .gte('date', startDate)
        .lte('date', endDate)

    if (error || !data) {
        console.error('Error fetching dashboard summary:', error)
        return empty
    }

    return (data as { amount: number; transaction_type: string }[]).reduce(
        (acc, tx) => {
            const key = tx.transaction_type as keyof DashboardSummary
            if (key in acc) acc[key] += tx.amount
            return acc
        },
        { ...empty }
    )
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

// ─────────────────────────────────────────────────────────────────────────────
// 통계 페이지 전용 통합 조회 함수 (O(N) -> O(1) 최적화)
// 문제점: getCategorySpending, getMemberSpending, getTopCategories, 
//         getMemberFinancialSummary가 개별적으로 `transactions`를 조회하며
//         특히 N+1 쿼리(멤버마다 별도 쿼리)를 발생시킴.
// 해결책: 이번 달 트랜잭션을 한 번만 조회한 뒤 메모리에서 조립함.
// ─────────────────────────────────────────────────────────────────────────────

export interface StatsDashboardData {
    categoryData: CategoryDataUI[]
    memberSpending: MemberSpendingUI[]
    topCategories: any[]
    totalSpending: number
    memberFinancials: MemberFinancialSummary[]
}

export async function getStatsDashboardData(
    startDate: string,
    endDate: string
): Promise<StatsDashboardData> {
    const empty: StatsDashboardData = {
        categoryData: [],
        memberSpending: [],
        topCategories: [],
        totalSpending: 0,
        memberFinancials: []
    }

    const groupId = await getCurrentGroupId()
    if (!groupId) return empty

    // 1. Members 단일 조회
    const { data: members, error: membersError } = await supabase
        .from('members')
        .select('*')
        .eq('group_id', groupId)

    if (membersError || !members) return empty
    const typedMembers = members as Member[]

    // 2. Transactions (이번 달 전체) 단일 조회
    const { data: transactions, error: txError } = await supabase
        .from('transactions')
        .select(`
            amount,
            transaction_type,
            member_id,
            category:categories(name, color)
        `)
        .eq('group_id', groupId)
        .gte('date', startDate)
        .lte('date', endDate)

    if (txError || !transactions) return empty

    // ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ
    // 3. 메모리 상에서 데이터 집계 (Reducer)
    // ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // 카테고리별 지출 (expense만)
    const categoryMap = new Map<string, { value: number; color: string }>()
    // 전체 지출 (expense만)
    let totalSpending = 0
    
    // 멤버별 각종 데이터 맵
    const memberMap = new Map<string, {
        expense: number, income: number, savings: number, investment: number,
        catMap: Map<string, { amount: number, color: string }>
    }>()

    // 맵 초기화
    typedMembers.forEach(m => {
        memberMap.set(m.id, {
            expense: 0, income: 0, savings: 0, investment: 0,
            catMap: new Map()
        })
    })

    // 1-Pass 반복
    transactions.forEach((tx: any) => {
        const type = tx.transaction_type as TransactionType
        const amount = tx.amount
        const memberId = tx.member_id

        // 멤버별 합계
        const mData = memberMap.get(memberId)
        if (mData) {
            mData[type] += amount
        }

        // 지출(expense)인 경우 카테고리/전체 합산 처리
        if (type === 'expense') {
            totalSpending += amount

            // 전체 카테고리 통계
            const catName = tx.category?.name || '기타'
            const catColor = tx.category?.color || '#9CA3AF'
            
            const existingCat = categoryMap.get(catName)
            if (existingCat) existingCat.value += amount
            else categoryMap.set(catName, { value: amount, color: catColor })

            // 멤버별 카테고리 통계
            if (mData) {
                const mCatExisting = mData.catMap.get(catName)
                if (mCatExisting) mCatExisting.amount += amount
                else mData.catMap.set(catName, { amount, color: catColor })
            }
        }
    })

    // ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ
    // 4. UI 포맷으로 변환
    // ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // CategoryDataUI
    const categoryData: CategoryDataUI[] = Array.from(categoryMap.entries()).map(([name, data]) => ({
        name,
        value: data.value,
        color: data.color
    }))

    // TopCategories (정렬 & 매핑)
    const topCategories = [...categoryData]
        .sort((a, b) => b.value - a.value)
        .slice(0, 3)
        .map((cat, index) => ({
            rank: index + 1,
            name: cat.name,
            amount: cat.value,
            icon: getIconForCategory(cat.name),
            color: getCategoryColorClass(cat.name)
        }))

    // MemberSpendingUI & MemberFinancialSummary
    const memberSpending: MemberSpendingUI[] = []
    const memberFinancials: MemberFinancialSummary[] = []

    typedMembers.forEach(member => {
        const mData = memberMap.get(member.id)!
        
        // MemberSpendingUI
        memberSpending.push(memberToUI(member, mData.expense))

        // MemberFinancialSummary 내 topCategories 조립
        const sortedCats = Array.from(mData.catMap.entries())
            .map(([name, val]) => ({ name, ...val }))
            .sort((a, b) => b.amount - a.amount)
        
        const top3 = sortedCats.slice(0, 3)
        const rest = sortedCats.slice(3)
        if (rest.length > 0) {
            const otherAmount = rest.reduce((s, c) => s + c.amount, 0)
            top3.push({ name: '기타', amount: otherAmount, color: '#9CA3AF' })
        }

        memberFinancials.push({
            memberId: member.id,
            memberName: member.name,
            memberAvatar: member.avatar,
            memberColor: member.color,
            memberBgColor: member.bg_color,
            income: mData.income,
            expense: mData.expense,
            savings: mData.savings,
            investment: mData.investment,
            topCategories: top3
        })
    })

    return {
        categoryData,
        memberSpending,
        topCategories,
        totalSpending,
        memberFinancials
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 월별 지출 추이 통합 조회 (5개 쿼리 -> 1개 쿼리로 최적화)
// ─────────────────────────────────────────────────────────────────────────────

export async function getOptimizedMonthlySpending(monthsBack: number = 5): Promise<{ month: string; amount: number }[]> {
    const groupId = await getCurrentGroupId()
    if (!groupId) return []

    const now = new Date()
    // 시작일(N개월 전 1일)
    const startDateObj = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1), 1)
    const pad = (n: number) => String(n).padStart(2, '0')
    const startStr = `${startDateObj.getFullYear()}-${pad(startDateObj.getMonth() + 1)}-01`
    
    // 종료일(이번 달 말일)
    const endStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate())}`

    // 1. 단일 쿼리로 전체 범위 가져오기
    const { data: transactions, error } = await supabase
        .from('transactions')
        .select('date, amount')
        .eq('group_id', groupId)
        .eq('transaction_type', 'expense')
        .gte('date', startStr)
        .lte('date', endStr)

    if (error || !transactions) return []

    // 2. 월별로 그룹화
    // 기본 배열 세팅 (과거 월 -> 현재 월)
    const monthlyData: { month: string; amount: number; key: string }[] = []
    
    for (let i = monthsBack - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
        monthlyData.push({
            month: `${d.getMonth() + 1}월`,
            amount: 0,
            key
        })
    }

    // 데이터 합산
    transactions.forEach((tx: any) => {
        // tx.date: '2024-03-21' -> key: '2024-03'
        const txKey = tx.date.substring(0, 7)
        const targetMonth = monthlyData.find(m => m.key === txKey)
        if (targetMonth) {
            targetMonth.amount += tx.amount
        }
    })

    return monthlyData.map(({ month, amount }) => ({ month, amount }))
}
