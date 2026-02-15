"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

interface CalendarDatePickerProps {
    selectedDate: Date
    onDateSelect: (date: Date) => void
    onClose: () => void
}

export function CalendarDatePicker({ selectedDate, onDateSelect, onClose }: CalendarDatePickerProps) {
    const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth())
    const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear())

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 요일 헤더
    const weekDays = ['일', '월', '화', '수', '목', '금', '토']

    // 월의 첫 날이 무슨 요일인지 (0=일요일)
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()

    // 현재 월의 총 일수
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

    // 이전 월의 총 일수
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate()

    // 캘린더 그리드 생성 (42일 = 6주)
    const calendarDays: Array<{
        date: number
        month: 'prev' | 'current' | 'next'
        fullDate: Date
    }> = []

    // 이전 달 날짜들
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        const date = prevMonthDays - i
        calendarDays.push({
            date,
            month: 'prev',
            fullDate: new Date(currentYear, currentMonth - 1, date)
        })
    }

    // 현재 달 날짜들
    for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push({
            date: i,
            month: 'current',
            fullDate: new Date(currentYear, currentMonth, i)
        })
    }

    // 다음 달 날짜들 (42일 채우기)
    const remainingDays = 42 - calendarDays.length
    for (let i = 1; i <= remainingDays; i++) {
        calendarDays.push({
            date: i,
            month: 'next',
            fullDate: new Date(currentYear, currentMonth + 1, i)
        })
    }

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11)
            setCurrentYear(currentYear - 1)
        } else {
            setCurrentMonth(currentMonth - 1)
        }
    }

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0)
            setCurrentYear(currentYear + 1)
        } else {
            setCurrentMonth(currentMonth + 1)
        }
    }

    const handleDateClick = (day: typeof calendarDays[0]) => {
        if (day.month === 'prev') {
            handlePrevMonth()
            onDateSelect(day.fullDate)
        } else if (day.month === 'next') {
            handleNextMonth()
            onDateSelect(day.fullDate)
        } else {
            onDateSelect(day.fullDate)
        }
    }

    const isSameDay = (date1: Date, date2: Date) => {
        return date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
    }

    const isToday = (date: Date) => {
        return isSameDay(date, today)
    }

    const isSelected = (date: Date) => {
        return isSameDay(date, selectedDate)
    }

    return (
        <div className="fixed inset-0 z-50">
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[2rem] p-6 pb-10 max-w-md mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">날짜 선택</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
                    >
                        <X className="w-4 h-4 text-gray-500" />
                    </button>
                </div>

                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={handlePrevMonth}
                        className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <span className="text-base font-semibold text-gray-900">
                        {currentYear}년 {currentMonth + 1}월
                    </span>
                    <button
                        onClick={handleNextMonth}
                        className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-700" />
                    </button>
                </div>

                {/* Week Days Header */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekDays.map((day, index) => (
                        <div
                            key={day}
                            className={`text-center text-xs font-medium py-2 ${index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-500'
                                }`}
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, index) => {
                        const dayIsToday = isToday(day.fullDate)
                        const dayIsSelected = isSelected(day.fullDate)
                        const isCurrentMonth = day.month === 'current'

                        return (
                            <button
                                key={index}
                                onClick={() => handleDateClick(day)}
                                className={`
                                    aspect-square rounded-xl flex items-center justify-center text-sm font-medium
                                    transition-all duration-200 active:scale-95
                                    ${dayIsSelected
                                        ? 'bg-[#0047AB] text-white shadow-md'
                                        : dayIsToday
                                            ? 'bg-blue-50 text-[#0047AB] border-2 border-[#0047AB]'
                                            : isCurrentMonth
                                                ? 'text-gray-900 hover:bg-gray-100'
                                                : 'text-gray-400 hover:bg-gray-50'
                                    }
                                `}
                            >
                                {day.date}
                            </button>
                        )
                    })}
                </div>

                <button
                    onClick={onClose}
                    className="w-full mt-6 py-4 bg-[#0047AB] text-white rounded-2xl font-semibold active:scale-[0.98] transition-transform"
                >
                    완료
                </button>
            </div>
        </div>
    )
}
