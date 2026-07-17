"use client"

import { Keyboard, LayoutGrid } from "lucide-react"

interface AmountInputProps {
    amount: string
    onAmountChange: (digits: string) => void
    keypadVisible: boolean
    onToggleKeypad: () => void
    className?: string
}

// 금액 표시 + 입력 필드.
// 기본은 네이티브 키보드 입력(모바일 숫자 키보드/PC 키보드),
// 토글 버튼으로 커스텀 키패드 모드 전환 (이때 입력창은 readOnly로 OS 키보드 차단).
export function AmountInput({ amount, onAmountChange, keypadVisible, onToggleKeypad, className }: AmountInputProps) {
    const formatted = amount ? Number(amount).toLocaleString("ko-KR") : ""

    return (
        <div className={`relative flex items-baseline justify-center gap-1 px-14 ${className || ''}`}>
            <input
                type="text"
                inputMode={keypadVisible ? "none" : "numeric"}
                pattern="[0-9]*"
                autoComplete="off"
                value={formatted}
                placeholder="0"
                readOnly={keypadVisible}
                onChange={(e) => onAmountChange(e.target.value.replace(/\D/g, "").slice(0, 10))}
                style={{ width: `${Math.max(formatted.length, 1)}ch` }}
                className="bg-transparent text-right text-5xl font-bold tracking-tight text-gray-900 tabular-nums outline-none placeholder:text-gray-300 caret-[#0047AB] min-w-[1ch] max-w-full"
                aria-label="금액"
            />
            <span className="text-3xl font-semibold text-gray-500 flex-shrink-0">원</span>
            {keypadVisible && (
                <span className="w-0.5 h-12 bg-[#0047AB] animate-pulse ml-1 self-center" />
            )}

            {/* 입력 방식 토글 */}
            <button
                type="button"
                onClick={onToggleKeypad}
                title={keypadVisible ? "키보드로 입력" : "키패드로 입력"}
                aria-label={keypadVisible ? "키보드로 입력" : "키패드로 입력"}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 active:scale-95 hover:bg-gray-200 transition-all"
            >
                {keypadVisible ? <Keyboard className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
            </button>
        </div>
    )
}
