import { UserAvatars } from "@/components/dashboard/user-avatars"
import { SpendingSummaryCard } from "@/components/dashboard/spending-summary-card"
import { QuickStatsGrid } from "@/components/dashboard/quick-stats-grid"
import { TransactionList, type Transaction } from "@/components/dashboard/transaction-list"
import { FloatingActionButton } from "@/components/dashboard/floating-action-button"
import { BottomNavigation } from "@/components/dashboard/bottom-navigation"

export default function MoneyTogetherDashboard() {
    const transactions: Transaction[] = [
        { id: 1, category: '식비', icon: '🍽️', amount: 45000, date: '오늘', color: 'bg-rose-100' },
        { id: 2, category: '교통', icon: '🚗', amount: 12000, date: '오늘', color: 'bg-blue-100' },
        { id: 3, category: '카페', icon: '☕', amount: 8500, date: '어제', color: 'bg-amber-100' },
        { id: 4, category: '쇼핑', icon: '🛍️', amount: 125000, date: '어제', color: 'bg-purple-100' },
        { id: 5, category: '편의점', icon: '🏪', amount: 15000, date: '3일 전', color: 'bg-green-100' },
    ]

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <div className="px-5 pt-14 pb-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-semibold text-foreground tracking-tight">머니투게더</h1>
                    <UserAvatars />
                </div>

                {/* Total Spending Card */}
                <SpendingSummaryCard totalSpent={1234500} budget={2000000} />
            </div>

            {/* Quick Stats */}
            <QuickStatsGrid monthlyChange={-12.5} todaySpent={57500} className="px-5 mb-8" />

            {/* Recent Transactions */}
            <TransactionList transactions={transactions} className="px-5" />

            {/* Floating Action Button */}
            <FloatingActionButton />

            {/* Bottom Navigation */}
            <BottomNavigation activeTab="home" />
        </div>
    )
}
