"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, TrendingDown } from "lucide-react"
import { CategoryDonutChart, type CategoryData } from "@/components/stats/category-donut-chart"
import { MemberComparisonBar, type MemberSpending } from "@/components/stats/member-comparison-bar"
import { MonthlyTrendChart, type MonthlyData } from "@/components/stats/monthly-trend-chart"
import { TopCategoriesList, type TopCategory } from "@/components/stats/top-categories-list"

const categoryData: CategoryData[] = [
    { name: "식비", value: 450000, color: "#f87171" },
    { name: "교통", value: 180000, color: "#60a5fa" },
    { name: "쇼핑", value: 320000, color: "#a78bfa" },
    { name: "카페", value: 95000, color: "#fbbf24" },
    { name: "주거", value: 150000, color: "#34d399" },
    { name: "기타", value: 39500, color: "#9ca3af" },
]

const monthlyData: MonthlyData[] = [
    { month: "9월", amount: 1450000 },
    { month: "10월", amount: 1280000 },
    { month: "11월", amount: 1520000 },
    { month: "12월", amount: 1390000 },
    { month: "1월", amount: 1234500 },
]

const topCategories: TopCategory[] = [
    { rank: 1, name: "식비", amount: 450000, icon: "🍽️", color: "bg-rose-100" },
    { rank: 2, name: "쇼핑", amount: 320000, icon: "🛍️", color: "bg-purple-100" },
    { rank: 3, name: "교통", amount: 180000, icon: "🚗", color: "bg-blue-100" },
]

const memberSpending: MemberSpending[] = [
    {
        id: "husband",
        name: "남편",
        avatar: "남",
        amount: 720000,
        color: "#0047AB",
        bgColor: "#0047AB",
    },
    {
        id: "wife",
        name: "아내",
        avatar: "여",
        amount: 514500,
        color: "#fb7185",
        bgColor: "#fb7185",
    },
]

export default function StatsPage() {
    const [currentMonth, setCurrentMonth] = useState({ year: 2026, month: 1 })

    const totalSpending = categoryData.reduce((sum, item) => sum + item.value, 0)

    const prevMonth = () => {
        setCurrentMonth((prev) => {
            if (prev.month === 1) return { year: prev.year - 1, month: 12 }
            return { ...prev, month: prev.month - 1 }
        })
    }

    const nextMonth = () => {
        setCurrentMonth((prev) => {
            if (prev.month === 12) return { year: prev.year + 1, month: 1 }
            return { ...prev, month: prev.month + 1 }
        })
    }

    return (
        <div className="min-h-screen bg-[#F5F5F7] pb-28">
            {/* Header with Month Selector */}
            <div className="px-5 pt-14 pb-6">
                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={prevMonth}
                        className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm active:scale-95 transition-transform"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-900" />
                    </button>
                    <h1 className="text-xl font-semibold text-gray-900 tracking-tight min-w-[140px] text-center">
                        {currentMonth.year}년 {currentMonth.month}월
                    </h1>
                    <button
                        onClick={nextMonth}
                        className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm active:scale-95 transition-transform"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-900" />
                    </button>
                </div>
            </div>

            {/* Total Spending Summary */}
            <div className="px-5 mb-6">
                <Card className="bg-white rounded-3xl p-6 shadow-sm border-0">
                    <p className="text-sm text-gray-500 mb-1 font-medium">이번 달 총 지출</p>
                    <div className="flex items-center gap-3">
                        <span className="text-4xl font-bold text-gray-900 tracking-tight">
                            ₩{totalSpending.toLocaleString()}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                            <TrendingDown className="w-3 h-3" />
                            11.2%
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">지난달 대비 ₩156,500 감소</p>
                </Card>
            </div>

            {/* Category Donut Chart */}
            <div className="px-5 mb-6">
                <CategoryDonutChart data={categoryData} />
            </div>

            {/* Member Comparison */}
            <div className="px-5 mb-6">
                <MemberComparisonBar members={memberSpending} />
            </div>

            {/* Monthly Trend Bar Chart */}
            <div className="px-5 mb-6">
                <MonthlyTrendChart data={monthlyData} />
            </div>

            {/* Top 3 Categories */}
            <div className="px-5 mb-6">
                <TopCategoriesList categories={topCategories} />
            </div>
        </div>
    )
}
