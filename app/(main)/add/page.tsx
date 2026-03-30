"use client"

import { CalendarDatePicker } from "@/components/entry/calendar-date-picker"
import { MemberSelector } from "@/components/entry/member-selector"
import { NumberKeypad } from "@/components/entry/number-keypad"
import { getCurrentUserMemberId } from "@/lib/supabase/helpers"
import { addFrequentTransaction, addTransaction } from "@/lib/supabase/mutations"
import { getCategories, getFrequentTransactions, getMembers } from "@/lib/supabase/queries"
import type { Category, FrequentTransaction, Member, TransactionType } from "@/types/database"
import { Baby, Banknote, BarChart2, Bitcoin, Briefcase, Building, Building2, Calendar, Car, ChevronDown, ChevronLeft, CircleDollarSign, Coffee, Gamepad2, Gift, GraduationCap, Heart, Home, Hospital, Hotel, Landmark, MoreHorizontal, PiggyBank, Plane, RotateCcw, Shield, Shirt, ShoppingBasket, Theater, TrendingUp, Utensils, X, Zap } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

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
    // 수입
    '급여': Banknote,
    '부업': Briefcase,
    '이자': Landmark,
    '기타수입': CircleDollarSign,
    // 저축
    '적금': PiggyBank,
    '청약': Building2,
    '비상금': Shield,
    // 투자
    '주식': TrendingUp,
    '펀드': BarChart2,
    '부동산': Building,
    '코인': Bitcoin,
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
    // 수입
    '급여': 'bg-green-100 text-green-700',
    '부업': 'bg-emerald-100 text-emerald-600',
    '이자': 'bg-teal-100 text-teal-600',
    '기타수입': 'bg-green-100 text-green-600',
    // 저축
    '적금': 'bg-blue-100 text-blue-600',
    '청약': 'bg-sky-100 text-sky-600',
    '비상금': 'bg-indigo-100 text-indigo-600',
    // 투자
    '주식': 'bg-purple-100 text-purple-600',
    '펀드': 'bg-violet-100 text-violet-600',
    '부동산': 'bg-purple-100 text-purple-700',
    '코인': 'bg-amber-100 text-amber-600',
}

const TYPE_LABEL: Record<TransactionType, string> = {
    expense: '지출',
    income: '수입',
    savings: '저축',
    investment: '투자',
}

const TYPE_COLOR: Record<TransactionType, string> = {
    expense: 'text-red-600 bg-red-50',
    income: 'text-green-600 bg-green-50',
    savings: 'text-blue-600 bg-blue-50',
    investment: 'text-purple-600 bg-purple-50',
}

