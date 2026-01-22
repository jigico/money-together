"use client"

import { useEffect, useState } from "react"
import { UserAvatars } from "@/components/dashboard/user-avatars"
import { SpendingSummaryCard } from "@/components/dashboard/spending-summary-card"
import { QuickStatsGrid } from "@/components/dashboard/quick-stats-grid"
import { TransactionList, type Transaction } from "@/components/dashboard/transaction-list"
import { FloatingActionButton } from "@/components/dashboard/floating-action-button"
import { getTransactions, getTotalSpending } from "@/lib/supabase/queries"

export default function MoneyTogetherDashboard() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [totalSpent, setTotalSpent] = useState(0)
    const [todaySpent, setTodaySpent] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            try {
                // 현재 월의 시작일과 종료일
                const now = new Date()
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
                    .toISOString().split('T')[0]
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
                    .toISOString().split('T')[0]

                // 오늘 날짜
                const today = now.toISOString().split('T')[0]

                // 데이터 가져오기
                const [allTransactions, monthlyTotal, dailyTotal] = await Promise.all([
                    getTransactions(), // 최근 거래 (제한 없음, 최신순)
                    getTotalSpending(startOfMonth, endOfMonth), // 이번 달 총 지출
                    getTotalSpending(today, today), // 오늘 지출
                ])

                setTransactions(allTransactions.slice(0, 5)) // 최근 5개만 표시
                setTotalSpent(monthlyTotal)
                setTodaySpent(dailyTotal)
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
                    <UserAvatars />
                </div>

                {/* Total Spending Card */}
                <SpendingSummaryCard totalSpent={totalSpent} budget={2000000} />
            </div>

            {/* Quick Stats */}
            <QuickStatsGrid monthlyChange={-12.5} todaySpent={todaySpent} className="px-5 mb-8" />

            {/* Recent Transactions */}
            <TransactionList transactions={transactions} className="px-5" />

            {/* Floating Action Button */}
            <FloatingActionButton />
        </div>
    )
}
