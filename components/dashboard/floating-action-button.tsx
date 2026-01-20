"use client"

import { Plus } from "lucide-react"

interface FloatingActionButtonProps {
    onClick?: () => void
    className?: string
}

export function FloatingActionButton({ onClick, className }: FloatingActionButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`fixed bottom-24 right-5 w-14 h-14 bg-primary text-primary-foreground rounded-2xl shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform ${className || ''}`}
        >
            <Plus className="w-6 h-6" />
        </button>
    )
}
