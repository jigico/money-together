"use client"

import { Card } from "@/components/ui/card"
import { PiggyBank, LineChart, TrendingUp, TrendingDown } from "lucide-react"

interface MonthlySavingsCardProps {
    savings: number
    investment: number
    income: number
    prevSavings: number
    prevInvestment: number
    className?: string
}

// 전월 대비 변화 텍스트 (모은 돈은 증가가 긍정)
function DeltaBadge({ current, previous }: { current: number; previous: number }) {
    if (previous <= 0 || current === previous) return null
    const diff = current - previous
    const percent = Math.abs((diff / previous) * 100).toFixed(1)
    const isUp = diff > 0

    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${isUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {percent}%
        </span>
    )
}

// 하위 항목 전월 대비 (소형)
function MiniDelta({ current, previous }: { current: number; previous: number }) {
    if (previous <= 0 || current === previous) return null
    const diff = current - previous
    const isUp = diff > 0
    return (
        <p className={`text-[11px] font-medium mt-0.5 ${isUp ? 'text-green-600' : 'text-red-500'}`}>
            {isUp ? '+' : '-'}₩{Math.abs(diff).toLocaleString()} 전월 대비
        </p>
    )
}

export function MonthlySavingsCard({ savings, investment, income, prevSavings, prevInvestment, className }: MonthlySavingsCardProps) {
    const total = savings + investment
    const prevTotal = prevSavings + prevInvestment

    // 수입 대비 저축·투자 비율 (저축률)
    const savingsRate = income > 0 ? Math.round((total / income) * 100) : null

    // 저축 vs 투자 구성 비율
    const savingsPct = total > 0 ? (savings / total) * 100 : 0

    return (
        <Card className={`bg-white rounded-3xl p-6 shadow-sm border-0 ${className || ''}`}>
            <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-gray-500 font-medium">이번 달 모은 돈</p>
                {savingsRate !== null && savingsRate > 0 && (
                    <span className="text-xs font-semibold text-[#0047AB] bg-blue-50 px-2.5 py-1 rounded-full">
                        수입의 {savingsRate}%
                    </span>
                )}
            </div>

            <div className="flex items-center gap-3">
                <span className="text-4xl font-bold text-gray-900 tracking-tight">
                    ₩{total.toLocaleString()}
                </span>
                <DeltaBadge current={total} previous={prevTotal} />
            </div>
            {prevTotal > 0 && total !== prevTotal && (
                <p className="text-xs text-gray-500 mt-2">
                    지난달 대비 ₩{Math.abs(total - prevTotal).toLocaleString()} {total > prevTotal ? '더 모았어요' : '덜 모았어요'}
                </p>
            )}

            {/* 저축 vs 투자 구성 막대 */}
            {total > 0 && (
                <div className="h-2.5 rounded-full overflow-hidden flex mt-4 mb-4 bg-gray-100">
                    {savings > 0 && (
                        <div className="h-full bg-blue-500 transition-all duration-700 ease-out" style={{ width: `${savingsPct}%` }} />
                    )}
                    {investment > 0 && (
                        <div className="h-full bg-purple-500 transition-all duration-700 ease-out" style={{ width: `${100 - savingsPct}%` }} />
                    )}
                </div>
            )}

            {/* 저축 / 투자 세부 */}
            <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="bg-blue-50/70 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <PiggyBank className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-xs text-gray-500 font-medium">저축</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">₩{savings.toLocaleString()}</p>
                    <MiniDelta current={savings} previous={prevSavings} />
                </div>
                <div className="bg-purple-50/70 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                            <LineChart className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="text-xs text-gray-500 font-medium">투자</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">₩{investment.toLocaleString()}</p>
                    <MiniDelta current={investment} previous={prevInvestment} />
                </div>
            </div>
        </Card>
    )
}
