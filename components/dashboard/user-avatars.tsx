import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { Member } from "@/types/database"

interface UserAvatarsProps {
    members: Member[]
    className?: string
}

export function UserAvatars({ members, className }: UserAvatarsProps) {
    if (members.length === 0) {
        return null
    }

    return (
        <div className={`flex items-center gap-2 ${className || ''}`}>
            {members.map((member, index) => (
                <Avatar
                    key={member.id}
                    className={`h-8 w-8 ring-2 ring-white shadow-sm ${index > 0 ? '-ml-3' : ''}`}
                >
                    <AvatarFallback
                        className="text-white text-xs font-semibold"
                        style={{ backgroundColor: member.color }}
                    >
                        {member.name.charAt(0)}
                    </AvatarFallback>
                </Avatar>
            ))}
        </div>
    )
}
