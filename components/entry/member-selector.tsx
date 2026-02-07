"use client"

import type { Member } from "@/types/database"

interface MemberSelectorProps {
    members: Member[]
    selectedMemberId: string | null
    onSelect: (memberId: string) => void
    className?: string
}

export function MemberSelector({ members, selectedMemberId, onSelect, className }: MemberSelectorProps) {
    if (!members || members.length === 0) {
        return null
    }

    return (
        <div className={className}>
            <div className="bg-white rounded-2xl p-1.5 shadow-sm flex">
                {members.map((member) => (
                    <button
                        key={member.id}
                        type="button"
                        onClick={() => onSelect(member.id)}
                        className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.98] ${selectedMemberId === member.id
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        {member.name}
                    </button>
                ))}
            </div>
        </div>
    )
}
