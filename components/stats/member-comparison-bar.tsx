"use client"

import { Card } from "@/components/ui/card"

interface MemberData {
    name: string
    avatar: string
    amount: number
    color: string
    bgColor: string
}

interface MemberComparisonBarProps {
    husbandSpending: number
    wifeSpending: number
    totalSpending: number
    className?: string
}

export function MemberComparisonBar({
    husbandSpending,
    wifeSpending,
    totalSpending,
    className
}: MemberComparisonBarProps) {
    return (
        <Card className={`bg-white rounded-3xl p-6 shadow-sm border-0 ${className || ''}`}>
            <h2 className="text-base font-semibold text-gray-900 mb-5">멤버별 지출</h2>
            <div className="space-y-5">
                {/* Husband */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#0047AB] flex items-center justify-center text-white text-xs font-semibold">
                                남
                            </div>
                            <span className="text-sm font-medium text-gray-900">남편</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">₩{husbandSpending.toLocaleString()}</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#0047AB] rounded-full transition-all duration-500"
                            style={{ width: `${(husbandSpending / totalSpending) * 100}%` }}
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-right">
                        {((husbandSpending / totalSpending) * 100).toFixed(1)}%
                    </p>
                </div>

                {/* Wife */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-rose-400 flex items-center justify-center text-white text-xs font-semibold">
                                여
                            </div>
                            <span className="text-sm font-medium text-gray-900">아내</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">₩{wifeSpending.toLocaleString()}</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-rose-400 rounded-full transition-all duration-500"
                            style={{ width: `${(wifeSpending / totalSpending) * 100}%` }}
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-right">
                        {((wifeSpending / totalSpending) * 100).toFixed(1)}%
                    </p>
                </div>
            </div>
        </Card>
    )
}
