"use client"

import { Card } from "@/components/ui/card"

export interface Transaction {
    id: number
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
    return (
        <div className={className}>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">최근 내역</h2>
                <button className="text-sm text-primary font-medium">전체보기</button>
            </div>

            <Card className="bg-card rounded-3xl shadow-sm border-0 overflow-hidden">
                <div className="divide-y divide-border/30">
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
                                    <p className="font-semibold text-foreground text-[15px]">{transaction.category}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{transaction.date}</p>
                                </div>
                            </div>
                            <p className="text-base font-bold text-foreground">
                                -₩{transaction.amount.toLocaleString()}
                            </p>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    )
}
