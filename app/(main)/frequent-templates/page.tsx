"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, Plus, Trash2, Pencil, X, ChevronDown, Zap } from "lucide-react"
import { useRouter } from "next/navigation"
import { getFrequentTransactions, getCategories } from "@/lib/supabase/queries"
import {
    addFrequentTransaction,
    updateFrequentTransaction,
    deleteFrequentTransaction,
} from "@/lib/supabase/mutations"
import type { FrequentTransaction, Category, TransactionType } from "@/types/database"
import {
    Utensils, Car, Coffee, ShoppingBasket, Home, Hospital, Heart, Gamepad2,
    Plane, MoreHorizontal, Shirt, Theater, Hotel, Gift, GraduationCap, Baby,
    Banknote, Briefcase, Landmark, CircleDollarSign, PiggyBank, Building2,
    Shield, TrendingUp, BarChart2, Building, Bitcoin
} from "lucide-react"

const iconMap: Record<string, any> = {
    '식비': Utensils, '교통': Car, '카페': Coffee, '생활': ShoppingBasket,
    '주거': Home, '병원': Hospital, '건강': Heart, '여가': Gamepad2,
    '여행': Plane, '의복/미용': Shirt, '자동차': Car, '문화/여가': Theater,
    '여행/숙박': Hotel, '경조사': Gift, '교육': GraduationCap, '육아': Baby,
    '선물': Gift, '기타': MoreHorizontal, '급여': Banknote, '부업': Briefcase,
    '이자': Landmark, '기타수입': CircleDollarSign, '적금': PiggyBank,
    '청약': Building2, '비상금': Shield, '주식': TrendingUp, '펀드': BarChart2,
    '부동산': Building, '코인': Bitcoin,
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
    '비상금': 'bg-indigo-100 text-indigo-600', '주식': 'bg-purple-100 text-purple-600',
    '펀드': 'bg-violet-100 text-violet-600', '부동산': 'bg-purple-100 text-purple-700',
    '코인': 'bg-amber-100 text-amber-600',
}

const TYPE_LABEL: Record<TransactionType, string> = {
    expense: '지출', income: '수입', savings: '저축', investment: '투자',
}
const TYPE_COLOR: Record<TransactionType, string> = {
    expense: 'text-red-600 bg-red-50',
    income: 'text-green-600 bg-green-50',
    savings: 'text-blue-600 bg-blue-50',
    investment: 'text-purple-600 bg-purple-50',
}

const TYPE_CATEGORY_NAMES: Record<TransactionType, string[]> = {
    expense: ['식비', '교통', '카페', '생활', '주거', '병원', '건강', '여가', '여행', '의복/미용', '자동차', '문화/여가', '여행/숙박', '경조사', '교육', '육아', '선물', '기타'],
    income: ['급여', '부업', '이자', '기타수입'],
    savings: ['적금', '청약', '비상금'],
    investment: ['주식', '펀드', '부동산', '코인'],
}

type SheetMode = 'create' | 'edit'

interface SheetState {
    open: boolean
    mode: SheetMode
    editId: string | null
    transactionType: TransactionType
    categoryId: string | null
    payee: string
    description: string
    amountStr: string
    isCategoryOpen: boolean
}

const defaultSheet = (): SheetState => ({
    open: false,
    mode: 'create',
    editId: null,
    transactionType: 'expense',
    categoryId: null,
    payee: '',
    description: '',
    amountStr: '',
    isCategoryOpen: false,
})

