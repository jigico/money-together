"use client"

import { Card } from "@/components/ui/card"

export interface TopCategory {
    rank: number
    name: string
    amount: number
    icon: string
    color: string
}

interface TopCategoriesListProps {
    categories: TopCategory[]
    className?: string
}

export function TopCategoriesList({ categories, className }: TopCategoriesListProps) {
    return (
        <Card className={`bg-white rounded-3xl p-5 shadow-sm border-0 ${className || ''}`}>
            <h2 className="text-base font-semibold text-gray-900 mb-4">지출 Top 3</h2>
            <div className="space-y-3">
                {categories.map((category) => (
                    <div
                        key={category.rank}
                        className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-2xl"
                    >
                        <div className="flex items-center gap-4">
                            <span className="w-6 h-6 rounded-full bg-[#0047AB] text-white flex items-center justify-center text-xs font-bold">
                                {category.rank}
                            </span>
                            <div className={`w-10 h-10 rounded-xl ${category.color} flex items-center justify-center text-lg`}>
                                {category.icon}
                            </div>
                            <span className="font-medium text-gray-900">{category.name}</span>
                        </div>
                        <span className="font-bold text-gray-900">₩{category.amount.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        </Card>
    )
}
