"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, X, ChevronDown, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { NumberKeypad } from "@/components/entry/number-keypad"
import { SpenderToggle } from "@/components/entry/spender-toggle"
import { getCategories, getMembers } from "@/lib/supabase/queries"
import { addTransaction } from "@/lib/supabase/mutations"
import type { Category, Member } from "@/types/database"
import { Utensils, Car, Coffee, ShoppingBag, Home, Heart, Gamepad2, Plane } from "lucide-react"

// 카테고리 이름별 아이콘 매핑
const iconMap: Record<string, any> = {
    '식비': Utensils,
    '교통': Car,
    '카페': Coffee,
    '쇼핑': ShoppingBag,
    '주거': Home,
    '건강': Heart,
    '여가': Gamepad2,
    '여행': Plane,
    '기타': MoreHorizontal,
}

// 카테고리 이름별 색상 클래스 매핑
const colorMap: Record<string, string> = {
    '식비': 'bg-orange-100 text-orange-600',
    '교통': 'bg-blue-100 text-blue-600',
    '카페': 'bg-amber-100 text-amber-700',
    '쇼핑': 'bg-pink-100 text-pink-600',
    '주거': 'bg-green-100 text-green-600',
    '건강': 'bg-red-100 text-red-600',
    '여가': 'bg-purple-100 text-purple-600',
    '여행': 'bg-cyan-100 text-cyan-600',
    '기타': 'bg-gray-100 text-gray-600',
}

