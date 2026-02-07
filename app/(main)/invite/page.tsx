"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentGroupInfo } from "@/lib/supabase/group-info"
import { Copy, Check, Share2, ArrowLeft, QrCode } from "lucide-react"
import Link from "next/link"
import { QRCodeSVG } from "qrcode.react"

export default function InvitePage() {
    const router = useRouter()
    const [groupInfo, setGroupInfo] = useState<{ name: string; invite_code: string | null } | null>(null)
    const [copied, setCopied] = useState(false)
    const [loading, setLoading] = useState(true)
    const [showQR, setShowQR] = useState(false)

    useEffect(() => {
        async function fetchGroupInfo() {
            const info = await getCurrentGroupInfo()
            if (!info) {
                router.push('/')
                return
            }
            setGroupInfo(info)
            setLoading(false)
        }
        fetchGroupInfo()
    }, [router])

    const copyInviteCode = () => {
        if (groupInfo?.invite_code) {
            navigator.clipboard.writeText(groupInfo.invite_code)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const shareInviteCode = async () => {
        if (!groupInfo) return

        const shareText = `머니투게더 그룹에 초대합니다!\n\n그룹명: ${groupInfo.name}\n초대 코드: ${groupInfo.invite_code}\n\n${window.location.origin}/onboarding`

        if (navigator.share) {
            try {
                await navigator.share({
                    title: '머니투게더 초대',
                    text: shareText,
                })
            } catch (error) {
                console.log('Share cancelled or failed:', error)
            }
        } else {
            navigator.clipboard.writeText(shareText)
            alert('초대 메시지가 클립보드에 복사되었습니다!')
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
                <div className="text-gray-500">로딩 중...</div>
            </div>
        )
    }

    if (!groupInfo) {
        return null
    }

    const inviteUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/onboarding?code=${groupInfo.invite_code}`

    return (
        <div className="min-h-screen bg-[#F5F5F7] pb-24">
            <div className="bg-white px-5 py-6 shadow-sm">
                <div className="flex items-center gap-3">
                    <Link href="/" className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeft className="w-6 h-6 text-gray-700" />
                    </Link>
                    <h1 className="text-xl font-semibold text-gray-900">그룹 초대</h1>
                </div>
            </div>

            <div className="px-5 pt-8">
                <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                    <p className="text-sm text-gray-500 mb-2">그룹명</p>
                    <p className="text-xl font-semibold text-gray-900 mb-6">{groupInfo.name}</p>

                    <p className="text-sm text-gray-500 mb-3">초대 코드</p>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-50 rounded-xl px-6 py-4 border-2 border-dashed border-gray-300">
                            <p className="text-3xl font-bold text-center tracking-widest text-blue-600 font-mono">
                                {groupInfo.invite_code}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <button
                            onClick={copyInviteCode}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-5 h-5" />
                                    복사 완료!
                                </>
                            ) : (
                                <>
                                    <Copy className="w-5 h-5" />
                                    코드 복사
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => setShowQR(!showQR)}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                        >
                            <QrCode className="w-5 h-5" />
                            QR 코드
                        </button>
                    </div>

                    <button
                        onClick={shareInviteCode}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 mt-3 bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                    >
                        <Share2 className="w-5 h-5" />
                        초대 메시지 공유
                    </button>

                    {/* QR Code Modal */}
                    {showQR && (
                        <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
                            <p className="text-sm font-semibold text-gray-700 mb-4 text-center">
                                QR 코드를 스캔하여 참여하세요
                            </p>
                            <div className="bg-white p-6 rounded-xl flex items-center justify-center">
                                <QRCodeSVG
                                    value={inviteUrl}
                                    size={200}
                                    level="H"
                                    includeMargin={true}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-3 text-center">
                                QR 코드를 스캔하면 자동으로 초대 코드가 입력됩니다
                            </p>
                        </div>
                    )}
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">초대 방법</h3>
                    <div className="space-y-3">
                        <div className="flex gap-3">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                                1
                            </div>
                            <p className="text-gray-700">
                                초대할 사람에게 <span className="font-semibold text-blue-600">초대 코드</span> 또는 <span className="font-semibold text-indigo-600">QR 코드</span>를 공유하세요
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                                2
                            </div>
                            <p className="text-gray-700">
                                상대방이 회원가입 후 <span className="font-semibold">&quot;초대 코드로 참여하기&quot;</span>를 클릭
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                                3
                            </div>
                            <p className="text-gray-700">
                                초대 코드를 입력하거나 QR 스캔하면 <span className="font-semibold text-green-600">그룹에 참여 완료!</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