export default function FrequentTemplatesPage() {
    const router = useRouter()
    const [templates, setTemplates] = useState<FrequentTransaction[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
    const [sheet, setSheet] = useState<SheetState>(defaultSheet())

    useEffect(() => {
        async function load() {
            const [t, c] = await Promise.all([getFrequentTransactions(), getCategories()])
            setTemplates(t)
            setCategories(c)
            setLoading(false)
        }
        load()
    }, [])

    const filteredCategories = categories.filter(c =>
        TYPE_CATEGORY_NAMES[sheet.transactionType].includes(c.name)
    )

    const openCreate = () => setSheet({ ...defaultSheet(), open: true, mode: 'create' })

    const openEdit = (t: FrequentTransaction) => {
        setSheet({
            open: true,
            mode: 'edit',
            editId: t.id,
            transactionType: t.transaction_type as TransactionType,
            categoryId: t.category_id,
            payee: t.payee,
            description: t.description ?? '',
            amountStr: t.amount != null ? String(t.amount) : '',
            isCategoryOpen: false,
        })
    }

    const closeSheet = () => setSheet(defaultSheet())

    const handleSave = async () => {
        if (!sheet.categoryId || !sheet.payee.trim()) return
        setSaving(true)
        try {
            if (sheet.mode === 'create') {
                const result = await addFrequentTransaction({
                    transaction_type: sheet.transactionType,
                    category_id: sheet.categoryId,
                    payee: sheet.payee.trim(),
                    description: sheet.description.trim() || null,
                    amount: sheet.amountStr ? Number(sheet.amountStr) : null,
                })
                if (!result.success) {
                    alert(result.error)
                    return
                }
            } else if (sheet.editId) {
                const result = await updateFrequentTransaction(sheet.editId, {
                    transaction_type: sheet.transactionType,
                    category_id: sheet.categoryId,
                    payee: sheet.payee.trim(),
                    description: sheet.description.trim() || null,
                    amount: sheet.amountStr ? Number(sheet.amountStr) : null,
                })
                if (!result.success) {
                    alert(result.error)
                    return
                }
            }
            // 목록 새로고침
            const refreshed = await getFrequentTransactions()
            setTemplates(refreshed)
            closeSheet()
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        const result = await deleteFrequentTransaction(id)
        if (result.success) {
            setTemplates(prev => prev.filter(t => t.id !== id))
        } else {
            alert(result.error)
        }
        setDeleteTargetId(null)
    }

    const getCategoryData = (categoryId: string) =>
        categories.find(c => c.id === categoryId)

    const isSheetValid = sheet.categoryId && sheet.payee.trim().length > 0

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
                <div className="text-gray-500">불러오는 중...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F5F5F7] pb-10">
            {/* Header */}
            <header className="flex items-center justify-between px-4 pt-14 pb-4">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm active:scale-95 transition-transform"
                >
                    <ChevronLeft className="w-5 h-5 text-gray-900" />
                </button>
                <h1 className="text-lg font-semibold text-gray-900">자주 쓰는 내역 관리</h1>
                <button
                    onClick={openCreate}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-[#0047AB] shadow-sm active:scale-95 transition-transform"
                >
                    <Plus className="w-5 h-5 text-white" />
                </button>
            </header>

            {/* 사용량 표시 */}
            <div className="px-5 mb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-medium text-gray-600">
                            {templates.length} / 15개 사용 중
                        </span>
                    </div>
                    {templates.length >= 15 && (
                        <span className="text-xs text-red-500 font-medium">최대 개수 도달</span>
                    )}
                </div>
                <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all ${templates.length >= 15 ? 'bg-red-400' : 'bg-[#0047AB]'}`}
                        style={{ width: `${(templates.length / 15) * 100}%` }}
                    />
                </div>
            </div>

            {/* 템플릿 목록 */}
            <div className="px-5 space-y-3">
                {templates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
                            <Zap className="w-8 h-8 text-blue-300" />
                        </div>
                        <div className="text-center">
                            <p className="text-gray-500 font-medium">자주 쓰는 내역이 없어요</p>
                            <p className="text-sm text-gray-400 mt-1">우상단 + 버튼으로 추가해보세요</p>
                        </div>
                    </div>
                ) : (
                    templates.map((template) => {
                        const cat = getCategoryData(template.category_id)
                        const Icon = cat ? (iconMap[cat.name] || MoreHorizontal) : MoreHorizontal
                        const colorClass = cat ? (colorMap[cat.name] || 'bg-gray-100 text-gray-600') : 'bg-gray-100 text-gray-600'
                        const type = template.transaction_type as TransactionType

                        return (
                            <div
                                key={template.id}
                                className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3"
                            >
                                {/* 카테고리 아이콘 */}
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                                    <Icon className="w-5 h-5" />
                                </div>

                                {/* 내용 */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${TYPE_COLOR[type]}`}>
                                            {TYPE_LABEL[type]}
                                        </span>
                                        <span className="text-xs text-gray-400">{cat?.name ?? '미분류'}</span>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 truncate">{template.payee}</p>
                                    {template.description && (
                                        <p className="text-xs text-gray-400 truncate">{template.description}</p>
                                    )}
                                    <div className="flex items-center gap-2 mt-0.5">
                                        {template.amount != null && (
                                            <span className="text-xs text-gray-500">
                                                {template.amount.toLocaleString('ko-KR')}원
                                            </span>
                                        )}
                                        {/* <span className="text-xs text-gray-400">{template.usage_count}회 사용</span> */}
                                    </div>
                                </div>

                                {/* 액션 버튼 */}
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <button
                                        onClick={() => openEdit(template)}
                                        className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
                                    >
                                        <Pencil className="w-3.5 h-3.5 text-gray-500" />
                                    </button>
                                    <button
                                        onClick={() => setDeleteTargetId(template.id)}
                                        className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center active:scale-95 transition-transform"
                                    >
                                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                    </button>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* 생성/수정 Bottom Sheet */}
            {sheet.open && (
                <div className="fixed inset-0 z-50">
                    <div
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                        onClick={closeSheet}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[2rem] max-h-[85vh] overflow-y-auto max-w-md mx-auto">
                        <div className="p-6 pb-10">
                            {/* Sheet Header */}
                            <div className="flex justify-center mb-3">
                                <div className="w-10 h-1 bg-gray-200 rounded-full" />
                            </div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {sheet.mode === 'create' ? '자주 쓰는 내역 추가' : '수정'}
                                </h2>
                                <button
                                    onClick={closeSheet}
                                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:scale-95"
                                >
                                    <X className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* 거래 타입 */}
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 mb-2 block">거래 유형 *</label>
                                    <div className="grid grid-cols-4 gap-1 bg-gray-100 rounded-2xl p-1">
                                        {(['expense', 'income', 'savings', 'investment'] as TransactionType[]).map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => setSheet(s => ({
                                                    ...s,
                                                    transactionType: type,
                                                    categoryId: null,
                                                }))}
                                                className={`py-2 rounded-xl text-xs font-semibold transition-all ${sheet.transactionType === type
                                                    ? `${TYPE_COLOR[type]} shadow-sm`
                                                    : 'text-gray-400'
                                                    }`}
                                            >
                                                {TYPE_LABEL[type]}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 카테고리 선택 */}
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 mb-2 block">카테고리 *</label>
                                    <button
                                        type="button"
                                        onClick={() => setSheet(s => ({ ...s, isCategoryOpen: !s.isCategoryOpen }))}
                                        className="w-full bg-gray-50 rounded-2xl p-3.5 flex items-center justify-between border border-gray-100 active:scale-[0.98] transition-transform"
                                    >
                                        <div className="flex items-center gap-2">
                                            {sheet.categoryId ? (() => {
                                                const cat = categories.find(c => c.id === sheet.categoryId)
                                                if (!cat) return <span className="text-sm text-gray-400">카테고리 선택</span>
                                                const Icon = iconMap[cat.name] || MoreHorizontal
                                                return (
                                                    <>
                                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${colorMap[cat.name] || 'bg-gray-100 text-gray-600'}`}>
                                                            <Icon className="w-4 h-4" />
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-900">{cat.name}</span>
                                                    </>
                                                )
                                            })() : <span className="text-sm text-gray-400">카테고리 선택</span>}
                                        </div>
                                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${sheet.isCategoryOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {sheet.isCategoryOpen && (
                                        <div className="mt-2 bg-gray-50 rounded-2xl p-3 border border-gray-100">
                                            <div className="grid grid-cols-4 gap-2">
                                                {filteredCategories.map((cat) => {
                                                    const Icon = iconMap[cat.name] || MoreHorizontal
                                                    const isSelected = sheet.categoryId === cat.id
                                                    return (
                                                        <button
                                                            key={cat.id}
                                                            onClick={() => setSheet(s => ({
                                                                ...s,
                                                                categoryId: cat.id,
                                                                isCategoryOpen: false,
                                                            }))}
                                                            className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all active:scale-95 ${isSelected ? 'bg-[#0047AB]' : 'bg-white'}`}
                                                        >
                                                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isSelected ? 'bg-white/20' : (colorMap[cat.name] || 'bg-gray-100 text-gray-600')}`}>
                                                                <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : ''}`} />
                                                            </div>
                                                            <span className={`text-[10px] font-medium ${isSelected ? 'text-white' : 'text-gray-700'}`}>{cat.name}</span>
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* 지출처 */}
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 mb-2 block">지출처 *</label>
                                    <input
                                        type="text"
                                        value={sheet.payee}
                                        onChange={(e) => setSheet(s => ({ ...s, payee: e.target.value }))}
                                        placeholder="예: 스타벅스"
                                        className="w-full bg-gray-50 rounded-2xl px-4 py-3.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none border border-gray-100 focus:border-blue-300 transition-colors"
                                    />
                                </div>

                                {/* 메모 (선택) */}
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 mb-2 block">메모 <span className="text-gray-300">(선택)</span></label>
                                    <input
                                        type="text"
                                        value={sheet.description}
                                        onChange={(e) => setSheet(s => ({ ...s, description: e.target.value }))}
                                        placeholder="추가 메모를 입력하세요"
                                        className="w-full bg-gray-50 rounded-2xl px-4 py-3.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none border border-gray-100 focus:border-blue-300 transition-colors"
                                    />
                                </div>

                                {/* 금액 (선택) */}
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 mb-2 block">금액 (선택)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={sheet.amountStr}
                                            onChange={(e) => setSheet(s => ({ ...s, amountStr: e.target.value }))}
                                            placeholder="금액 미입력 시 칩에서 숨김"
                                            inputMode="numeric"
                                            className="w-full bg-gray-50 rounded-2xl px-4 py-3.5 pr-8 text-sm text-gray-900 placeholder:text-gray-400 outline-none border border-gray-100 focus:border-blue-300 transition-colors"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">원</span>
                                    </div>
                                </div>

                                {/* 저장 버튼 */}
                                <button
                                    onClick={handleSave}
                                    disabled={!isSheetValid || saving}
                                    className="w-full bg-[#0047AB] text-white rounded-2xl py-4 font-semibold text-base active:scale-[0.98] transition-transform disabled:opacity-40 shadow-lg shadow-blue-900/25"
                                >
                                    {saving ? '저장 중...' : (sheet.mode === 'create' ? '추가하기' : '수정 완료')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 삭제 확인 다이얼로그 */}
            {deleteTargetId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                        onClick={() => setDeleteTargetId(null)}
                    />
                    <div className="relative bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-xs overflow-hidden">
                        <div className="px-6 pt-8 pb-6 text-center">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">삭제할까요?</h3>
                            <p className="text-sm text-gray-500">이 작업은 되돌릴 수 없습니다.</p>
                        </div>
                        <div className="border-t border-gray-200/50">
                            <button
                                onClick={() => handleDelete(deleteTargetId)}
                                className="w-full py-4 text-red-600 font-semibold active:bg-gray-50 transition-colors"
                            >
                                삭제
                            </button>
                        </div>
                        <div className="border-t border-gray-200/50">
                            <button
                                onClick={() => setDeleteTargetId(null)}
                                className="w-full py-4 text-[#0047AB] font-semibold active:bg-gray-50 transition-colors"
                            >
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
