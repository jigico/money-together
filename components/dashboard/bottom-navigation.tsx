"use client"

import { Home, TrendingUp, CreditCard, User } from "lucide-react"

interface NavItem {
    icon: React.ComponentType<{ className?: string }>
    label: string
    isActive?: boolean
    onClick?: () => void
}

interface BottomNavigationProps {
    activeTab?: string
    onTabChange?: (tab: string) => void
    className?: string
}

export function BottomNavigation({ activeTab = 'home', onTabChange, className }: BottomNavigationProps) {
    const navItems: NavItem[] = [
        { icon: Home, label: '홈', isActive: activeTab === 'home' },
        { icon: TrendingUp, label: '통계', isActive: activeTab === 'stats' },
        { icon: CreditCard, label: '카드', isActive: activeTab === 'cards' },
        { icon: User, label: '마이', isActive: activeTab === 'profile' },
    ]

    return (
        <div className={`fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t border-border/50 px-6 pb-safe ${className || ''}`}>
            <div className="flex items-center justify-around h-20">
                {navItems.map((item) => {
                    const Icon = item.icon
                    return (
                        <button
                            key={item.label}
                            onClick={() => onTabChange?.(item.label.toLowerCase())}
                            className="flex flex-col items-center gap-1 group"
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center group-active:scale-95 transition-transform ${item.isActive ? 'bg-primary/10' : ''
                                }`}>
                                <Icon className={`w-5 h-5 ${item.isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                            </div>
                            <span className={`text-[11px] font-medium ${item.isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                                {item.label}
                            </span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
