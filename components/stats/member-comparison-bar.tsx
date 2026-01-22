"use client"

import { Card } from "@/components/ui/card"

export interface MemberSpending {
    id: string
    name: string
    avatar: string
    amount: number
    color: string
    bgColor: string
}

interface MemberComparisonBarProps {
    members: MemberSpending[]
    className?: string
}

export function MemberComparisonBar({ members, className }: MemberComparisonBarProps) {
    const totalSpending = members.reduce((sum, member) => sum + member.amount, 0)

    return (
        <Card className={`bg-white rounded-3xl p-6 shadow-sm border-0 ${className || ''}`}>
            <h2 className="text-base font-semibold text-gray-900 mb-5">멤버별 지출</h2>
            <div className="space-y-5">
                {members.map((member) => {
                    const percentage = (member.amount / totalSpending) * 100
                    return (
                        <div key={member.id}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold`}
                                        style={{ backgroundColor: member.bgColor }}
                                    >
                                        {member.avatar}
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">{member.name}</span>
                                </div>
                                <span className="text-sm font-bold text-gray-900">₩{member.amount.toLocaleString()}</span>
                            </div>
                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${percentage}%`,
                                        backgroundColor: member.color
                                    }}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1 text-right">
                                {percentage.toFixed(1)}%
                            </p>
                        </div>
                    )
                })}
            </div>
        </Card>
    )
}
