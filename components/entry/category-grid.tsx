"use client"

import { Utensils, Car, Coffee, ShoppingBasket, Home, Hospital, MoreHorizontal, LucideIcon } from "lucide-react"
import type { Category } from "@/types/database"

// 카테고리 이름별 아이콘 매핑
const iconMap: Record<string, LucideIcon> = {
    '식비': Utensils,
    '교통': Car,
    '카페': Coffee,
    '생활': ShoppingBasket,
    '주거': Home,
    '병원': Hospital,
    '기타': MoreHorizontal,
}

// 카테고리 이름별 색상 클래스 매핑
const colorMap: Record<string, string> = {
    '식비': 'bg-orange-100 text-orange-600',
    '교통': 'bg-blue-100 text-blue-600',
    '카페': 'bg-amber-100 text-amber-700',
    '생활': 'bg-purple-100 text-purple-600',
    '주거': 'bg-green-100 text-green-600',
    '병원': 'bg-pink-100 text-pink-600',
    '기타': 'bg-gray-100 text-gray-600',
}

interface CategoryGridProps {
    selectedCategory: string | null
    onCategorySelect: (categoryId: string) => void
    categories: Category[]
    className?: string
}

export function CategoryGrid({
    selectedCategory,
    onCategorySelect,
    categories,
    className
}: CategoryGridProps) {
    return (
        <div className={className}>
            <div className="grid grid-cols-3 gap-3">
                {categories.map((category) => {
                    const Icon = iconMap[category.name] || MoreHorizontal
                    const colorClass = colorMap[category.name] || 'bg-gray-100 text-gray-600'
                    const isSelected = selectedCategory === category.id

                    return (
                        <button
                            key={category.id}
                            type="button"
                            onClick={() => onCategorySelect(category.id)}
                            className={`flex flex-col items-center gap-2 p-4 rounded-3xl transition-all duration-200 active:scale-95 ${isSelected
                                ? "bg-[#0047AB] text-white shadow-lg shadow-blue-900/25"
                                : "bg-white shadow-sm hover:shadow-md"
                                }`}
                        >
                            <div
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isSelected ? "bg-white/20" : colorClass
                                    }`}
                            >
                                <Icon className={`w-6 h-6 ${isSelected ? "text-white" : ""}`} />
                            </div>
                            <span className={`text-sm font-medium ${isSelected ? "text-white" : "text-gray-900"}`}>
                                {category.name}
                            </span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
