"use client"

import { useState, useEffect } from "react"
import { X, RotateCcw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { Category, Member, TransactionUI, TransactionType } from "@/types/database"
import {
    Utensils, Car, Coffee, ShoppingBasket, Home as HomeIcon, Hospital, Heart,
    Gamepad2, Plane, Shirt, Theater, Hotel, Gift, GraduationCap, Baby,
    Banknote, Briefcase, Landmark, CircleDollarSign, PiggyBank, Building2,
    Shield, TrendingUp, BarChart2, Building, Bitcoin, MoreHorizontal
} from "lucide-react"

const iconMap: Record<string, any> = {
    '식비': Utensils, '교통': Car, '카페': Coffee, '생활': ShoppingBasket,
    '주거': HomeIcon, '병원': Hospital, '건강': Heart, '여가': Gamepad2,
    '여행': Plane, '의복/미용': Shirt, '자동차': Car, '문화/여가': Theater,
    '여행/숙박': Hotel, '경조사': Gift, '교육': GraduationCap, '육아': Baby,
    '선물': Gift, '기타': MoreHorizontal,
    '급여': Banknote, '부업': Briefcase, '이자': Landmark, '기타수입': CircleDollarSign,
    '적금': PiggyBank, '청약': Building2, '비상금': Shield,
    '주식': TrendingUp, '펀드': BarChart2, '부동산': Building, '코인': Bitcoin,
}

const colorMap: Record<string, string> = {
    '식비': 'bg-orange-100 text-orange-600', '교통': 'bg-blue-100 text-blue-600',
    '카페': 'bg-amber-100 text-amber-700', '생활': 'bg-purple-100 text-purple-600',
    '주거': 'bg-green-100 text-green-600', '병원': 'bg-pink-100 text-pink-600',
    '건강': 'bg-red-100 text-red-600', '여가': 'bg-indigo-100 text-indigo-600',
    '여행': 'bg-cyan-100 text-cyan-600', '의복/미용': 'bg-pink-100 text-pink-600',
    '자동차': 'bg-blue-100 text-blue-600', '문화/여가': 'bg-purple-100 text-purple-600',
    '여행/숙박': 'bg-cyan-100 text-cyan-600', '경조사': 'bg-amber-100 text-amber-600',
    '교육': 'bg-green-100 text-green-600', '육아': 'bg-yellow-100 text-yellow-600',
    '선물': 'bg-pink-100 text-pink-600', '기타': 'bg-gray-100 text-gray-600',
    '급여': 'bg-green-100 text-green-700', '부업': 'bg-emerald-100 text-emerald-600',
    '이자': 'bg-teal-100 text-teal-600', '기타수입': 'bg-green-100 text-green-600',
    '적금': 'bg-blue-100 text-blue-600', '청약': 'bg-sky-100 text-sky-600',
    '비상금': 'bg-indigo-100 text-indigo-600',
    '주식': 'bg-purple-100 text-purple-600', '펀드': 'bg-violet-100 text-violet-600',
    '부동산': 'bg-purple-100 text-purple-700', '코인': 'bg-amber-100 text-amber-600',
}

const TYPE_LABELS: Record<TransactionType, { label: string; color: string; bg: string }> = {
    expense: { label: '지출', color: 'text-red-600', bg: 'bg-red-50' },
    income: { label: '수입', color: 'text-green-600', bg: 'bg-green-50' },
    savings: { label: '저축', color: 'text-blue-600', bg: 'bg-blue-50' },
    investment: { label: '투자', color: 'text-purple-600', bg: 'bg-purple-50' },
}

const TYPE_CATEGORY_NAMES: Record<TransactionType, string[]> = {
    expense: ['식비', '교통', '카페', '생활', '주거', '병원', '건강', '여가', '여행', '의복/미용', '자동차', '문화/여가', '여행/숙박', '경조사', '교육', '육아', '선물', '기타'],
    income: ['급여', '부업', '이자', '기타수입'],
    savings: ['적금', '청약', '비상금'],
    investment: ['주식', '펀드', '부동산', '코인'],
}

interface FilterModalProps {
    isOpen: boolean
    onClose: () => void
    members: Member[]
    categories: Category[]
    transactions: TransactionUI[]
    filterMember: string | null
    filterCategoryGroup: TransactionType | null
    filterCategory: string | null
    onApply: (
        member: string | null,
        categoryGroup: TransactionType | null,
        category: string | null
    ) => void
}

export function FilterModal({
    isOpen,
    onClose,
    members,
    categories,
    transactions,
    filterMember,
    filterCategoryGroup,
    filterCategory,
    onApply,
}: FilterModalProps) {
    const [tempMember, setTempMember] = useState<string | null>(filterMember)
    const [tempCategoryGroup, setTempCategoryGroup] = useState<TransactionType | null>(filterCategoryGroup)
    const [tempCategory, setTempCategory] = useState<string | null>(filterCategory)

    // 모달 열릴 때 외부 상태 동기화
    useEffect(() => {
        if (isOpen) {
            setTempMember(filterMember)
            setTempCategoryGroup(filterCategoryGroup)
            setTempCategory(filterCategory)
        }
    }, [isOpen, filterMember, filterCategoryGroup, filterCategory])

    // 실시간 결과 카운트
    const filteredCount = transactions.filter((tx) => {
        if (tempMember) {
            const member = members.find((m) => m.id === tempMember)
            if (tx.memberName !== member?.name) return false
        }
        if (tempCategoryGroup && tx.transactionType !== tempCategoryGroup) return false
        if (tempCategory && tx.category !== tempCategory) return false
        return true
    }).length

    const handleReset = () => {
        setTempMember(null)
        setTempCategoryGroup(null)
        setTempCategory(null)
    }

    const handleApply = () => {
        onApply(tempMember, tempCategoryGroup, tempCategory)
        onClose()
    }

    const handleSelectCategoryGroup = (type: TransactionType) => {
        // 그룹이 바뀌면 카테고리 선택 초기화 (전체로 복귀)
        if (tempCategoryGroup !== type) setTempCategory(null)
        setTempCategoryGroup((prev) => (prev === type ? null : type))
    }

    const handleSelectCategory = (name: string) => {
        // 전체 버튼 클릭 시 = 카테고리 선택 해제
        if (name === '__all__') {
            setTempCategory(null)
            return
        }
        setTempCategory((prev) => (prev === name ? null : name))
    }

    const hasFilter = tempMember || tempCategoryGroup || tempCategory

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Bottom Sheet */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="relative w-full max-w-md mx-auto bg-white rounded-t-[2rem] max-h-[85vh] flex flex-col"
                    >
                        {/* 핸들 */}
                        <div className="flex justify-center pt-3 pb-1">
                            <div className="w-10 h-1 bg-gray-200 rounded-full" />
                        </div>

                        {/* 헤더 */}
                        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
                            <h2 className="text-base font-semibold text-gray-900">필터</h2>
                            <div className="flex items-center gap-2">
                                {hasFilter && (
                                    <button
                                        onClick={handleReset}
                                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        초기화
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
                                >
                                    <X className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>
                        </div>

                        {/* 스크롤 영역 */}
                        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-6">

                            {/* 섹션 1: 지출자 */}
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">지출자</p>
                                <div className="flex flex-wrap gap-2">
                                    {members.map((member) => {
                                        const isSelected = tempMember === member.id
                                        return (
                                            <button
                                                key={member.id}
                                                onClick={() => setTempMember(isSelected ? null : member.id)}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-2xl transition-all duration-200 active:scale-95 ${isSelected
                                                    ? 'bg-[#0047AB] text-white shadow-md shadow-blue-900/20'
                                                    : 'bg-gray-100 text-gray-700'
                                                    }`}
                                            >
                                                <div
                                                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                                    style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.3)' : member.bg_color }}
                                                >
                                                    {member.avatar}
                                                </div>
                                                <span className="text-sm font-medium">{member.name}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* 섹션 2: 카테고리 그룹 */}
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">카테고리 그룹</p>
                                <div className="grid grid-cols-4 gap-2">
                                    {(Object.entries(TYPE_LABELS) as [TransactionType, typeof TYPE_LABELS[TransactionType]][]).map(([type, info]) => {
                                        const isSelected = tempCategoryGroup === type
                                        return (
                                            <button
                                                key={type}
                                                onClick={() => handleSelectCategoryGroup(type)}
                                                className={`py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 active:scale-95 ${isSelected
                                                        ? `${info.bg} ${info.color} shadow-sm ring-1 ring-inset ring-current/20`
                                                        : 'bg-gray-100 text-gray-500'
                                                    }`}
                                            >
                                                {info.label}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* 섹션 3: 카테고리 — 그룹 선택 시만 표시 */}
                            {tempCategoryGroup && (() => {
                                const groupCats = categories.filter(c =>
                                    TYPE_CATEGORY_NAMES[tempCategoryGroup].includes(c.name)
                                )
                                return (
                                    <div>
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">카테고리</p>
                                        <div className="grid grid-cols-4 gap-2">
                                            {/* 전체 버튼 */}
                                            <button
                                                onClick={() => handleSelectCategory('__all__')}
                                                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl transition-all duration-200 active:scale-95 ${tempCategory === null
                                                        ? 'bg-[#0047AB] shadow-md shadow-blue-900/20'
                                                        : 'bg-gray-50 hover:bg-gray-100'
                                                    }`}
                                            >
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${tempCategory === null ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'
                                                    }`}>
                                                    전
                                                </div>
                                                <span className={`text-[11px] font-medium ${tempCategory === null ? 'text-white' : 'text-gray-700'
                                                    }`}>전체</span>
                                            </button>

                                            {/* 그룹별 카테고리 */}
                                            {groupCats.map((cat) => {
                                                const Icon = iconMap[cat.name] || MoreHorizontal
                                                const colorClass = colorMap[cat.name] || 'bg-gray-100 text-gray-600'
                                                const isSelected = tempCategory === cat.name
                                                return (
                                                    <button
                                                        key={cat.id}
                                                        onClick={() => handleSelectCategory(cat.name)}
                                                        className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl transition-all duration-200 active:scale-95 ${isSelected
                                                                ? 'bg-[#0047AB] shadow-md shadow-blue-900/20'
                                                                : 'bg-gray-50 hover:bg-gray-100'
                                                            }`}
                                                    >
                                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isSelected ? 'bg-white/20' : colorClass
                                                            }`}>
                                                            <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : ''}`} />
                                                        </div>
                                                        <span className={`text-[11px] font-medium leading-tight text-center ${isSelected ? 'text-white' : 'text-gray-700'
                                                            }`}>
                                                            {cat.name}
                                                        </span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )
                            })()}
                        </div>

                        {/* 하단 버튼 */}
                        <div className="px-6 pt-3 pb-8 border-t border-gray-100">
                            <button
                                onClick={handleApply}
                                className="w-full py-4 bg-[#0047AB] text-white rounded-2xl text-sm font-semibold active:scale-[0.98] transition-all shadow-lg shadow-blue-900/25"
                            >
                                {filteredCount > 0
                                    ? `${filteredCount.toLocaleString()}개 내역 보기`
                                    : '결과 없음'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
