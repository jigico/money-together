"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"

export interface Transaction {
    id: number | string
    category: string
    icon: string
    amount: number
    date: string
    color: string
}

interface TransactionListProps {
    transactions: Transaction[]
    className?: string
}

export function TransactionList({ transactions, className }: TransactionListProps) {
    // 현재 날짜 정보
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1 // 0-11이므로 +1

    return (
        <div className={className}>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">최근 내역</h2>
                <Link href={`/history?year=${currentYear}&month=${currentMonth}`} className="text-sm text-[#0047AB] font-medium">
                    전체보기
                </Link>
            </div>

            <Card className="bg-white rounded-3xl shadow-sm border-0 overflow-hidden">
                <div className="divide-y divide-gray-100">
                    {transactions.map((transaction, index) => (
                        <div
                            key={transaction.id}
                            className={`px-5 py-4 flex items-center justify-between ${index === 0 ? 'pt-5' : ''
                                } ${index === transactions.length - 1 ? 'pb-5' : ''}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-11 h-11 rounded-2xl ${transaction.color} flex items-center justify-center text-xl`}>
                                    {transaction.icon}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 text-[15px]">{transaction.category}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{transaction.date}</p>
                                </div>
                            </div>
                            <p className="text-base font-bold text-gray-900">
                                -₩{transaction.amount.toLocaleString()}
                            </p>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    )
}
