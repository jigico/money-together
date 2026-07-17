import { supabase } from './client'
import type { Transaction, Category, Member, TransactionUI, CategoryDataUI, MemberSpendingUI, TransactionType, FrequentTransaction } from '@/types/database'
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



// ─────────────────────────────────────────────────────────────────────────────
// 대시보드 집계 통합 쿼리
// 단일 쿼리로 amount + transaction_type 가져와 클라이언트에서 집계
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

// 카테고리 목록 가져오기 (is_system=false인 항목만 - 미분류 노출 차단)
// NOTE: DB 마이그레이션 전에는 is_system 컬럼이 없으므로 전체 조회로 폴백
export async function getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_system', false)
        .order('name')

    if (error) {
        // is_system 컬럼이 없는 경우 (마이그레이션 전) 전체 조회로 폴백
        console.warn('getCategories fallback (is_system column may not exist yet):', error.message)
        const { data: fallbackData, error: fallbackError } = await supabase
            .from('categories')
            .select('*')
            .order('name')

        if (fallbackError) {
            console.error('Error fetching categories:', fallbackError)
            return []
        }

        // 마이그레이션 전: is_system이 없으므로 모든 카테고리 반환
        return (fallbackData ?? []).map((c: any) => ({ ...c, is_system: c.is_system ?? false })) as Category[]
    }

    return data as Category[]
}

// 자주 쓰는 내역 목록 가져오기 (그룹 기준, usage_count DESC 정렬, 최대 15개)
export async function getFrequentTransactions(): Promise<FrequentTransaction[]> {
    const groupId = await getCurrentGroupId()
    if (!groupId) return []

    const { data, error } = await supabase
        .from('frequent_transactions')
        .select('*')
        .eq('group_id', groupId)
        .order('usage_count', { ascending: false })
        .limit(15)

    if (error) {
        console.error('Error fetching frequent transactions:', error)
        return []
    }

    return data as FrequentTransaction[]
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

// ─────────────────────────────────────────────────────────────────────────────
// 통계 페이지 전용 통합 조회 함수
// 이번 달 트랜잭션을 한 번만 조회한 뒤 메모리에서 카테고리/멤버별로 조립한다.
// (멤버마다 별도 쿼리를 던지던 N+1 방식을 대체)
// ─────────────────────────────────────────────────────────────────────────────

export interface StatsDashboardData {
    categoryData: CategoryDataUI[]
    memberSpending: MemberSpendingUI[]
    totalSpending: number
    totalIncome: number
    totalSavings: number
    totalInvestment: number
    memberFinancials: MemberFinancialSummary[]
}

export async function getStatsDashboardData(
    startDate: string,
    endDate: string
): Promise<StatsDashboardData> {
    const empty: StatsDashboardData = {
        categoryData: [],
        memberSpending: [],
        totalSpending: 0,
        totalIncome: 0,
        totalSavings: 0,
        totalInvestment: 0,
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
    // 유형별 그룹 전체 합계
    let totalSpending = 0
    let totalIncome = 0
    let totalSavings = 0
    let totalInvestment = 0

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

        // 유형별 그룹 전체 합계
        if (type === 'income') totalIncome += amount
        else if (type === 'savings') totalSavings += amount
        else if (type === 'investment') totalInvestment += amount

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
        totalSpending,
        totalIncome,
        totalSavings,
        totalInvestment,
        memberFinancials
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 카테고리별 지출 상세 (해당 월 + 전월을 단일 쿼리로 조회해 증감 계산)
// ─────────────────────────────────────────────────────────────────────────────

export interface CategoryDetailItem {
    name: string
    amount: number
    color: string
    prevAmount: number
}

export async function getCategoryDetail(year: number, month: number): Promise<CategoryDetailItem[]> {
    const groupId = await getCurrentGroupId()
    if (!groupId) return []

    const pad = (n: number) => String(n).padStart(2, '0')

    // 전월 1일 ~ 해당 월 말일까지 한 번에 조회
    const prevMonth = month === 1 ? 12 : month - 1
    const prevYear = month === 1 ? year - 1 : year
    const startStr = `${prevYear}-${pad(prevMonth)}-01`
    const lastDay = new Date(year, month, 0).getDate()
    const endStr = `${year}-${pad(month)}-${pad(lastDay)}`

    const { data, error } = await supabase
        .from('transactions')
        .select('date, amount, category:categories(name, color)')
        .eq('group_id', groupId)
        .eq('transaction_type', 'expense')
        .gte('date', startStr)
        .lte('date', endStr)

    if (error || !data) {
        console.error('Error fetching category detail:', error)
        return []
    }

    const curKey = `${year}-${pad(month)}`
    const map = new Map<string, CategoryDetailItem>()

    data.forEach((tx: any) => {
        const name = tx.category?.name || '기타'
        const color = tx.category?.color || '#9CA3AF'
        const isCurrentMonth = tx.date.substring(0, 7) === curKey

        const existing = map.get(name)
        if (existing) {
            if (isCurrentMonth) existing.amount += tx.amount
            else existing.prevAmount += tx.amount
        } else {
            map.set(name, {
                name,
                color,
                amount: isCurrentMonth ? tx.amount : 0,
                prevAmount: isCurrentMonth ? 0 : tx.amount,
            })
        }
    })

    // 이번 달 지출이 있는 카테고리만, 금액 내림차순
    return Array.from(map.values())
        .filter((c) => c.amount > 0)
        .sort((a, b) => b.amount - a.amount)
}

// ─────────────────────────────────────────────────────────────────────────────
// 월별 재무 추이 통합 조회 (지출 + 저축 + 투자, 단일 쿼리)
// ─────────────────────────────────────────────────────────────────────────────

export interface MonthlyTrendData {
    month: string
    expense: number
    savings: number
    investment: number
}

export async function getMonthlyFinancialTrend(monthsBack: number = 5): Promise<MonthlyTrendData[]> {
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
        .select('date, amount, transaction_type')
        .eq('group_id', groupId)
        .in('transaction_type', ['expense', 'savings', 'investment'])
        .gte('date', startStr)
        .lte('date', endStr)

    if (error || !transactions) return []

    // 2. 월별로 그룹화
    // 기본 배열 세팅 (과거 월 -> 현재 월)
    const monthlyData: (MonthlyTrendData & { key: string })[] = []

    for (let i = monthsBack - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
        monthlyData.push({
            month: `${d.getMonth() + 1}월`,
            expense: 0,
            savings: 0,
            investment: 0,
            key
        })
    }

    // 데이터 합산
    transactions.forEach((tx: any) => {
        // tx.date: '2024-03-21' -> key: '2024-03'
        const txKey = tx.date.substring(0, 7)
        const targetMonth = monthlyData.find(m => m.key === txKey)
        if (targetMonth) {
            targetMonth[tx.transaction_type as 'expense' | 'savings' | 'investment'] += tx.amount
        }
    })

    return monthlyData.map(({ month, expense, savings, investment }) => ({ month, expense, savings, investment }))
}
