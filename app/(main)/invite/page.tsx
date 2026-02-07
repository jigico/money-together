"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentGroupInfo } from "@/lib/supabase/queries"
import { Copy, Check, Share2, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function InvitePage() {
    const router = useRouter()
    const [groupInfo, setGroupInfo] = useState<{ name: string; invite_code: string } | null>(null)
    const [copied, setCopied] = useState(false)
    const [loading, setLoading] = useState(true)

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
                // 사용자가 공유를 취소하거나 실패한 경우
                console.log('Share cancelled or failed:', error)
            }
        } else {
            // 공유 API가 지원되지 않으면 클립보드에 복사
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

    return (
        <div className="min-h-screen bg-[#F5F5F7] pb-24">
            {/* Header */}
            <div className="bg-white px-5 pt-14 pb-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/" className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeft className="w-6 h-6 text-gray-700" />
                    </Link>
                    <h1 className="text-2xl font-semibold text-gray-900">그룹 초대</h1>
                </div>
            </div>

            {/* Content */}
            <div className="px-5 pt-8">
                {/* Group Info Card */}
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

                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={copyInviteCode}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
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
                            onClick={shareInviteCode}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                        >
                            <Share2 className="w-5 h-5" />
                            초대 메시지 공유
                        </button>
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">초대 방법</h3>
                    <div className="space-y-3">
                        <div className="flex gap-3">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                                1
                            </div>
                            <p className="text-gray-700">
                                초대할 사람에게 <span className="font-semibold text-blue-600">초대 코드</span>를 공유하세요
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                                2
                            </div>
                            <p className="text-gray-700">
                                상대방이 회원가입 후 <span className="font-semibold">"초대 코드로 참여하기"</span>를 클릭
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                                3
                            </div>
                            <p className="text-gray-700">
                                초대 코드를 입력하면 <span className="font-semibold text-green-600">그룹에 참여 완료!</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