export default function AddPage() {
    const router = useRouter()
    const [amount, setAmount] = useState("")
    const [transactionType, setTransactionType] = useState<TransactionType>('expense')
    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [description, setDescription] = useState("")
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
    const [isCategoryOpen, setIsCategoryOpen] = useState(false)
    const [isFrequentOpen, setIsFrequentOpen] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])
    const [members, setMembers] = useState<Member[]>([])
    const [frequentTemplates, setFrequentTemplates] = useState<FrequentTransaction[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saveAsTemplate, setSaveAsTemplate] = useState(false)
    const [currentUserMemberId, setCurrentUserMemberId] = useState<string | null>(null)

    useEffect(() => {
        async function fetchData() {
            try {
                const [categoriesData, membersData, templatesData] = await Promise.all([
                    getCategories(),
                    getMembers(),
                    getFrequentTransactions(),
                ])
                setCategories(categoriesData)
                setMembers(membersData)
                setFrequentTemplates(templatesData)

                // 로그인한 사용자를 기본 선택
                const myMemberId = await getCurrentUserMemberId()
                setCurrentUserMemberId(myMemberId)
                if (myMemberId) {
                    setSelectedMemberId(myMemberId)
                } else if (membersData.length > 0) {
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

    // 유형별 카테고리 필터
    const TYPE_CATEGORY_NAMES: Record<TransactionType, string[]> = {
        expense: ['식비', '교통', '카페', '생활', '주거', '병원', '건강', '여가', '여행', '의복/미용', '자동차', '문화/여가', '여행/숙박', '경조사', '교육', '육아', '선물', '기타'],
        income: ['급여', '부업', '이자', '기타수입'],
        savings: ['적금', '청약', '비상금'],
        investment: ['주식', '펀드', '부동산', '코인'],
    }
    const filteredCategories = categories.filter(c => TYPE_CATEGORY_NAMES[transactionType].includes(c.name))
    const selectedCategoryData = filteredCategories.find((c) => c.id === selectedCategory)

    // 칩 탭 핸들러: 폼 자동 완성
    const handleChipTap = (template: FrequentTransaction) => {
        setTransactionType(template.transaction_type as TransactionType)
        setSelectedCategory(template.category_id)
        setDescription(template.description)
        if (template.amount != null) {
            setAmount(String(template.amount))
        }
        // 지출자는 현재 로그인 유저로 고정
        if (currentUserMemberId) {
            setSelectedMemberId(currentUserMemberId)
        }
        // usage_count 증가 로직은 추후 결정 예정 (현재 보류)
    }

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
                transaction_type: transactionType,
            })

            // 자주 쓰는 내역으로 저장 체크된 경우
            if (saveAsTemplate) {
                const result = await addFrequentTransaction({
                    transaction_type: transactionType,
                    category_id: selectedCategory,
                    description: description,
                    amount: amount ? Number(amount) : null,
                })
                if (!result.success && result.error) {
                    alert(result.error)
                }
            }

            router.push('/history')
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
            {/* Header */}
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
                        setSaveAsTemplate(false)
                    }}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm active:scale-95 transition-transform"
                >
                    <RotateCcw className="w-5 h-5 text-gray-500" />
                </button>
            </header>

            {/* Transaction Type Tabs */}
            <div className="px-6 pb-3 flex-shrink-0">
                <div className="grid grid-cols-4 gap-1 bg-white rounded-2xl p-1 shadow-sm">
                    {([
                        { type: 'expense' as TransactionType, label: '지출', color: 'text-red-600', bg: 'bg-red-50' },
                        { type: 'income' as TransactionType, label: '수입', color: 'text-green-600', bg: 'bg-green-50' },
                        { type: 'savings' as TransactionType, label: '저축', color: 'text-blue-600', bg: 'bg-blue-50' },
                        { type: 'investment' as TransactionType, label: '투자', color: 'text-purple-600', bg: 'bg-purple-50' },
                    ]).map(({ type, label, color, bg }) => (
                        <button
                            key={type}
                            onClick={() => { setTransactionType(type); setSelectedCategory(null) }}
                            className={`py-2 rounded-xl text-sm font-semibold transition-all ${transactionType === type ? `${bg} ${color}` : 'text-gray-400'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

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
                {/* Date Picker */}
                <button
                    type="button"
                    onClick={() => setIsDatePickerOpen(true)}
                    className="w-full bg-white rounded-2xl py-2 px-4 shadow-sm flex items-center justify-between active:scale-[0.98] transition-transform"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-900">{formatDate(selectedDate)}</span>
                    </div>
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                </button>

                {/* Category Button */}
                <button
                    type="button"
                    onClick={() => setIsCategoryOpen(true)}
                    className="w-full bg-white rounded-2xl py-2 px-4 shadow-sm flex items-center justify-between active:scale-[0.98] transition-transform"
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
                        placeholder="설명을 입력하세요"
                        className="w-full bg-transparent text-gray-900 placeholder:text-gray-400 outline-none text-sm"
                    />
                </div>

                {/* Frequent Templates Controls */}
                <div className="flex flex-row items-center justify-between px-1">
                    {/* 자주 쓰는 내역으로 저장 체크박스 */}
                    <div
                        className="flex items-center gap-3 cursor-pointer group py-1"
                        onClick={() => setSaveAsTemplate(prev => !prev)}
                    >
                        <div
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${saveAsTemplate
                                ? 'bg-[#0047AB] border-[#0047AB]'
                                : 'border-gray-300 group-active:border-gray-400'
                                }`}
                        >
                            {saveAsTemplate && (
                                <svg className="w-3 h-3 text-white" fill="none" strokeWidth={2.5} stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                            )}
                        </div>
                        <span className="text-sm text-gray-600 font-medium select-none">
                            자주 쓰는 내역으로 저장
                        </span>
                    </div>

                    {/* 자주 쓰는 내역 불러오기 버튼 */}
                    {frequentTemplates.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setIsFrequentOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg active:scale-95 transition-transform"
                        >
                            <Zap className="w-4 h-4" />
                            <span className="text-sm font-semibold">자주 쓰는 내역</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Number Keypad */}
            <NumberKeypad
                onKeyPress={handleKeyPress}
                onSave={handleSave}
                isValid={isValid}
                className="mt-auto"
            />

            {/* Date Picker Modal */}
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
                            {filteredCategories.map((category) => {
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

            {/* Frequent Templates Modal */}
            {isFrequentOpen && (
                <div className="fixed inset-0 z-50">
                    <div
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                        onClick={() => setIsFrequentOpen(false)}
                    />

                    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[2rem] p-6 pb-10 max-w-md mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Zap className="w-5 h-5 text-amber-500" />
                                <h2 className="text-lg font-semibold text-gray-900">자주 쓰는 내역</h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsFrequentOpen(false)}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
                            >
                                <X className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto scrollbar-hide">
                            {frequentTemplates.map((template) => {
                                const cat = categories.find(c => c.id === template.category_id)
                                const catName = cat?.name ?? '미분류'
                                const Icon = iconMap[catName] || MoreHorizontal
                                const colorClass = colorMap[catName] || 'bg-gray-100 text-gray-600'

                                return (
                                    <button
                                        key={template.id}
                                        type="button"
                                        onClick={() => {
                                            handleChipTap(template)
                                            setIsFrequentOpen(false)
                                        }}
                                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl active:scale-[0.98] transition-all hover:bg-gray-100 text-left"
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex flex-col items-start min-w-0 flex-1">
                                            <div className="flex items-center gap-2 w-full">
                                                <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md flex-shrink-0 ${TYPE_COLOR[template.transaction_type as TransactionType]}`}>
                                                    {TYPE_LABEL[template.transaction_type as TransactionType]}
                                                </span>
                                            </div>
                                            <span className="mt-1 text-sm font-semibold text-gray-900 truncate">
                                                {template.description}
                                            </span>
                                        </div>
                                        {template.amount != null && (
                                            <span className="text-sm font-semibold text-gray-900 flex-shrink-0">
                                                {template.amount.toLocaleString('ko-KR')}원
                                            </span>
                                        )}
                                    </button>
                                )
                            })}

                            {frequentTemplates.length === 0 && (
                                <div className="text-center py-8 text-gray-500 text-sm">
                                    저장된 자주 쓰는 내역이 없습니다.
                                </div>
                            )}
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
