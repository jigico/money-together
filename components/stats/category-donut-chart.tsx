"use client"

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { Card } from "@/components/ui/card"

export interface CategoryData {
    name: string
    value: number
    color: string
}

interface CategoryDonutChartProps {
    data: CategoryData[]
    className?: string
}

export function CategoryDonutChart({ data, className }: CategoryDonutChartProps) {
    const total = data.reduce((sum, item) => sum + item.value, 0)

    return (
        <Card className={`bg-white rounded-3xl p-6 shadow-sm border-0 ${className || ''}`}>
            <h2 className="text-base font-semibold text-gray-900 mb-4">카테고리별 비율</h2>
            <div className="flex flex-col items-center">
                <div className="w-full h-[200px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={85}
                                paddingAngle={3}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload
                                        return (
                                            <div className="bg-gray-900/90 text-white px-3 py-2 rounded-xl text-sm shadow-lg">
                                                <p className="font-semibold">{data.name}</p>
                                                <p>₩{data.value.toLocaleString()}</p>
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                            <p className="text-xs text-gray-500">총 지출</p>
                            <p className="text-lg font-bold text-gray-900">₩{(total / 10000).toFixed(1)}만</p>
                        </div>
                    </div>
                </div>

                {/* Legend */}
                <div className="grid grid-cols-3 gap-x-6 gap-y-3 mt-4 w-full">
                    {data.map((item) => (
                        <div key={item.name} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-xs text-gray-500">{item.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    )
}
