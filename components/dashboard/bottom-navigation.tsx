"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, TrendingUp, Receipt, User } from "lucide-react"

interface NavItem {
    icon: React.ComponentType<{ className?: string }>
    label: string
    href: string
}

interface BottomNavigationProps {
    className?: string
}

export function BottomNavigation({ className }: BottomNavigationProps) {
    const pathname = usePathname()

    const navItems: NavItem[] = [
        { icon: Home, label: '홈', href: '/' },
        { icon: TrendingUp, label: '통계', href: '/stats' },
        { icon: Receipt, label: '내역', href: '/history' },
        { icon: User, label: '마이', href: '/profile' },
    ]

    return (
        <div
            className={`fixed bottom-0 left-0 right-0 border-t px-6 pb-safe ${className || ''}`}
            style={{
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderTopColor: 'rgba(229, 231, 235, 0.5)',
            }}
        >
            <div className="flex items-center justify-around h-20">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="flex flex-col items-center gap-1 group"
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center group-active:scale-95 transition-transform ${isActive ? 'bg-primary/10' : ''
                                }`}>
                                <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                            </div>
                            <span className={`text-[11px] font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
