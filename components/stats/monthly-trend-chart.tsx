"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Card } from "@/components/ui/card"

export interface MonthlyData {
    month: string
    amount: number
}

interface MonthlyTrendChartProps {
    data: MonthlyData[]
    className?: string
}

export function MonthlyTrendChart({ data, className }: MonthlyTrendChartProps) {
    return (
        <Card className={`bg-white rounded-3xl p-6 shadow-sm border-0 ${className || ''}`}>
            <h2 className="text-base font-semibold text-gray-900 mb-4">월별 지출 추이</h2>
            <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} barCategoryGap="25%">
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
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-gray-900/90 text-white px-3 py-2 rounded-xl text-sm shadow-lg">
                                            <p className="font-semibold">₩{payload[0].value?.toLocaleString()}</p>
                                        </div>
                                    )
                                }
                                return null
                            }}
                        />
                        <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={index === data.length - 1 ? "#0047AB" : "#e5e7eb"}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    )
}
