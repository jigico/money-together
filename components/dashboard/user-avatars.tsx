import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserAvatarsProps {
    className?: string
}

export function UserAvatars({ className }: UserAvatarsProps) {
    return (
        <div className={`flex items-center gap-2 ${className || ''}`}>
            <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-[#0047AB] text-white text-xs">남</AvatarFallback>
            </Avatar>
            <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm -ml-3">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-rose-400 text-white text-xs">여</AvatarFallback>
            </Avatar>
        </div>
    )
}
