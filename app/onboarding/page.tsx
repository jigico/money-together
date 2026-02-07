"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getUser } from "@/lib/supabase/auth"
import { createGroup, joinGroupByCode } from "@/lib/supabase/groups"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Users } from "lucide-react"

export default function OnboardingPage() {
    const router = useRouter()
    const [mode, setMode] = useState<'select' | 'create' | 'join'>('select')
    const [groupName, setGroupName] = useState('')
    const [inviteCode, setInviteCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        async function fetchUser() {
            const currentUser = await getUser()
            if (!currentUser) {
                router.push('/login')
                return
            }
            setUser(currentUser)
        }
        fetchUser()
    }, [router])

    const handleCreateGroup = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        setError('')
        setLoading(true)

        const result = await createGroup(user.id, groupName, user.nickname)

        if (!result.success) {
            setError(result.error || '그룹 생성에 실패했습니다.')
            setLoading(false)
            return
        }

        // 성공 - 메인으로 이동
        router.push('/')
    }

    const handleJoinGroup = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        setError('')
        setLoading(true)

        const result = await joinGroupByCode(user.id, inviteCode, user.nickname)

        if (!result.success) {
            setError(result.error || '그룹 참여에 실패했습니다.')
            setLoading(false)
            return
        }

        // 성공 - 메인으로 이동
        router.push('/')
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
                <p className="text-gray-500">로딩 중...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Welcome Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">
                        머니투게더에<br />오신 것을 환영합니다!
                    </h1>
                    <p className="text-gray-500">
                        {user.nickname}님, 시작하려면 그룹을 만들거나 참여하세요
                    </p>
                </div>

                {/* Selection Mode */}
                {mode === 'select' && (
                    <div className="space-y-4">
                        <Card className="bg-white rounded-3xl p-6 shadow-sm border-0 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setMode('create')}>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                                    <Plus className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 text-lg">새로운 그룹 만들기</h3>
                                    <p className="text-sm text-gray-500 mt-0.5">가족이나 친구와 함께 가계부를 시작하세요</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="bg-white rounded-3xl p-6 shadow-sm border-0 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setMode('join')}>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                                    <Users className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 text-lg">초대 코드로 참여하기</h3>
                                    <p className="text-sm text-gray-500 mt-0.5">이미 만들어진 그룹에 참여하세요</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {/* Create Group Mode */}
                {mode === 'create' && (
                    <Card className="bg-white rounded-3xl p-8 shadow-sm border-0">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">그룹 만들기</h2>

                        <form onSubmit={handleCreateGroup} className="space-y-4">
                            <div>
                                <Label htmlFor="groupName" className="text-sm font-medium text-gray-700">
                                    그룹 이름
                                </Label>
                                <Input
                                    id="groupName"
                                    type="text"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    placeholder="예: 우리 가족"
                                    required
                                    className="mt-1 h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setMode('select')
                                        setError('')
                                        setGroupName('')
                                    }}
                                    variant="outline"
                                    className="flex-1 h-12 rounded-xl border-gray-200"
                                >
                                    취소
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
                                >
                                    {loading ? '생성 중...' : '그룹 만들기'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                )}

                {/* Join Group Mode */}
                {mode === 'join' && (
                    <Card className="bg-white rounded-3xl p-8 shadow-sm border-0">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">그룹 참여하기</h2>

                        <form onSubmit={handleJoinGroup} className="space-y-4">
                            <div>
                                <Label htmlFor="inviteCode" className="text-sm font-medium text-gray-700">
                                    초대 코드
                                </Label>
                                <Input
                                    id="inviteCode"
                                    type="text"
                                    value={inviteCode}
                                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                    placeholder="ABC123"
                                    required
                                    maxLength={6}
                                    className="mt-1 h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-center text-lg font-mono tracking-wider uppercase"
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    그룹 관리자로부터 받은 6자리 코드를 입력하세요
                                </p>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setMode('select')
                                        setError('')
                                        setInviteCode('')
                                    }}
                                    variant="outline"
                                    className="flex-1 h-12 rounded-xl border-gray-200"
                                >
                                    취소
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl"
                                >
                                    {loading ? '참여 중...' : '참여하기'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                )}
            </div>
        </div>
    )
}