export default function AddPage() {
    const router = useRouter()
    const [amount, setAmount] = useState("")
    const [spender, setSpender] = useState<"husband" | "wife">("husband")
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [description, setDescription] = useState("")
    const [isCategoryOpen, setIsCategoryOpen] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])
    const [members, setMembers] = useState<Member[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        async function fetchData() {
            try {
                const [categoriesData, membersData] = await Promise.all([
                    getCategories(),
                    getMembers(),
                ])
                setCategories(categoriesData)
                setMembers(membersData)
            } catch (error) {
                console.error('Error fetching data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    const selectedCategoryData = categories.find((c) => c.id === selectedCategory)

    const formatAmount = (value: string) => {
        if (!value) return "0"
        return Number(value).toLocaleString("ko-KR")
    }

    const handleKeyPress = (key: string) => {
        if (key === "delete") {
            setAmount((prev) => prev.slice(0, -1))
        } else if (amount.length < 10) {
            setAmount((prev) => prev + key)
        }
    }

    const handleSave = async () => {
        if (!amount || !selectedCategory) return

        setSaving(true)
        try {
            // 선택된 멤버 찾기
            const selectedMember = members.find((m) =>
                spender === "husband" ? m.name === "남편" : m.name === "아내"
            )

            if (!selectedMember) {
                throw new Error('멤버를 찾을 수 없습니다')
            }

            // 거래 추가
            await addTransaction({
                amount: Number(amount),
                category_id: selectedCategory,
                member_id: selectedMember.id,
                description: description,
                date: new Date().toISOString().split('T')[0],
            })

            // 성공 시 홈으로 리다이렉트
            router.push('/')
        } catch (error) {
            console.error('Error saving transaction:', error)
            alert('거래 저장에 실패했습니다. 다시 시도해주세요.')
        } finally {
            setSaving(false)
        }
    }

    const handleSelectCategory = (categoryId: string) => {
        setSelectedCategory(categoryId)
        setIsCategoryOpen(false)
    }

    const isValid = amount.length > 0 && selectedCategory !== null && !saving

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
                <div className="text-gray-500">데이터를 불러오는 중...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F5F5F7] flex flex-col max-w-md mx-auto">
            {/* Header */}
            <header className="flex items-center justify-between px-4 pt-14 pb-4">
                <Link
                    href="/"
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm active:scale-95 transition-transform"
                >
                    <ChevronLeft className="w-5 h-5 text-gray-900" />
                </Link>
                <h1 className="text-lg font-semibold text-gray-900">내역 입력</h1>
                <button
                    type="button"
                    onClick={() => {
                        setAmount("")
                        setDescription("")
                    }}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm active:scale-95 transition-transform"
                >
                    <X className="w-5 h-5 text-gray-500" />
                </button>
            </header>

            {/* Amount Display */}
            <div className="px-6 py-8 flex-shrink-0">
                <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold tracking-tight text-gray-900 tabular-nums">
                        {formatAmount(amount)}
                    </span>
                    <span className="text-3xl font-semibold text-gray-500">원</span>
                    <span className="w-0.5 h-12 bg-[#0047AB] animate-pulse ml-1" />
                </div>
            </div>

            {/* Spender Toggle */}
            <SpenderToggle
                spender={spender}
                onSpenderChange={setSpender}
                className="px-6 pb-6 flex-shrink-0"
            />

            {/* Category & Description */}
            <div className="px-6 pb-4 flex-shrink-0 space-y-3">
                {/* Category Button */}
                <button
                    type="button"
                    onClick={() => setIsCategoryOpen(true)}
                    className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between active:scale-[0.98] transition-transform"
                >
                    <div className="flex items-center gap-3">
                        {selectedCategoryData ? (
                            <>
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[selectedCategoryData.name] || 'bg-gray-100 text-gray-600'}`}>
                                    {(() => {
                                        const Icon = iconMap[selectedCategoryData.name] || MoreHorizontal
                                        return <Icon className="w-5 h-5" />
                                    })()}
                                </div>
                                <span className="font-medium text-gray-900">{selectedCategoryData.name}</span>
                            </>
                        ) : (
                            <>
                                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                                    <MoreHorizontal className="w-5 h-5 text-gray-500" />
                                </div>
                                <span className="font-medium text-gray-500">카테고리 선택</span>
                            </>
                        )}
                    </div>
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                </button>

                {/* Description Input */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="설명을 입력하세요 (선택)"
                        className="w-full bg-transparent text-gray-900 placeholder:text-gray-400 outline-none text-sm"
                    />
                </div>
            </div>

            {/* Number Keypad */}
            <NumberKeypad
                onKeyPress={handleKeyPress}
                onSave={handleSave}
                isValid={isValid}
                className="mt-auto"
            />

            {/* Category Modal */}
            {isCategoryOpen && (
                <div className="fixed inset-0 z-50">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setIsCategoryOpen(false)}
                    />

                    {/* Bottom Sheet */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[2rem] p-6 pb-10 animate-in slide-in-from-bottom duration-300 max-w-md mx-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-900">카테고리 선택</h2>
                            <button
                                type="button"
                                onClick={() => setIsCategoryOpen(false)}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
                            >
                                <X className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>

                        {/* Category Grid - 4 columns */}
                        <div className="grid grid-cols-4 gap-3">
                            {categories.map((category) => {
                                const Icon = iconMap[category.name] || MoreHorizontal
                                const colorClass = colorMap[category.name] || 'bg-gray-100 text-gray-600'
                                const isSelected = selectedCategory === category.id

                                return (
                                    <button
                                        key={category.id}
                                        type="button"
                                        onClick={() => handleSelectCategory(category.id)}
                                        className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-200 active:scale-95 ${isSelected
                                                ? "bg-[#0047AB] shadow-lg shadow-blue-900/25"
                                                : "bg-gray-50 hover:bg-gray-100"
                                            }`}
                                    >
                                        <div
                                            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${isSelected ? "bg-white/20" : colorClass
                                                }`}
                                        >
                                            <Icon className={`w-5 h-5 ${isSelected ? "text-white" : ""}`} />
                                        </div>
                                        <span className={`text-xs font-medium ${isSelected ? "text-white" : "text-gray-900"}`}>
                                            {category.name}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Saving Overlay */}
            {saving && (
                <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                        <div className="text-gray-900">저장 중...</div>
                    </div>
                </div>
            )}
        </div>
    )
}
