"use client"

interface IncomeRatioCardProps {
    income: number
    expense: number
    savings: number
    investment: number
}

const TYPES = [
    { key: 'expense' as const, label: '지출', color: '#ef4444', bgColor: 'bg-red-50', textColor: 'text-red-600' },
    { key: 'savings' as const, label: '저축', color: '#3b82f6', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
    { key: 'investment' as const, label: '투자', color: '#8b5cf6', bgColor: 'bg-purple-50', textColor: 'text-purple-600' },
] as const

export function IncomeRatioCard({ income, expense, savings, investment }: IncomeRatioCardProps) {
    const noIncome = income === 0

    const pct = (val: number) => noIncome || income === 0 ? 0 : Math.round((val / income) * 100)

    const expensePct = pct(expense)
    const savingsPct = pct(savings)
    const investmentPct = pct(investment)
    const unusedPct = Math.max(0, 100 - expensePct - savingsPct - investmentPct)

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm mx-5 mb-6">
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-500">이번 달 수입 배분</p>
                {noIncome && <span className="text-xs text-gray-400">수입 내역을 추가해주세요</span>}
            </div>

            {/* Income Total */}
            <div className="mb-4">
                <span className="text-xs text-gray-400">총 수입</span>
                <p className="text-2xl font-bold text-gray-900 tracking-tight">
                    ₩{income.toLocaleString()}
                </p>
            </div>

            {/* Stacked bar */}
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex mb-4">
                {!noIncome && (
                    <>
                        <div className="bg-red-400 h-full transition-all" style={{ width: `${expensePct}%` }} />
                        <div className="bg-blue-400 h-full transition-all" style={{ width: `${savingsPct}%` }} />
                        <div className="bg-purple-400 h-full transition-all" style={{ width: `${investmentPct}%` }} />
                        <div className="bg-gray-200 h-full transition-all" style={{ width: `${unusedPct}%` }} />
                    </>
                )}
            </div>

            {/* Legend rows */}
            <div className="space-y-2">
                {TYPES.map(({ key, label, bgColor, textColor }) => {
                    const val = key === 'expense' ? expense : key === 'savings' ? savings : investment
                    const p = pct(val)
                    return (
                        <div key={key} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${bgColor} ${textColor}`}>
                                    {label[0]}
                                </span>
                                <span className="text-sm text-gray-700">{label}</span>
                            </div>
                            <div className="text-right">
                                <span className={`text-sm font-semibold ${textColor}`}>
                                    {p}%
                                </span>
                                <span className="text-xs text-gray-400 ml-1">
                                    ₩{val.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    )
                })}
                {!noIncome && unusedPct > 0 && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">여</span>
                            <span className="text-sm text-gray-400">여유</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-400">{unusedPct}%</span>
                    </div>
                )}
            </div>
        </div>
    )
}
