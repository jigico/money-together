"use client"

import { useEffect, useState } from "react"
import { UserAvatars } from "@/components/dashboard/user-avatars"
import { SpendingSummaryCard } from "@/components/dashboard/spending-summary-card"
import { QuickStatsGrid } from "@/components/dashboard/quick-stats-grid"
import { TransactionList, type Transaction } from "@/components/dashboard/transaction-list"
import { FloatingActionButton } from "@/components/dashboard/floating-action-button"
import { getTransactions, getTotalSpending, getMembers, getTotalByType } from "@/lib/supabase/queries"
import { getBudget } from "@/lib/supabase/budget"
import { IncomeRatioCard } from "@/components/dashboard/income-ratio-card"
import type { Member } from "@/types/database"

export default function MoneyTogetherDashboard() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [members, setMembers] = useState<Member[]>([])
    const [totalSpent, setTotalSpent] = useState(0)
    const [todaySpent, setTodaySpent] = useState(0)
    const [monthlyChange, setMonthlyChange] = useState<number | null>(null)
    const [budget, setBudget] = useState(2_000_000)
    const [income, setIncome] = useState(0)
    const [savingsTotal, setSavingsTotal] = useState(0)
    const [investmentTotal, setInvestmentTotal] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            try {
                // 현재 월의 시작일과 종료일
                const now = new Date()
                const year = now.getFullYear()
                const month = now.getMonth() + 1
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
                    .toISOString().split('T')[0]
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
                    .toISOString().split('T')[0]

                // 전월의 시작일과 종료일
                const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
                    .toISOString().split('T')[0]
                const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
                    .toISOString().split('T')[0]

                // 오늘 날짜
                const today = now.toISOString().split('T')[0]

                // 데이터 가져오기
                const [allTransactions, monthlyTotal, lastMonthTotal, dailyTotal, membersData, budgetAmount, incomeTotal, savTotal, invTotal] = await Promise.all([
                    getTransactions(),
                    getTotalSpending(startOfMonth, endOfMonth),
                    getTotalSpending(startOfLastMonth, endOfLastMonth),
                    getTotalSpending(today, today),
                    getMembers(),
                    getBudget(year, month),
                    getTotalByType('income', startOfMonth, endOfMonth),
                    getTotalByType('savings', startOfMonth, endOfMonth),
                    getTotalByType('investment', startOfMonth, endOfMonth),
                ])

                setTransactions(allTransactions.slice(0, 5))
                setTotalSpent(monthlyTotal)
                setTodaySpent(dailyTotal)
                setMembers(membersData)
                setBudget(budgetAmount)
                setIncome(incomeTotal)
                setSavingsTotal(savTotal)
                setInvestmentTotal(invTotal)

                // 전월 대비 계산
                if (lastMonthTotal > 0) {
                    const change = ((monthlyTotal - lastMonthTotal) / lastMonthTotal) * 100
                    setMonthlyChange(Math.round(change * 10) / 10) // 소수점 1자리
                } else {
                    setMonthlyChange(null) // 전월 데이터 없음
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    // 로딩 상태
    if (loading) {
        return (
            <div className="min-h-screen bg-[#F5F5F7] pb-24 flex items-center justify-center">
                <div className="text-gray-500">데이터를 불러오는 중...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F5F5F7] pb-24">
            {/* Header */}
            <div className="px-5 pt-14 pb-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">머니투게더</h1>
                    <UserAvatars members={members} />
                </div>

                {/* Total Spending Card */}
                <SpendingSummaryCard totalSpent={totalSpent} budget={budget} />
            </div>

            {/* Income Ratio Card */}
            <IncomeRatioCard
                income={income}
                expense={totalSpent}
                savings={savingsTotal}
                investment={investmentTotal}
            />

            {/* Quick Stats */}
            <QuickStatsGrid monthlyChange={monthlyChange} todaySpent={todaySpent} className="px-5 mb-8" />

            {/* Recent Transactions */}
            <TransactionList transactions={transactions} className="px-5" />

            {/* Floating Action Button */}
            <FloatingActionButton />
        </div>
    )
}
