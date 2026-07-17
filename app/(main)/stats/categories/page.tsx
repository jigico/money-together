"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { PieChart, Pie, Cell } from "recharts"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, TrendingDown, TrendingUp } from "lucide-react"
import { getCategoryDetail, type CategoryDetailItem } from "@/lib/supabase/queries"

// 지출은 늘어나면 빨강(부정), 줄어들면 초록(긍정)
function ChangeBadge({ amount, prevAmount }: { amount: number; prevAmount: number }) {
    if (prevAmount === 0) {
        return (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-600">
                신규
            </span>
        )
    }

    const diff = amount - prevAmount
    if (diff === 0) {
        return <span className="text-[10px] font-medium text-gray-300">변동 없음</span>
    }

    const percent = Math.abs((diff / prevAmount) * 100)
    const isUp = diff > 0

    return (
        <span
            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${isUp ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'
                }`}
        >
            {isUp ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
            {percent < 1000 ? percent.toFixed(0) : '999+'}%
        </span>
    )
}

function CategoryDetailContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const now = new Date()

    const year = Number(searchParams.get('year')) || now.getFullYear()
    const month = Number(searchParams.get('month')) || now.getMonth() + 1

    const [items, setItems] = useState<CategoryDetailItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            try {
                setItems(await getCategoryDetail(year, month))
            } catch (error) {
                console.error('Error fetching category detail:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [year, month])

    const total = useMemo(() => items.reduce((sum, i) => sum + i.amount, 0), [items])
    const prevTotal = useMemo(() => items.reduce((sum, i) => sum + i.prevAmount, 0), [items])

    return (
        <div className="min-h-screen bg-[#F5F5F7] pb-32">
            {/* Header */}
            <div className="px-5 pt-14 pb-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        aria-label="뒤로 가기"
                        className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm active:scale-95 transition-transform"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-900" />
                    </button>
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">카테고리별 지출</h1>
                        <p className="text-xs text-gray-500 mt-0.5">{year}년 {month}월</p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="px-5 space-y-4">
                    <div className="bg-white rounded-3xl p-6 shadow-sm">
                        <div className="h-[180px] bg-gray-100 rounded-2xl animate-pulse" />
                    </div>
                    <div className="bg-white rounded-3xl p-6 shadow-sm space-y-3">
                        {[0, 1, 2, 3].map((i) => (
                            <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />
                        ))}
                    </div>
                </div>
            ) : items.length === 0 ? (
                <div className="px-5">
                    <Card className="bg-white rounded-3xl p-8 shadow-sm border-0 text-center">
                        <p className="text-gray-500 text-sm">이 달에는 지출 내역이 없어요</p>
                    </Card>
                </div>
            ) : (
                <>
                    {/* 총 지출 + 도넛 */}
                    <div className="px-5 mb-4">
                        <Card className="bg-white rounded-3xl p-6 shadow-sm border-0">
                            <div className="h-[200px] relative flex items-center justify-center">
                                <PieChart width={300} height={200}>
                                    <Pie
                                        data={items}
                                        cx={150}
                                        cy={100}
                                        innerRadius={60}
                                        outerRadius={85}
                                        paddingAngle={items.length > 1 ? 3 : 0}
                                        dataKey="amount"
                                        stroke="none"
                                    >
                                        {items.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500">총 지출</p>
                                        <p className="text-base font-bold text-gray-900 tabular-nums">
                                            ₩{total.toLocaleString()}
                                        </p>
                                        {prevTotal > 0 && (
                                            <div className="mt-1 flex justify-center">
                                                <ChangeBadge amount={total} prevAmount={prevTotal} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* 전체 카테고리 리스트 */}
                    <div className="px-5">
                        <Card className="bg-white rounded-3xl p-5 shadow-sm border-0">
                            <div className="flex items-baseline justify-between mb-1">
                                <h2 className="text-base font-semibold text-gray-900">전체 카테고리</h2>
                                <span className="text-xs text-gray-400">{items.length}개 · 전월 대비</span>
                            </div>
                            {items.map((item) => {
                                const percentage = total > 0 ? ((item.amount / total) * 100).toFixed(1) : '0.0'
                                return (
                                    <Link
                                        key={item.name}
                                        href={`/history?category=${encodeURIComponent(item.name)}&type=expense&year=${year}&month=${month}`}
                                        className="flex items-center gap-2.5 py-3 border-t border-gray-100 active:bg-gray-50 transition-colors"
                                    >
                                        <span
                                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: item.color }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-sm text-gray-800 truncate">{item.name}</span>
                                                <ChangeBadge amount={item.amount} prevAmount={item.prevAmount} />
                                            </div>
                                            {/* 비율 막대 */}
                                            <div className="h-1 rounded-full bg-gray-100 mt-1.5 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{ width: `${percentage}%`, backgroundColor: item.color }}
                                                />
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-sm font-semibold text-gray-900 tabular-nums">
                                                ₩{item.amount.toLocaleString()}
                                            </p>
                                            <p className="text-[11px] text-gray-400 tabular-nums">{percentage}%</p>
                                        </div>
                                        <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                                    </Link>
                                )
                            })}
                        </Card>
                    </div>
                </>
            )}
        </div>
    )
}

export default function CategoryDetailPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
                    <p className="text-gray-500">불러오는 중...</p>
                </div>
            }
        >
            <CategoryDetailContent />
        </Suspense>
    )
}
