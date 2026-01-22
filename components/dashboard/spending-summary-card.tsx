import { Card } from "@/components/ui/card"

interface SpendingSummaryCardProps {
    totalSpent: number
    budget: number
    className?: string
}

export function SpendingSummaryCard({ totalSpent, budget, className }: SpendingSummaryCardProps) {
    const percentage = (totalSpent / budget) * 100

    return (
        <Card className={`bg-white rounded-3xl p-6 shadow-sm border-0 ${className || ''}`}>
            <p className="text-sm text-gray-500 mb-2 font-medium">이번 달 지출</p>
            <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-gray-900 tracking-tight">
                    ₩{totalSpent.toLocaleString()}
                </span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">예산</span>
                    <span className="font-semibold text-gray-900">₩{budget.toLocaleString()}</span>
                </div>
                <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[#0047AB] rounded-full transition-all"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                </div>
            </div>
        </Card>
    )
}
