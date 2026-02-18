import { Card } from "@/components/ui/card"

interface SpendingSummaryCardProps {
    totalSpent: number
    budget: number
    className?: string
}

export function SpendingSummaryCard({ totalSpent, budget, className }: SpendingSummaryCardProps) {
    const percentage = budget > 0 ? (totalSpent / budget) * 100 : 0
    const remaining = budget - totalSpent
    const isOverBudget = remaining < 0

    return (
        <Card className={`bg-white rounded-3xl p-6 shadow-sm border-0 ${className || ''}`}>
            <p className="text-sm text-gray-500 mb-2 font-medium">이번 달 지출</p>
            <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-gray-900 tracking-tight">
                    ₩{totalSpent.toLocaleString()}
                </span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-500">예산</span>
                    <span className="font-semibold text-gray-900">₩{budget.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm mb-3">
                    <span className={isOverBudget ? "text-red-500 font-medium" : "text-gray-500"}>
                        {isOverBudget ? "초과" : "남은 예산"}
                    </span>
                    <span className={`font-semibold ${isOverBudget ? "text-red-500" : "text-[#0047AB]"}`}>
                        {isOverBudget ? "-" : ""}₩{Math.abs(remaining).toLocaleString()}
                        <span className="text-xs font-normal text-gray-400 ml-1">
                            ({percentage.toFixed(0)}%)
                        </span>
                    </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all ${isOverBudget ? "bg-red-500" : "bg-[#0047AB]"}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                </div>
            </div>
        </Card>
    )
}
