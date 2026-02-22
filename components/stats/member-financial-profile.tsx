"use client"

import { Card } from "@/components/ui/card"
import type { MemberFinancialSummary } from "@/lib/supabase/queries"

interface MemberFinancialProfileProps {
    members: MemberFinancialSummary[]
    className?: string
}

function pct(value: number, base: number) {
    if (base <= 0) return 0
    return Math.min((value / base) * 100, 100)
}

export function MemberFinancialProfile({ members, className }: MemberFinancialProfileProps) {
    if (members.length === 0) return null

    // 모든 멤버 중 수입이 가장 많은 값 → 막대 길이 기준
    const maxIncome = Math.max(...members.map((m) => m.income), 1)

    return (
        <Card className={`bg-white rounded-3xl p-6 shadow-sm border-0 ${className || ''}`}>
            <h2 className="text-base font-semibold text-gray-900 mb-5">멤버별 재무 현황</h2>

            <div className="space-y-6">
                {members.map((member) => {
                    const hasData = member.income > 0 || member.expense > 0 || member.savings > 0 || member.investment > 0
                    if (!hasData) return null

                    // 막대 전체 길이를 그룹 최대 수입 대비 비율로
                    const barWidth = pct(Math.max(member.income, member.expense + member.savings + member.investment), maxIncome)

                    // 수입이 있으면 수입 100% 기준, 없으면 지출 합산 기준으로 비율 계산
                    const base = member.income > 0 ? member.income : (member.expense + member.savings + member.investment)
                    const expensePct = pct(member.expense, base)
                    const savingsPct = pct(member.savings, base)
                    const investmentPct = pct(member.investment, base)
                    const remainPct = Math.max(100 - expensePct - savingsPct - investmentPct, 0)

                    return (
                        <div key={member.memberId}>
                            {/* 멤버 헤더 */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                        style={{ backgroundColor: member.memberBgColor }}
                                    >
                                        {member.memberAvatar}
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900">{member.memberName}</span>
                                </div>
                                {member.income > 0 && (
                                    <span className="text-xs text-gray-400">
                                        수입 <span className="font-semibold text-gray-700">₩{member.income.toLocaleString()}</span>
                                    </span>
                                )}
                            </div>

                            {/* 가로 누적 막대 */}
                            <div className="h-9 bg-gray-100 rounded-2xl overflow-hidden mb-3" style={{ position: 'relative' }}>
                                <div
                                    className="h-full flex rounded-2xl overflow-hidden transition-all duration-700 ease-out"
                                    style={{ width: `${barWidth}%` }}
                                >
                                    {/* 지출 */}
                                    {member.expense > 0 && (
                                        <div
                                            className="h-full"
                                            style={{ width: `${expensePct}%`, backgroundColor: '#EF4444' }}
                                            title={`지출 ₩${member.expense.toLocaleString()}`}
                                        />
                                    )}
                                    {/* 저축 */}
                                    {member.savings > 0 && (
                                        <div
                                            className="h-full"
                                            style={{ width: `${savingsPct}%`, backgroundColor: '#3B82F6' }}
                                            title={`저축 ₩${member.savings.toLocaleString()}`}
                                        />
                                    )}
                                    {/* 투자 */}
                                    {member.investment > 0 && (
                                        <div
                                            className="h-full"
                                            style={{ width: `${investmentPct}%`, backgroundColor: '#A855F7' }}
                                            title={`투자 ₩${member.investment.toLocaleString()}`}
                                        />
                                    )}
                                    {/* 잔여 (저축 가능 여력) */}
                                    {remainPct > 0 && (
                                        <div
                                            className="h-full"
                                            style={{ width: `${remainPct}%`, backgroundColor: '#E5E7EB' }}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* 범례 + 수치 */}
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
                                {member.expense > 0 && (
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" />
                                        <span className="text-xs text-gray-500">
                                            지출{' '}
                                            <span className="font-semibold text-gray-800">
                                                {member.income > 0 ? `${expensePct.toFixed(0)}%` : `₩${member.expense.toLocaleString()}`}
                                            </span>
                                        </span>
                                    </div>
                                )}
                                {member.savings > 0 && (
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0" />
                                        <span className="text-xs text-gray-500">
                                            저축{' '}
                                            <span className="font-semibold text-gray-800">
                                                {member.income > 0 ? `${savingsPct.toFixed(0)}%` : `₩${member.savings.toLocaleString()}`}
                                            </span>
                                        </span>
                                    </div>
                                )}
                                {member.investment > 0 && (
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-purple-500 flex-shrink-0" />
                                        <span className="text-xs text-gray-500">
                                            투자{' '}
                                            <span className="font-semibold text-gray-800">
                                                {member.income > 0 ? `${investmentPct.toFixed(0)}%` : `₩${member.investment.toLocaleString()}`}
                                            </span>
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* 상위 지출 카테고리 */}
                            {member.topCategories.length > 0 && (
                                <div className="bg-gray-50 rounded-2xl p-3 space-y-2">
                                    <p className="text-[11px] text-gray-400 font-medium mb-1">상위 지출</p>
                                    {member.topCategories.map((cat) => (
                                        <div key={cat.name} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                                    style={{ backgroundColor: cat.color }}
                                                />
                                                <span className="text-xs text-gray-600">{cat.name}</span>
                                            </div>
                                            <span className="text-xs font-semibold text-gray-800">
                                                ₩{cat.amount.toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* 범례 안내 */}
            <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap gap-x-4 gap-y-1">
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /><span className="text-[11px] text-gray-400">지출</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /><span className="text-[11px] text-gray-400">저축</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-purple-500" /><span className="text-[11px] text-gray-400">투자</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-gray-200" /><span className="text-[11px] text-gray-400">잔여</span></div>
            </div>
        </Card>
    )
}
