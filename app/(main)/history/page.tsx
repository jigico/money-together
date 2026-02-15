"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Plus, CreditCard, Home, TrendingUp, User, Calendar, List } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { getTransactions } from "@/lib/supabase/queries"
import type { TransactionUI } from "@/types/database"
import { Utensils, Car, Coffee, ShoppingBasket, Home as HomeIcon, Hospital, MoreHorizontal, Heart, Gamepad2, Plane, Shirt, Theater, Hotel, Gift, GraduationCap, Baby } from "lucide-react"

const iconMap: Record<string, any> = {
    '식비': Utensils,
    '교통': Car,
    '카페': Coffee,
    '생활': ShoppingBasket,
    '주거': HomeIcon,
    '병원': Hospital,
    '건강': Heart,
    '여가': Gamepad2,
    '여행': Plane,
    '의복/미용': Shirt,
    '자동차': Car,
    '문화/여가': Theater,
    '여행/숙박': Hotel,
    '경조사': Gift,
    '교육': GraduationCap,
    '육아': Baby,
    '선물': Gift,
    '기타': MoreHorizontal,
}

const colorMap: Record<string, string> = {
    '식비': 'bg-orange-100 text-orange-600',
    '교통': 'bg-blue-100 text-blue-600',
    '카페': 'bg-amber-100 text-amber-700',
    '생활': 'bg-purple-100 text-purple-600',
    '주거': 'bg-green-100 text-green-600',
    '병원': 'bg-pink-100 text-pink-600',
    '건강': 'bg-red-100 text-red-600',
    '여가': 'bg-indigo-100 text-indigo-600',
    '여행': 'bg-cyan-100 text-cyan-600',
    '의복/미용': 'bg-pink-100 text-pink-600',
    '자동차': 'bg-blue-100 text-blue-600',
    '문화/여가': 'bg-purple-100 text-purple-600',
    '여행/숙박': 'bg-cyan-100 text-cyan-600',
    '경조사': 'bg-amber-100 text-amber-600',
    '교육': 'bg-green-100 text-green-600',
    '육아': 'bg-yellow-100 text-yellow-600',
    '선물': 'bg-pink-100 text-pink-600',
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

// 날짜별 지출 합계 계산
function getDailySpending(transactions: TransactionUI[]): Record<string, number> {
    const dailySpending: Record<string, number> = {}

    transactions.forEach((tx) => {
        const dateKey = tx.rawDate
        if (!dailySpending[dateKey]) {
            dailySpending[dateKey] = 0
        }
        dailySpending[dateKey] += tx.amount
    })

    return dailySpending
}

// 타임라인 생성 함수 (현재+2년부터 과거로)
function generateTimeline() {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1 // 1-12
    const endYear = currentYear + 2
    const startYear = 2020 // 시작 년도

    const timeline: { year: number, month: number, label: string }[] = []

    // 종료 년월부터 시작 년월까지 역순으로
    for (let year = endYear; year >= startYear; year--) {
        // 각 년도의 시작 월과 끝 월 결정
        let monthStart = 12
        let monthEnd = 1

        // 미래 년도(endYear)는 현재 월까지만
        if (year === endYear) {
            monthStart = currentMonth
        }

        // 현재 년도는 12월까지
        if (year === currentYear) {
            monthStart = 12
        }

        for (let month = monthStart; month >= monthEnd; month--) {
            timeline.push({
                year,
                month,
                label: `${year}년 ${month}월`
            })
        }
    }

    return timeline
}

export default function HistoryPage() {
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
    const [isTimelineOpen, setIsTimelineOpen] = useState(false)
    const [transactions, setTransactions] = useState<TransactionUI[]>([])
    const [loading, setLoading] = useState(true)
    const [viewType, setViewType] = useState<'list' | 'calendar'>('list')
    const [selectedDate, setSelectedDate] = useState<string | null>(null)

    // Scroll to selected date when timeline opens
    useEffect(() => {
        if (isTimelineOpen) {
            setTimeout(() => {
                const selectedElement = document.getElementById('selected-date')
                if (selectedElement) {
                    selectedElement.scrollIntoView({ block: 'center', behavior: 'smooth' })
                }
            }, 100)
        }
    }, [isTimelineOpen])

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

    const selectDate = (year: number, month: number) => {
        setCurrentYear(year)
        setCurrentMonth(month - 1) // month는 1-12, currentMonth는 0-11
        setIsTimelineOpen(false)
    }

    const groupedTransactions = groupByDate(transactions)
    const months = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"]
    const timeline = generateTimeline()

    // Calculate total amount from all transactions
    const totalAmount = transactions.reduce((sum, transaction) => sum + transaction.amount, 0)

    // Animated Counter Component
    const AnimatedCounter = ({ value }: { value: number }) => {
        const [displayValue, setDisplayValue] = useState(0)

        useEffect(() => {
            const duration = 800 // ms
            const steps = 60
            const stepValue = value / steps
            const stepDuration = duration / steps
            let currentStep = 0

            const timer = setInterval(() => {
                currentStep++
                if (currentStep <= steps) {
                    setDisplayValue(Math.floor(stepValue * currentStep))
                } else {
                    setDisplayValue(value)
                    clearInterval(timer)
                }
            }, stepDuration)

            return () => clearInterval(timer)
        }, [value])

        return <>{displayValue.toLocaleString()}</>
    }

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

                    <button
                        onClick={() => setIsTimelineOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white active:scale-95 transition-all"
                    >
                        <Calendar className="w-4 h-4 text-gray-400" />
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

            {/* Total Spending Summary */}
            <div className="px-5 pt-6 pb-2">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
                >
                    <p className="text-sm text-gray-500 mb-2 font-medium">이번 달 총 지출</p>
                    <p className="text-3xl font-bold text-[#0047AB] tracking-tight">
                        <AnimatedCounter value={totalAmount} />원
                    </p>
                </motion.div>

                {/* View Toggle Button */}
                <div className="flex justify-end mt-3">
                    <button
                        onClick={() => setViewType(viewType === 'list' ? 'calendar' : 'list')}
                        className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-gray-100/50 active:scale-95 transition-transform hover:bg-gray-50"
                    >
                        {viewType === 'list' ? (
                            <Calendar className="w-5 h-5 text-gray-600" />
                        ) : (
                            <List className="w-5 h-5 text-gray-600" />
                        )}
                    </button>
                </div>
            </div>

            {/* Content Area - List or Calendar View */}
            <div className="px-5 pt-4">
                {viewType === 'list' ? (
                    // List View (existing)
                    groupedTransactions.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-gray-400 text-sm">이번 달 거래 내역이 없습니다</p>
                        </div>
                    ) : (
                        groupedTransactions.map(({ date, items, total }) => (
                            <div key={date} className="mb-6">
                                {/* Date Header */}
                                <div className="sticky top-[72px] bg-[#F5F5F7]/90 backdrop-blur-sm py-2 -mx-5 px-5">
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
                                            <Link
                                                key={item.id}
                                                href={`/history/${item.id}`}
                                                className={`px-4 py-4 flex items-center gap-4 active:bg-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer ${index !== items.length - 1 ? "border-b border-gray-100" : ""
                                                    }`}
                                            >
                                                {/* Category Icon */}
                                                <div className={`w-11 h-11 rounded-full ${colorClass} flex items-center justify-center flex-shrink-0`}>
                                                    <Icon className="w-5 h-5" />
                                                </div>

                                                {/* Description */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 text-[15px] truncate flex items-center gap-1">
                                                        <span>{item.category}</span>
                                                        <span className="text-xs text-gray-400">· {item.memberName}</span>
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                                                        {item.description}
                                                    </p>
                                                </div>

                                                {/* Amount */}
                                                <p className="font-bold text-gray-900 text-base flex-shrink-0">
                                                    {item.amount.toLocaleString()}원
                                                </p>
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>
                        ))
                    )
                ) : (
                    // Calendar View
                    <div className="pb-4">
                        {/* Week Days Header */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
                                <div key={day} className={`text-center text-xs font-medium py-2 ${idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : 'text-gray-500'
                                    }`}>
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1">
                            {(() => {
                                const dailySpending = getDailySpending(transactions)
                                const firstDay = new Date(currentYear, currentMonth, 1).getDay()
                                const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
                                const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate()
                                const calendarDays = []

                                // Previous month days
                                for (let i = firstDay - 1; i >= 0; i--) {
                                    const date = prevMonthDays - i
                                    calendarDays.push({
                                        date,
                                        month: 'prev',
                                        fullDate: new Date(currentYear, currentMonth - 1, date),
                                        dateKey: '',
                                        spending: 0
                                    })
                                }

                                // Current month days
                                for (let i = 1; i <= daysInMonth; i++) {
                                    const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
                                    calendarDays.push({
                                        date: i,
                                        month: 'current',
                                        fullDate: new Date(currentYear, currentMonth, i),
                                        dateKey,
                                        spending: dailySpending[dateKey] || 0
                                    })
                                }

                                // Next month days
                                const remainingDays = 42 - calendarDays.length
                                for (let i = 1; i <= remainingDays; i++) {
                                    calendarDays.push({
                                        date: i,
                                        month: 'next',
                                        fullDate: new Date(currentYear, currentMonth + 1, i),
                                        dateKey: '',
                                        spending: 0
                                    })
                                }

                                return calendarDays.map((day, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => day.month === 'current' && day.spending > 0 && setSelectedDate(day.dateKey)}
                                        className={`
                                            aspect-square p-2 rounded-lg flex flex-col items-center justify-center
                                            ${day.month === 'current' ? 'bg-white' : 'bg-transparent'}
                                            ${day.spending > 0 ? 'cursor-pointer hover:ring-2 ring-[#0047AB]' : ''}
                                            transition-all
                                        `}
                                    >
                                        <div className={`text-sm font-medium ${day.month === 'current' ? 'text-gray-900' : 'text-gray-400'
                                            }`}>
                                            {day.date}
                                        </div>
                                        {day.spending > 0 && (
                                            <div className="text-[10px] font-semibold text-red-500 mt-1">
                                                -{day.spending.toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                ))
                            })()}
                        </div>
                    </div>
                )}
            </div>

            {/* Unified Timeline Scroll Modal */}
            <AnimatePresence>
                {isTimelineOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
                            onClick={() => setIsTimelineOpen(false)}
                        />

                        {/* Timeline Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto"
                        >
                            <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
                                {/* Header */}
                                <div className="px-6 py-4 border-b border-gray-200/50">
                                    <h2 className="text-lg font-semibold text-gray-900">날짜 선택</h2>
                                </div>

                                {/* Scrollable Timeline */}
                                <div className="max-h-[400px] overflow-y-auto overscroll-contain">
                                    <div className="px-3 py-2">
                                        {timeline.map((item, index) => {
                                            const isSelected = item.year === currentYear && item.month === currentMonth + 1
                                            return (
                                                <motion.button
                                                    key={`${item.year}-${item.month}`}
                                                    id={isSelected ? 'selected-date' : undefined}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.005 }}
                                                    onClick={() => selectDate(item.year, item.month)}
                                                    className={`w-full text-left px-5 py-3.5 mb-1 rounded-xl transition-all duration-200 active:scale-[0.98] ${isSelected
                                                        ? 'bg-[#0047AB] text-white shadow-lg shadow-blue-900/25'
                                                        : 'hover:bg-gray-100 text-gray-700'
                                                        }`}
                                                >
                                                    <span className={`text-[15px] font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                                        {item.label}
                                                    </span>
                                                </motion.button>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Floating Action Button */}
            <Link
                href="/add"
                className="fixed bottom-24 right-5 z-50 w-14 h-14 bg-[#0047AB] text-white rounded-2xl shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
            >
                <Plus className="w-6 h-6" />
            </Link>

            {/* Date Detail Modal for Calendar View */}
            {selectedDate && (
                <div className="fixed inset-0 z-50 flex items-end">
                    <div
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                        onClick={() => setSelectedDate(null)}
                    />

                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        className="relative bg-white rounded-t-3xl p-6 w-full max-w-md mx-auto max-h-[70vh] overflow-auto"
                    >
                        <h3 className="text-lg font-semibold mb-4 text-gray-900">
                            {formatDateHeader(selectedDate)}
                        </h3>

                        {/* Transaction items for selected date */}
                        <div className="space-y-3">
                            {transactions
                                .filter(tx => tx.rawDate === selectedDate)
                                .map(item => {
                                    const Icon = iconMap[item.category] || MoreHorizontal
                                    const colorClass = colorMap[item.category] || 'bg-gray-100 text-gray-600'

                                    return (
                                        <Link
                                            key={item.id}
                                            href={`/history/${item.id}`}
                                            className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                                        >
                                            <div className={`w-11 h-11 rounded-full ${colorClass} flex items-center justify-center flex-shrink-0`}>
                                                <Icon className="w-5 h-5" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 text-[15px] truncate flex items-center gap-1">
                                                    <span>{item.category}</span>
                                                    <span className="text-xs text-gray-400">· {item.memberName}</span>
                                                </p>
                                                <p className="text-sm text-gray-500 truncate">{item.description}</p>
                                            </div>

                                            <p className="font-bold text-gray-900 text-base flex-shrink-0">
                                                {item.amount.toLocaleString()}원
                                            </p>
                                        </Link>
                                    )
                                })}
                        </div>
                    </motion.div>
                </div>
            )}

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
                    <Link href="/profile" className="flex flex-col items-center gap-1 group">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center group-active:scale-95 transition-transform">
                            <User className="w-5 h-5 text-gray-400" />
                        </div>
                        <span className="text-[11px] font-medium text-gray-400">마이</span>
                    </Link>
                </div>
            </div>
        </div>
    )
}
