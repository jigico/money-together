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
    // 최소 2명의 멤버가 필요
    if (members.length < 2) return null

    const totalSpending = members.reduce((sum, member) => sum + member.amount, 0)

    // 첫 번째와 두 번째 멤버 (사용자가 설정한 이름 사용)
    const firstMember = members[0]
    const secondMember = members[1]

    // 지출이 0일 때 처리
    if (totalSpending === 0) {
        return (
            <Card className={`bg-white rounded-3xl p-6 shadow-sm border-0 ${className || ''}`}>
                <h2 className="text-base font-semibold text-gray-900 mb-6">멤버별 지출 비교</h2>
                <p className="text-center text-gray-400 py-8">이번 달 지출 데이터가 없습니다</p>
            </Card>
        )
    }

    const firstMemberPercentage = (firstMember.amount / totalSpending) * 100
    const secondMemberPercentage = (secondMember.amount / totalSpending) * 100

    return (
        <Card className={`bg-white rounded-3xl p-6 shadow-sm border-0 ${className || ''}`}>
            <h2 className="text-base font-semibold text-gray-900 mb-6">멤버별 지출 비교</h2>

            {/* Member Info Row */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                        style={{ backgroundColor: firstMember.bgColor }}
                    >
                        {firstMember.avatar}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{firstMember.name}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{secondMember.name}</span>
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                        style={{ backgroundColor: secondMember.bgColor }}
                    >
                        {secondMember.avatar}
                    </div>
                </div>
            </div>

            {/* Single Comparison Bar */}
            <div className="relative h-12 bg-gray-100 rounded-2xl overflow-hidden mb-3">
                {/* Husband Side - Left */}
                <div
                    className="absolute left-0 top-0 h-full transition-all duration-700 ease-out"
                    style={{
                        width: `${firstMemberPercentage}%`,
                        backgroundColor: firstMember.color,
                    }}
                />

                {/* Wife Side - Right */}
                <div
                    className="absolute right-0 top-0 h-full transition-all duration-700 ease-out"
                    style={{
                        width: `${secondMemberPercentage}%`,
                        backgroundColor: secondMember.color,
                    }}
                />

                {/* Center Divider & Percentage */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-md border border-gray-200/50">
                        <span className="text-sm font-bold text-gray-900">
                            {firstMemberPercentage.toFixed(0)}% : {secondMemberPercentage.toFixed(0)}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Amount Details */}
            <div className="flex items-center justify-between text-xs text-gray-500">
                <span>₩{firstMember.amount.toLocaleString()}</span>
                <span>₩{secondMember.amount.toLocaleString()}</span>
            </div>
        </Card>
    )
}
