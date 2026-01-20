"use client"

import { Plus } from "lucide-react"
import Link from "next/link"

interface FloatingActionButtonProps {
    href?: string
    className?: string
}

export function FloatingActionButton({ href = "/add", className }: FloatingActionButtonProps) {
    return (
        <Link
            href={href}
            className={`fixed bottom-24 right-5 w-14 h-14 bg-primary text-primary-foreground rounded-2xl shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform ${className || ''}`}
        >
            <Plus className="w-6 h-6" />
        </Link>
    )
}
