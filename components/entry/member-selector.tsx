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
            <div className="flex gap-3 justify-center">
                {members.map((member) => (
                    <button
                        key={member.id}
                        type="button"
                        onClick={() => onSelect(member.id)}
                        className={`
                            flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 active:scale-[0.98]
                            ${selectedMemberId === member.id
                                ? 'bg-blue-600 text-white shadow-lg scale-105'
                                : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200'
                            }
                        `}
                    >
                        {member.name}
                    </button>
                ))}
            </div>
        </div>
    )
}
