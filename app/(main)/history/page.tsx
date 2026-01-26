"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Plus, CreditCard, Home, TrendingUp, User } from "lucide-react"
import Link from "next/link"
import { getTransactions } from "@/lib/supabase/queries"
import type { TransactionUI } from "@/types/database"
import { Utensils, Car, Coffee, ShoppingBag, Home as HomeIcon, MoreHorizontal, Heart, Gamepad2, Plane } from "lucide-react"

const iconMap: Record<string, any> = {
    '식비': Utensils,
    '교통': Car,
    '카페': Coffee,
    '쇼핑': ShoppingBag,
    '주거': HomeIcon,
    '건강': Heart,
    '여가': Gamepad2,
    '여행': Plane,
    '기타': MoreHorizontal,
}

const colorMap: Record<string, string> = {
    '식비': 'bg-orange-100 text-orange-600',
    '교통': 'bg-blue-100 text-blue-600',
    '카페': 'bg-amber-100 text-amber-700',
    '쇼핑': 'bg-pink-100 text-pink-600',
    '주거': 'bg-green-100 text-green-600',
    '건강': 'bg-red-100 text-red-600',
    '여가': 'bg-purple-100 text-purple-600',
    '여행': 'bg-cyan-100 text-cyan-600',
    '기타': 'bg-gray-100 text-gray-600',
}

function getDayOfWeek(dateStr: string): string {
    const days = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"]
    const date = new Date(dateStr)
    return days[date.getDay()]
}

function formatDateHeader(dateStr: string): string {
    const date = new Date(dateStr)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const dayOfWeek = getDayOfWeek(dateStr)
    return `${month}월 ${day}일 ${dayOfWeek}`
}

interface GroupedTransaction {
    date: string
    items: TransactionUI[]
    total: number
}

function groupByDate(transactions: TransactionUI[]): GroupedTransaction[] {
    const groups: Record<string, TransactionUI[]> = {}

    transactions.forEach((transaction) => {
        const dateKey = transaction.rawDate || new Date().toISOString().split('T')[0]
        if (!groups[dateKey]) {
            groups[dateKey] = []
        }
        groups[dateKey].push(transaction)
    })

    return Object.entries(groups)
        .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
        .map(([date, items]) => ({
            date,
            items,
            total: items.reduce((sum, item) => sum + item.amount, 0)
        }))
}

export default function HistoryPage() {
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
    const [transactions, setTransactions] = useState<TransactionUI[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            try {
                const startOfMonth = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0]
                const endOfMonth = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0]

                const data = await getTransactions(startOfMonth, endOfMonth)
                setTransactions(data)
            } catch (error) {
                console.error('Error fetching transactions:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [currentYear, currentMonth])

    const goToPrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11)
            setCurrentYear(currentYear - 1)
        } else {
            setCurrentMonth(currentMonth - 1)
        }
    }

    const goToNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0)
            setCurrentYear(currentYear + 1)
        } else {
            setCurrentMonth(currentMonth + 1)
        }
    }

    const groupedTransactions = groupByDate(transactions)
    const months = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"]

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center pb-24">
                <div className="text-gray-500">데이터를 불러오는 중...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F5F5F7] pb-24">
            {/* Header with Month Navigation */}
            <div className="sticky top-0 z-40 bg-[#F5F5F7]/80 backdrop-blur-xl border-b border-gray-200/30">
                <div className="px-5 pt-12 pb-3 flex items-center justify-between">
                    <button
                        onClick={goToPrevMonth}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white active:scale-95 transition-all"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-500" />
                    </button>

                    <button className="flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-white active:scale-95 transition-all">
                        <span className="text-base font-semibold text-gray-900 tracking-tight">
                            {currentYear}년 {months[currentMonth]}
                        </span>
                    </button>

                    <button
                        onClick={goToNextMonth}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white active:scale-95 transition-all"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
            </div>

            {/* Transaction List */}
            <div className="px-5 pt-4">
                {groupedTransactions.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-sm">이번 달 거래 내역이 없습니다</p>
                    </div>
                ) : (
                    groupedTransactions.map(({ date, items, total }) => (
                        <div key={date} className="mb-6">
                            {/* Date Header */}
                            <div className="sticky top-[72px] z-30 bg-[#F5F5F7]/90 backdrop-blur-sm py-2 -mx-5 px-5">
                                <p className="text-sm font-medium text-gray-500">
                                    {formatDateHeader(date)}
                                </p>
                            </div>

                            {/* Items */}
                            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                                {items.map((item, index) => {
                                    const Icon = iconMap[item.category] || MoreHorizontal
                                    const colorClass = colorMap[item.category] || 'bg-gray-100 text-gray-600'

                                    return (
                                        <div
                                            key={item.id}
                                            className={`px-4 py-4 flex items-center gap-4 active:bg-gray-50 transition-colors ${index !== items.length - 1 ? "border-b border-gray-100" : ""
                                                }`}
                                        >
                                            {/* Category Icon */}
                                            <div className={`w-11 h-11 rounded-full ${colorClass} flex items-center justify-center flex-shrink-0`}>
                                                <Icon className="w-5 h-5" />
                                            </div>

                                            {/* Description */}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 text-[15px] truncate">
                                                    {item.category}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {item.date}
                                                </p>
                                            </div>

                                            {/* Amount */}
                                            <p className="font-bold text-gray-900 text-base flex-shrink-0">
                                                {item.amount.toLocaleString()}원
                                            </p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Floating Action Button */}
            <Link
                href="/add"
                className="fixed bottom-24 right-5 z-50 w-14 h-14 bg-[#0047AB] text-white rounded-2xl shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
            >
                <Plus className="w-6 h-6" />
            </Link>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-200/50 px-6 pb-safe">
                <div className="flex items-center justify-around h-20">
                    <Link href="/" className="flex flex-col items-center gap-1 group">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center group-active:scale-95 transition-transform">
                            <Home className="w-5 h-5 text-gray-400" />
                        </div>
                        <span className="text-[11px] font-medium text-gray-400">홈</span>
                    </Link>
                    <Link href="/stats" className="flex flex-col items-center gap-1 group">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center group-active:scale-95 transition-transform">
                            <TrendingUp className="w-5 h-5 text-gray-400" />
                        </div>
                        <span className="text-[11px] font-medium text-gray-400">통계</span>
                    </Link>
                    <Link href="/history" className="flex flex-col items-center gap-1 group">
                        <div className="w-10 h-10 rounded-xl bg-[#0047AB]/10 flex items-center justify-center group-active:scale-95 transition-transform">
                            <CreditCard className="w-5 h-5 text-[#0047AB]" />
                        </div>
                        <span className="text-[11px] font-medium text-[#0047AB]">내역</span>
                    </Link>
                    <button className="flex flex-col items-center gap-1 group">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center group-active:scale-95 transition-transform">
                            <User className="w-5 h-5 text-gray-400" />
                        </div>
                        <span className="text-[11px] font-medium text-gray-400">마이</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
