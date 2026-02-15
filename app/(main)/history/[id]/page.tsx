"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, X, ChevronDown, Calendar } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { NumberKeypad } from "@/components/entry/number-keypad"
import { MemberSelector } from "@/components/entry/member-selector"
import { CalendarDatePicker } from "@/components/entry/calendar-date-picker"
import { getCategories, getMembers, getSingleTransaction } from "@/lib/supabase/queries"
import { updateTransaction, deleteTransaction } from "@/lib/supabase/mutations"
import type { Category, Member } from "@/types/database"
import { Utensils, Car, Coffee, ShoppingBasket, Home, Hospital, Heart, Gamepad2, Plane, MoreHorizontal, Shirt, Theater, Hotel, Gift, GraduationCap, Baby } from "lucide-react"

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
    '의복/미용': Shirt,
    '자동차': Car,
    '문화/여가': Theater,
    '여행/숙박': Hotel,
    '경조사': Gift,
    '교육': GraduationCap,
    '육아': Baby,
    '선물': Gift,
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
    '의복/미용': 'bg-pink-100 text-pink-600',
    '자동차': 'bg-blue-100 text-blue-600',
    '문화/여가': 'bg-purple-100 text-purple-600',
    '여행/숙박': 'bg-cyan-100 text-cyan-600',
    '경조사': 'bg-amber-100 text-amber-600',
    '교육': 'bg-green-100 text-green-600',
    '육아': 'bg-yellow-100 text-yellow-600',
    '선물': 'bg-pink-100 text-pink-600',
    '기타': 'bg-gray-100 text-gray-600',
}

export default function TransactionDetailPage() {
    const router = useRouter()
    const params = useParams()
    const transactionId = params.id as string

    const [amount, setAmount] = useState("")
    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [description, setDescription] = useState("")
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
    const [isCategoryOpen, setIsCategoryOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])
    const [members, setMembers] = useState<Member[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        async function fetchData() {
            try {
                const [categoriesData, membersData, transactionData] = await Promise.all([
                    getCategories(),
                    getMembers(),
                    getSingleTransaction(transactionId),
                ])

                setCategories(categoriesData)
                setMembers(membersData)

                if (transactionData) {
                    // 기존 데이터로 폼 미리 채우기
                    setAmount(String(transactionData.amount))
                    setSelectedCategory(transactionData.category_id)
                    setDescription(transactionData.description)
                    setSelectedDate(new Date(transactionData.date))

                    // 멤버 정보로 selectedMemberId 설정
                    if (membersData && membersData.length > 0) {
                        const member = membersData.find((m: Member) => m.id === transactionData.member_id)
                        if (member) {
                            setSelectedMemberId(member.id)
                        }
                    }
                } else {
                    // 거래를 찾을 수 없는 경우
                    alert('거래 내역을 찾을 수 없습니다.')
                    router.push('/history')
                }
            } catch (error) {
                console.error('Error fetching data:', error)
                alert('데이터를 불러오는 중 오류가 발생했습니다.')
                router.push('/history')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [transactionId, router])

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
        if (!amount || !selectedCategory) return

        setSaving(true)
        try {
            if (!selectedMemberId) {
                throw new Error('멤버를 선택해주세요')
            }

            await updateTransaction(transactionId, {
                amount: Number(amount),
                category_id: selectedCategory,
                member_id: selectedMemberId,
                description: description,
                date: formatDateForDB(selectedDate),
            })

            router.push('/history')
        } catch (error) {
            console.error('Error updating transaction:', error)
            alert('거래 수정에 실패했습니다. 다시 시도해주세요.')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        setDeleting(true)
        try {
            await deleteTransaction(transactionId)
            router.push('/history')
        } catch (error) {
            console.error('Error deleting transaction:', error)
            alert('거래 삭제에 실패했습니다. 다시 시도해주세요.')
            setDeleting(false)
        }
    }

    const handleSelectCategory = (categoryId: string) => {
        setSelectedCategory(categoryId)
        setIsCategoryOpen(false)
    }

    const isValid = amount.length > 0 && selectedCategory !== null && description.trim().length > 0 && !saving

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
                <div className="text-gray-500">데이터를 불러오는 중...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F5F5F7] flex flex-col max-w-md mx-auto">
            {/* Header - 패딩 조정 */}
            <header className="flex items-center justify-between px-4 pt-2 pb-2">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm active:scale-95 transition-transform"
                >
                    <ChevronLeft className="w-5 h-5 text-gray-900" />
                </button>
                <h1 className="text-lg font-semibold text-gray-900">내역 수정</h1>
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
                showDelete={true}
                onDelete={() => setIsDeleteDialogOpen(true)}
            />

            {/* Date Picker Modal - Calendar Style */}
            {isDatePickerOpen && (
                <CalendarDatePicker
                    selectedDate={selectedDate}
                    onDateSelect={(date) => {
                        setSelectedDate(date)
                        setIsDatePickerOpen(false)
                    }}
                    onClose={() => setIsDatePickerOpen(false)}
                />
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

            {/* Delete Confirmation Dialog - Apple Style */}
            {isDeleteDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                        onClick={() => setIsDeleteDialogOpen(false)}
                    />

                    <div className="relative bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-xs overflow-hidden">
                        <div className="px-6 pt-8 pb-6 text-center">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">정말 삭제할까요?</h3>
                            <p className="text-sm text-gray-500">이 작업은 되돌릴 수 없습니다.</p>
                        </div>

                        <div className="border-t border-gray-200/50">
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="w-full py-4 text-red-600 font-semibold active:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                {deleting ? '삭제 중...' : '삭제'}
                            </button>
                        </div>

                        <div className="border-t border-gray-200/50">
                            <button
                                onClick={() => setIsDeleteDialogOpen(false)}
                                disabled={deleting}
                                className="w-full py-4 text-[#0047AB] font-semibold active:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                취소
                            </button>
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
