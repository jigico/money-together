"use client"

import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts"
import { Card } from "@/components/ui/card"

export interface MonthlyData {
    month: string
    expense: number
    savings: number
    investment: number
}

interface MonthlyTrendChartProps {
    data: MonthlyData[]
    className?: string
}

type TrendMode = 'expense' | 'saved'

export function MonthlyTrendChart({ data, className }: MonthlyTrendChartProps) {
    const [mode, setMode] = useState<TrendMode>('expense')

    const hasSavedData = data.some((d) => d.savings > 0 || d.investment > 0)

    return (
        <Card className={`bg-white rounded-3xl p-6 shadow-sm border-0 ${className || ''}`}>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900">월별 추이</h2>

                {/* 지출 / 모은 돈 토글 */}
                <div className="flex bg-gray-100 rounded-full p-1">
                    <button
                        onClick={() => setMode('expense')}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${mode === 'expense' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
                    >
                        지출
                    </button>
                    <button
                        onClick={() => setMode('saved')}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${mode === 'saved' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
                    >
                        모은 돈
                    </button>
                </div>
            </div>

            {mode === 'saved' && !hasSavedData ? (
                <div className="h-[180px] flex flex-col items-center justify-center gap-1">
                    <p className="text-sm text-gray-400">저축·투자 내역이 아직 없어요</p>
                    <p className="text-xs text-gray-300">내역 추가에서 저축이나 투자를 기록해보세요</p>
                </div>
            ) : (
                <div className="h-[180px] flex items-center justify-center">
                    <BarChart width={350} height={180} data={data} barCategoryGap="25%">
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: "#6b7280" }}
                        />
                        <YAxis hide />
                        <Tooltip
                            cursor={{ fill: "transparent" }}
                            content={({ active, payload }) => {
                                if (!active || !payload || !payload.length) return null
                                const row = payload[0].payload as MonthlyData
                                if (mode === 'expense') {
                                    return (
                                        <div className="bg-gray-900/90 text-white px-3 py-2 rounded-xl text-sm shadow-lg">
                                            <p className="font-semibold">₩{row.expense.toLocaleString()}</p>
                                        </div>
                                    )
                                }
                                return (
                                    <div className="bg-gray-900/90 text-white px-3 py-2 rounded-xl text-xs shadow-lg space-y-0.5">
                                        <p className="text-sm font-semibold mb-1">₩{(row.savings + row.investment).toLocaleString()}</p>
                                        <p className="flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                                            저축 ₩{row.savings.toLocaleString()}
                                        </p>
                                        <p className="flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" />
                                            투자 ₩{row.investment.toLocaleString()}
                                        </p>
                                    </div>
                                )
                            }}
                        />
                        {mode === 'expense' ? (
                            <Bar dataKey="expense" radius={[8, 8, 0, 0]}>
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={index === data.length - 1 ? "#0047AB" : "#e5e7eb"}
                                    />
                                ))}
                            </Bar>
                        ) : (
                            <>
                                <Bar dataKey="savings" stackId="saved" fill="#3B82F6" />
                                <Bar dataKey="investment" stackId="saved" fill="#A855F7" radius={[8, 8, 0, 0]} />
                            </>
                        )}
                    </BarChart>
                </div>
            )}

            {/* 모은 돈 모드 범례 */}
            {mode === 'saved' && hasSavedData && (
                <div className="flex items-center justify-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        <span className="text-[11px] text-gray-400">저축</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                        <span className="text-[11px] text-gray-400">투자</span>
                    </div>
                </div>
            )}
        </Card>
    )
}
