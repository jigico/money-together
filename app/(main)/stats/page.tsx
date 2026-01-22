"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, TrendingDown } from "lucide-react"
import { CategoryDonutChart, type CategoryData } from "@/components/stats/category-donut-chart"
import { MemberComparisonBar, type MemberSpending } from "@/components/stats/member-comparison-bar"
import { MonthlyTrendChart, type MonthlyData } from "@/components/stats/monthly-trend-chart"
import { TopCategoriesList, type TopCategory } from "@/components/stats/top-categories-list"
import { getCategorySpending, getMemberSpending, getMonthlySpending, getTopCategories, getTotalSpending } from "@/lib/supabase/queries"

export default function StatsPage() {
    const [currentMonth, setCurrentMonth] = useState({ year: 2026, month: 1 })
    const [categoryData, setCategoryData] = useState<CategoryData[]>([])
    const [memberSpending, setMemberSpending] = useState<MemberSpending[]>([])
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
    const [topCategories, setTopCategories] = useState<TopCategory[]>([])
    const [totalSpending, setTotalSpending] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            try {
                // 현재 월의 시작일과 종료일
                const startOfMonth = new Date(currentMonth.year, currentMonth.month - 1, 1)
                    .toISOString().split('T')[0]
                const endOfMonth = new Date(currentMonth.year, currentMonth.month, 0)
                    .toISOString().split('T')[0]

                // 데이터 가져오기
                const [categories, members, monthly, top, total] = await Promise.all([
                    getCategorySpending(startOfMonth, endOfMonth),
                    getMemberSpending(startOfMonth, endOfMonth),
                    getMonthlySpending(5),
                    getTopCategories(3, startOfMonth, endOfMonth),
                    getTotalSpending(startOfMonth, endOfMonth),
                ])

                setCategoryData(categories)
                setMemberSpending(members)
                setMonthlyData(monthly)
                setTopCategories(top)
                setTotalSpending(total)
            } catch (error) {
                console.error('Error fetching stats data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [currentMonth])

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

    // 로딩 상태
    if (loading) {
        return (
            <div className="min-h-screen bg-[#F5F5F7] pb-28 flex items-center justify-center">
                <div className="text-gray-500">통계 데이터를 불러오는 중...</div>
            </div>
        )
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
            {categoryData.length > 0 ? (
                <div className="px-5 mb-6">
                    <CategoryDonutChart data={categoryData} />
                </div>
            ) : (
                <div className="px-5 mb-6">
                    <Card className="bg-white rounded-3xl p-6 shadow-sm border-0">
                        <p className="text-center text-gray-500">카테고리별 지출 데이터가 없습니다</p>
                    </Card>
                </div>
            )}

            {/* Member Comparison */}
            {memberSpending.length > 0 && (
                <div className="px-5 mb-6">
                    <MemberComparisonBar members={memberSpending} />
                </div>
            )}

            {/* Monthly Trend Bar Chart */}
            {monthlyData.length > 0 && (
                <div className="px-5 mb-6">
                    <MonthlyTrendChart data={monthlyData} />
                </div>
            )}

            {/* Top 3 Categories */}
            {topCategories.length > 0 && (
                <div className="px-5 mb-6">
                    <TopCategoriesList categories={topCategories} />
                </div>
            )}
        </div>
    )
}
