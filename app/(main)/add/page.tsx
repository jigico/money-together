"use client"

import { useState } from "react"
import { ChevronLeft, X } from "lucide-react"
import Link from "next/link"
import { CategoryGrid, categories } from "@/components/entry/category-grid"
import { NumberKeypad } from "@/components/entry/number-keypad"
import { SpenderToggle } from "@/components/entry/spender-toggle"

export default function AddPage() {
    const [amount, setAmount] = useState("")
    const [spender, setSpender] = useState<"husband" | "wife">("husband")
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

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

    const handleSave = () => {
        if (amount && selectedCategory) {
            alert(`저장 완료!\n금액: ${formatAmount(amount)}원\n작성자: ${spender === "husband" ? "남편" : "아내"}\n카테고리: ${categories.find((c) => c.id === selectedCategory)?.name}`)
        }
    }

    const isValid = amount.length > 0 && selectedCategory !== null

    return (
        <div className="min-h-screen bg-[#F5F5F7] flex flex-col max-w-md mx-auto">
            {/* Header */}
            <header className="flex items-center justify-between px-4 pt-14 pb-4">
                <Link
                    href="/"
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm active:scale-95 transition-transform"
                >
                    <ChevronLeft className="w-5 h-5 text-foreground" />
                </Link>
                <h1 className="text-lg font-semibold text-foreground">내역 입력</h1>
                <button
                    type="button"
                    onClick={() => setAmount("")}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm active:scale-95 transition-transform"
                >
                    <X className="w-5 h-5 text-muted-foreground" />
                </button>
            </header>

            {/* Amount Display */}
            <div className="px-6 py-8 flex-shrink-0">
                <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold tracking-tight text-foreground tabular-nums">
                        {formatAmount(amount)}
                    </span>
                    <span className="text-3xl font-semibold text-muted-foreground">원</span>
                    <span className="w-0.5 h-12 bg-primary animate-pulse ml-1" />
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
                className="px-6 pb-6 flex-shrink-0"
            />

            {/* Number Keypad */}
            <NumberKeypad
                onKeyPress={handleKeyPress}
                onSave={handleSave}
                isValid={isValid}
                className="mt-auto"
            />
        </div>
    )
}
