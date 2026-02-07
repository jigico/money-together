import { Card } from "@/components/ui/card"
import { TrendingUp, CreditCard } from "lucide-react"

interface QuickStatsGridProps {
    monthlyChange: number | null
    todaySpent: number
    className?: string
}

export function QuickStatsGrid({ monthlyChange, todaySpent, className }: QuickStatsGridProps) {
    return (
        <div className={`grid grid-cols-2 gap-3 ${className || ''}`}>
            <Card className="bg-white rounded-2xl p-5 shadow-sm border-0">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                </div>
                <p className="text-xs text-gray-500 mb-1">전월 대비</p>
                <p className="text-xl font-bold text-gray-900">
                    {monthlyChange !== null ? (
                        `${monthlyChange > 0 ? '+' : ''}${monthlyChange}%`
                    ) : (
                        '0%'
                    )}
                </p>
            </Card>
            <Card className="bg-white rounded-2xl p-5 shadow-sm border-0">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-green-600" />
                    </div>
                </div>
                <p className="text-xs text-gray-500 mb-1">오늘 지출</p>
                <p className="text-xl font-bold text-gray-900">₩{todaySpent.toLocaleString()}</p>
            </Card>
        </div>
    )
}
