"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
    User,
    Home,
    TrendingUp,
    CreditCard,
    Settings,
    ChevronRight,
    Bell,
    Palette,
    LogOut,
    UserMinus,
    Users,
    ListFilter,
    Wallet,
    QrCode,
    Copy,
    Check,
    X
} from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { supabase } from "@/lib/supabase/client"
import { getCurrentGroupInfo } from "@/lib/supabase/group-info"
import { getMembers } from "@/lib/supabase/queries"
import { QRCodeSVG } from "qrcode.react"
import type { Member } from "@/types/database"

export default function ProfilePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [copiedCode, setCopiedCode] = useState(false)
    const [showQRModal, setShowQRModal] = useState(false)

    // User & Group Data
    const [userEmail, setUserEmail] = useState("")
    const [userNickname, setUserNickname] = useState("")
    const [groupName, setGroupName] = useState("")
    const [inviteCode, setInviteCode] = useState("")
    const [members, setMembers] = useState<Member[]>([])

    useEffect(() => {
        async function loadProfileData() {
            try {
                // Get user session
                const { data: { session } } = await supabase.auth.getSession()
                if (!session) {
                    router.push('/login')
                    return
                }

                setUserEmail(session.user.email || "")
                setUserNickname(session.user.user_metadata?.nickname || "사용자")

                // Get group info
                const groupInfo = await getCurrentGroupInfo()
                if (groupInfo) {
                    setGroupName(groupInfo.name)
                    setInviteCode(groupInfo.invite_code || "")
                }

                // Get members
                const membersData = await getMembers()
                setMembers(membersData)

            } catch (error) {
                console.error('Error loading profile data:', error)
            } finally {
                setLoading(false)
            }
        }

        loadProfileData()
    }, [router])

    const handleCopyCode = () => {
        if (inviteCode) {
            navigator.clipboard.writeText(inviteCode)
            setCopiedCode(true)
            setTimeout(() => setCopiedCode(false), 2000)
        }
    }

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut()
            router.push('/login')
        } catch (error) {
            console.error('Logout error:', error)
            alert('로그아웃에 실패했습니다.')
        }
    }

    const inviteUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/onboarding?code=${inviteCode}`

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
                <div className="text-gray-500">로딩 중...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F5F5F7] pb-24">
            {/* Header */}
            <div className="px-5 pt-14 pb-6 flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">마이페이지</h1>
            </div>

            {/* Profile Section */}
            <div className="px-5 mb-6">
                <Card className="bg-white rounded-3xl p-6 shadow-sm border-0">
                    <div className="flex items-center gap-4 mb-4">
                        <Avatar className="h-20 w-20 ring-4 ring-blue-500/10 shadow-md">
                            <AvatarFallback className="bg-blue-600 text-white text-2xl">
                                {userNickname.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900 mb-1">{userNickname}</h2>
                            <p className="text-sm text-gray-500">{userEmail}</p>
                        </div>
                    </div>
                    {groupName && (
                        <div className="pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">우리 그룹</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-blue-600">{groupName}</span>
                                    <div className="flex items-center -space-x-2">
                                        {members.slice(0, 3).map((member) => (
                                            <Avatar key={member.id} className="h-6 w-6 ring-2 ring-white shadow-sm">
                                                <AvatarFallback
                                                    className="text-white text-[10px]"
                                                    style={{ backgroundColor: member.color }}
                                                >
                                                    {member.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                        ))}
                                        {members.length > 3 && (
                                            <div className="h-6 w-6 ring-2 ring-white shadow-sm rounded-full bg-gray-300 flex items-center justify-center text-[10px] text-white font-semibold">
                                                +{members.length - 3}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            {/* Invite Section */}
            {inviteCode && (
                <div className="px-5 mb-6">
                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-6 shadow-sm border border-blue-100">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">가족 초대하기</h3>
                                <p className="text-sm text-gray-600">함께 가계부를 관리하세요</p>
                            </div>
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>

                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 mb-3">
                            <p className="text-xs text-gray-500 mb-2 font-medium">초대 코드</p>
                            <div className="flex items-center justify-between">
                                <span className="text-2xl font-bold text-gray-900 tracking-wider font-mono">{inviteCode}</span>
                                <button
                                    onClick={handleCopyCode}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-sm font-medium active:scale-95 transition-transform"
                                >
                                    {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    {copiedCode ? "복사됨" : "복사"}
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowQRModal(true)}
                            className="w-full bg-blue-600 text-white rounded-2xl py-3.5 flex items-center justify-center gap-2 font-semibold active:scale-[0.98] transition-transform shadow-lg shadow-blue-600/25"
                        >
                            <QrCode className="w-5 h-5" />
                            QR 코드로 초대하기
                        </button>
                    </Card>
                </div>
            )}

            {/* Settings Groups */}
            <div className="px-5 space-y-6">
                {/* 가계부 관리 */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-3 px-2">가계부 관리</h3>
                    <Card className="bg-white rounded-2xl shadow-sm border-0 overflow-hidden">
                        <Link href="/invite" className="w-full px-5 py-4 flex items-center justify-between active:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                                    <Users className="w-5 h-5 text-blue-600" />
                                </div>
                                <span className="text-[15px] font-medium text-gray-900">멤버 초대</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                        </Link>
                    </Card>
                </div>

                {/* 계정 */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-3 px-2">계정</h3>
                    <Card className="bg-white rounded-2xl shadow-sm border-0 overflow-hidden">
                        <button
                            onClick={handleLogout}
                            className="w-full px-5 py-4 flex items-center justify-between active:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                                    <LogOut className="w-5 h-5 text-gray-600" />
                                </div>
                                <span className="text-[15px] font-medium text-gray-900">로그아웃</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                        </button>
                    </Card>
                </div>
            </div>

            {/* App Version */}
            <div className="px-5 mt-8 mb-4">
                <p className="text-center text-xs text-gray-400">
                    머니투게더 v1.0.0
                </p>
            </div>

            {/* QR Code Modal */}
            {showQRModal && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-5"
                    onClick={() => setShowQRModal(false)}
                >
                    <div
                        className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900">QR 코드로 초대</h3>
                            <button
                                onClick={() => setShowQRModal(false)}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6">
                            <p className="text-sm text-gray-600 mb-4 text-center">
                                QR 코드를 스캔하여 그룹에 참여하세요
                            </p>
                            <div className="bg-white p-6 rounded-xl flex items-center justify-center">
                                <QRCodeSVG
                                    value={inviteUrl}
                                    size={200}
                                    level="H"
                                    includeMargin={true}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-4 text-center">
                                초대 코드: <span className="font-mono font-bold text-blue-600">{inviteCode}</span>
                            </p>
                        </div>

                        <button
                            onClick={() => setShowQRModal(false)}
                            className="w-full bg-blue-600 text-white rounded-2xl py-3 font-semibold active:scale-[0.98] transition-transform"
                        >
                            닫기
                        </button>
                    </div>
                </div>
            )}

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-200 px-6">
                <div className="flex items-center justify-around h-20">
                    <Link href="/" className="flex flex-col items-center gap-1 group">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center group-active:scale-95 transition-transform">
                            <Home className="w-5 h-5 text-gray-400" />
                        </div>
                        <span className="text-[11px] font-medium text-gray-400">홈</span>
                    </Link>
                    <Link href="/stats" className="flex flex-col items-center gap-1 group">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center group-active:scale-95 transition-transform">
                            <TrendingUp className="w-5 h-5 text-gray-400" />
                        </div>
                        <span className="text-[11px] font-medium text-gray-400">통계</span>
                    </Link>
                    <Link href="/history" className="flex flex-col items-center gap-1 group">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center group-active:scale-95 transition-transform">
                            <CreditCard className="w-5 h-5 text-gray-400" />
                        </div>
                        <span className="text-[11px] font-medium text-gray-400">내역</span>
                    </Link>
                    <Link href="/profile" className="flex flex-col items-center gap-1 group">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center group-active:scale-95 transition-transform">
                            <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-[11px] font-medium text-blue-600">마이</span>
                    </Link>
                </div>
            </div>
        </div>
    )
}
