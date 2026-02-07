"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, X, ChevronDown, MoreHorizontal, Calendar } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { NumberKeypad } from "@/components/entry/number-keypad"
import { MemberSelector } from "@/components/entry/member-selector"
import { getCategories, getMembers } from "@/lib/supabase/queries"
import { addTransaction } from "@/lib/supabase/mutations"
import type { Category, Member } from "@/types/database"
import { Utensils, Car, Coffee, ShoppingBasket, Home, Hospital, Heart, Gamepad2, Plane } from "lucide-react"

// 카테고리 이름별 아이콘 매핑
const iconMap: Record<string, any> = {
    '식비': Utensils,
    '교통': Car,
    '카페': Coffee,
    '생활': ShoppingBasket,
    '주거': Home,
    '병원': Hospital,
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
    '생활': 'bg-purple-100 text-purple-600',
    '주거': 'bg-green-100 text-green-600',
    '병원': 'bg-pink-100 text-pink-600',
    '건강': 'bg-red-100 text-red-600',
    '여가': 'bg-indigo-100 text-indigo-600',
    '여행': 'bg-cyan-100 text-cyan-600',
    '기타': 'bg-gray-100 text-gray-600',
}

export default function AddPage() {
    const router = useRouter()
    const [amount, setAmount] = useState("")
    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [description, setDescription] = useState("")
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
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

                // 첫 번째 멤버를 기본 선택
                if (membersData.length > 0) {
                    setSelectedMemberId(membersData[0].id)
                }
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

    const formatDate = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const day = date.getDate()
        return `${year}년 ${month}월 ${day}일`
    }

    const formatDateForDB = (date: Date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    const handleKeyPress = (key: string) => {
        if (key === "delete") {
            setAmount((prev) => prev.slice(0, -1))
        } else if (amount.length < 10) {
            setAmount((prev) => prev + key)
        }
    }

    const handleSave = async () => {
        if (!amount || !selectedCategory || !selectedMemberId) return

        setSaving(true)
        try {
            await addTransaction({
                amount: Number(amount),
                category_id: selectedCategory,
                member_id: selectedMemberId,
                description: description,
                date: formatDateForDB(selectedDate),
            })

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

    // 날짜 관련 함수들
    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate()
    }

    const isValid = amount.length > 0 && selectedCategory !== null && description.trim().length > 0 && !saving

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
                <div className="text-gray-500">데이터를 불러오는 중...</div>
            </div>
        )
    }

    const currentYear = selectedDate.getFullYear()
    const currentMonth = selectedDate.getMonth()
    const currentDay = selectedDate.getDate()
    const daysInMonth = getDaysInMonth(currentYear, currentMonth)

    return (
        <div className="min-h-screen bg-[#F5F5F7] flex flex-col max-w-md mx-auto">
            {/* Header - 패딩 조정 */}
            <header className="flex items-center justify-between px-4 pt-2 pb-2">
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
            <div className="px-6 py-4 flex-shrink-0">
                <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold tracking-tight text-gray-900 tabular-nums">
                        {formatAmount(amount)}
                    </span>
                    <span className="text-3xl font-semibold text-gray-500">원</span>
                    <span className="w-0.5 h-12 bg-[#0047AB] animate-pulse ml-1" />
                </div>
            </div>

            {/* Member Selection */}
            <div className="px-6 pb-4 flex-shrink-0">
                <MemberSelector
                    members={members}
                    selectedMemberId={selectedMemberId}
                    onSelect={setSelectedMemberId}
                />
            </div>

            {/* Category & Date & Description */}
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

                {/* Date Picker - Apple Style */}
                <button
                    type="button"
                    onClick={() => setIsDatePickerOpen(true)}
                    className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between active:scale-[0.98] transition-transform"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-900">{formatDate(selectedDate)}</span>
                    </div>
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                </button>

                {/* Description Input */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="설명을 입력하세요"
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

            {/* Date Picker Modal - Apple Style */}
            {isDatePickerOpen && (
                <div className="fixed inset-0 z-50">
                    <div
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                        onClick={() => setIsDatePickerOpen(false)}
                    />

                    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[2rem] p-6 pb-10 max-w-md mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-900">날짜 선택</h2>
                            <button
                                onClick={() => setIsDatePickerOpen(false)}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
                            >
                                <X className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>

                        {/* Apple Style Wheel Picker */}
                        <div className="flex gap-2 justify-center">
                            {/* Year */}
                            <div className="flex-1 bg-gray-50 rounded-2xl p-3">
                                <div className="text-xs text-gray-500 text-center mb-2">년</div>
                                <select
                                    value={currentYear}
                                    onChange={(e) => setSelectedDate(new Date(Number(e.target.value), currentMonth, currentDay))}
                                    className="w-full text-center text-lg font-semibold bg-transparent outline-none text-gray-900"
                                >
                                    {Array.from({ length: 10 }, (_, i) => currentYear - 5 + i).map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Month */}
                            <div className="flex-1 bg-gray-50 rounded-2xl p-3">
                                <div className="text-xs text-gray-500 text-center mb-2">월</div>
                                <select
                                    value={currentMonth + 1}
                                    onChange={(e) => setSelectedDate(new Date(currentYear, Number(e.target.value) - 1, Math.min(currentDay, getDaysInMonth(currentYear, Number(e.target.value) - 1))))}
                                    className="w-full text-center text-lg font-semibold bg-transparent outline-none text-gray-900"
                                >
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                        <option key={month} value={month}>{month}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Day */}
                            <div className="flex-1 bg-gray-50 rounded-2xl p-3">
                                <div className="text-xs text-gray-500 text-center mb-2">일</div>
                                <select
                                    value={currentDay}
                                    onChange={(e) => setSelectedDate(new Date(currentYear, currentMonth, Number(e.target.value)))}
                                    className="w-full text-center text-lg font-semibold bg-transparent outline-none text-gray-900"
                                >
                                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                                        <option key={day} value={day}>{day}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsDatePickerOpen(false)}
                            className="w-full mt-6 py-4 bg-[#0047AB] text-white rounded-2xl font-semibold active:scale-[0.98] transition-transform"
                        >
                            완료
                        </button>
                    </div>
                </div>
            )}

            {/* Category Modal */}
            {isCategoryOpen && (
                <div className="fixed inset-0 z-50">
                    <div
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                        onClick={() => setIsCategoryOpen(false)}
                    />

                    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[2rem] p-6 pb-10 max-w-md mx-auto">
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
