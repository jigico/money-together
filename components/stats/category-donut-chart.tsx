"use client"

import { useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PieChart, Pie, Cell } from "recharts"
import { Card } from "@/components/ui/card"
import { ChevronRight } from "lucide-react"

export interface CategoryData {
    name: string
    value: number
    color: string
}

interface CategoryDonutChartProps {
    data: CategoryData[]
    year: number
    month: number
    className?: string
}

// 카드에는 상위 N개만 노출하고 나머지는 '기타'로 합산 (도넛/리스트 동일 기준)
const TOP_N = 5
const OTHERS_LABEL = '기타'
const OTHERS_COLOR = '#9CA3AF'

type Row = CategoryData & { isAggregate?: boolean }

export function CategoryDonutChart({ data, year, month, className }: CategoryDonutChartProps) {
    const router = useRouter()

    const { rows, total } = useMemo(() => {
        const total = data.reduce((sum, item) => sum + item.value, 0)
        const sorted = [...data].sort((a, b) => b.value - a.value)

        if (sorted.length <= TOP_N) {
            return { rows: sorted as Row[], total }
        }

        const top: Row[] = sorted.slice(0, TOP_N).map((c) => ({ ...c }))
        const restSum = sorted.slice(TOP_N).reduce((sum, c) => sum + c.value, 0)

        // 실제 '기타' 카테고리가 상위에 이미 있으면 거기에 합산 (행 중복 방지)
        const existingOthers = top.find((c) => c.name === OTHERS_LABEL)
        if (existingOthers) {
            existingOthers.value += restSum
            existingOthers.isAggregate = true
        } else {
            top.push({ name: OTHERS_LABEL, value: restSum, color: OTHERS_COLOR, isAggregate: true })
        }

        return { rows: top, total }
    }, [data])

    const detailHref = `/stats/categories?year=${year}&month=${month}`

    // 합산된 '기타'는 실제 카테고리가 아니므로 상세 화면으로, 그 외엔 해당 카테고리 내역으로
    const hrefFor = (row: Row) =>
        row.isAggregate
            ? detailHref
            : `/history?category=${encodeURIComponent(row.name)}&type=expense&year=${year}&month=${month}`

    return (
        <Card className={`bg-white rounded-3xl p-6 shadow-sm border-0 ${className || ''}`}>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900">카테고리별 지출</h2>
                <Link
                    href={detailHref}
                    className="flex items-center gap-0.5 text-xs font-medium text-gray-400 hover:text-[#0047AB] transition-colors"
                >
                    전체 보기
                    <ChevronRight className="w-3.5 h-3.5" />
                </Link>
            </div>

            <div className="flex flex-col items-center">
                <div className="w-full h-[200px] relative flex items-center justify-center">
                    <PieChart width={300} height={200}>
                        <Pie
                            data={rows}
                            cx={150}
                            cy={100}
                            innerRadius={60}
                            outerRadius={85}
                            paddingAngle={3}
                            dataKey="value"
                            stroke="none"
                            onClick={(_, index) => router.push(hrefFor(rows[index]))}
                            className="cursor-pointer focus:outline-none"
                        >
                            {rows.map((entry, index) => (
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
                        </div>
                    </div>
                </div>

                {/* 금액 리스트 (내림차순) */}
                <div className="w-full mt-2">
                    {rows.map((item) => {
                        const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0'
                        return (
                            <Link
                                key={item.name}
                                href={hrefFor(item)}
                                className="flex items-center gap-2.5 py-2.5 border-t border-gray-100 active:bg-gray-50 transition-colors"
                            >
                                <span
                                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className="text-sm text-gray-700 flex-1 truncate">{item.name}</span>
                                <span className="text-sm font-semibold text-gray-900 tabular-nums">
                                    ₩{item.value.toLocaleString()}
                                </span>
                                <span className="text-xs text-gray-400 tabular-nums w-11 text-right">
                                    {percentage}%
                                </span>
                                <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                            </Link>
                        )
                    })}
                </div>
            </div>
        </Card>
    )
}
