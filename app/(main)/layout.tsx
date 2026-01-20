"use client"

import { BottomNavigation } from "@/components/dashboard/bottom-navigation"

export default function MainLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            {children}
            <BottomNavigation />
        </>
    )
}
