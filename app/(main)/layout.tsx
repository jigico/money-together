"use client"

import { usePathname } from "next/navigation"
import { BottomNavigation } from "@/components/dashboard/bottom-navigation"

export default function MainLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const hideNavigation = pathname === "/add"

    return (
        <>
            {children}
            {!hideNavigation && <BottomNavigation />}
        </>
    )
}
