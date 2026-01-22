"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CategoryGrid } from "@/components/entry/category-grid"
import { NumberKeypad } from "@/components/entry/number-keypad"
import { SpenderToggle } from "@/components/entry/spender-toggle"
import { getCategories, getMembers } from "@/lib/supabase/queries"
import { addTransaction } from "@/lib/supabase/mutations"
import type { Category, Member } from "@/types/database"

export default function AddPage() {
    const router = useRouter()
    const [amount, setAmount] = useState("")
    const [spender, setSpender] = useState<"husband" | "wife">("husband")
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
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
            // 선택된 멤버 찾기 (spender 상태에 따라)
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
                description: '',
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
                    onClick={() => setAmount("")}
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

            {/* Category Grid */}
            <CategoryGrid
                selectedCategory={selectedCategory}
                onCategorySelect={setSelectedCategory}
                categories={categories}
                className="px-6 pb-6 flex-shrink-0"
            />

            {/* Number Keypad */}
            <NumberKeypad
                onKeyPress={handleKeyPress}
                onSave={handleSave}
                isValid={isValid}
                className="mt-auto"
            />

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
