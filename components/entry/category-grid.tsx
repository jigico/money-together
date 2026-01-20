"use client"

import { Utensils, Car, Coffee, ShoppingBag, Home, MoreHorizontal } from "lucide-react"

export const categories = [
    { id: "food", name: "식비", icon: Utensils, color: "bg-orange-100 text-orange-600" },
    { id: "transport", name: "교통", icon: Car, color: "bg-blue-100 text-blue-600" },
    { id: "cafe", name: "카페", icon: Coffee, color: "bg-amber-100 text-amber-700" },
    { id: "shopping", name: "쇼핑", icon: ShoppingBag, color: "bg-pink-100 text-pink-600" },
    { id: "housing", name: "주거", icon: Home, color: "bg-green-100 text-green-600" },
    { id: "etc", name: "기타", icon: MoreHorizontal, color: "bg-gray-100 text-gray-600" },
]

interface CategoryGridProps {
    selectedCategory: string | null
    onCategorySelect: (categoryId: string) => void
    className?: string
}

export function CategoryGrid({ selectedCategory, onCategorySelect, className }: CategoryGridProps) {
    return (
        <div className={className}>
            <div className="grid grid-cols-3 gap-3">
                {categories.map((category) => {
                    const Icon = category.icon
                    const isSelected = selectedCategory === category.id
                    return (
                        <button
                            key={category.id}
                            type="button"
                            onClick={() => onCategorySelect(category.id)}
                            className={`flex flex-col items-center gap-2 p-4 rounded-3xl transition-all duration-200 active:scale-95 ${isSelected
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                    : "bg-white shadow-sm hover:shadow-md"
                                }`}
                        >
                            <div
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isSelected ? "bg-white/20" : category.color
                                    }`}
                            >
                                <Icon className={`w-6 h-6 ${isSelected ? "text-primary-foreground" : ""}`} />
                            </div>
                            <span className={`text-sm font-medium ${isSelected ? "text-primary-foreground" : "text-foreground"}`}>
                                {category.name}
                            </span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
