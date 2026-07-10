"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { updatePassword } from "@/lib/supabase/auth"
import { supabase } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, KeyRound } from "lucide-react"

type PageState = 'checking' | 'ready' | 'invalid' | 'done'

export default function ResetPasswordPage() {
    const [pageState, setPageState] = useState<PageState>('checking')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // 재설정 링크로 진입 시 Supabase가 URL의 코드를 세션으로 교환할 때까지 대기
    useEffect(() => {
        let resolved = false

        // 링크가 만료/무효인 경우 URL에 error 파라미터가 실림
        const url = new URL(window.location.href)
        const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''))
        if (url.searchParams.get('error') || hashParams.get('error')) {
            setPageState('invalid')
            return
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (resolved) return
            if (session && (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
                resolved = true
                setPageState('ready')
            }
        })

        supabase.auth.getSession().then(({ data: { session } }) => {
            if (resolved) return
            if (session) {
                resolved = true
                setPageState('ready')
            }
        })

        // 일정 시간 내 세션이 안 잡히면 무효한 링크로 판단
        const timer = setTimeout(() => {
            if (!resolved) {
                resolved = true
                setPageState('invalid')
            }
        }, 3000)

        return () => {
            subscription.unsubscribe()
            clearTimeout(timer)
        }
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.')
            return
        }

        setLoading(true)
        const result = await updatePassword(password)

        if (!result.success) {
            const msg = result.error?.message || ''
            if (msg.toLowerCase().includes('should be different')) {
                setError('기존과 다른 비밀번호를 입력해주세요.')
            } else if (msg.toLowerCase().includes('at least')) {
                setError('비밀번호는 6자 이상이어야 합니다.')
            } else {
                setError(msg || '비밀번호 변경에 실패했습니다.')
            }
            setLoading(false)
            return
        }

        setPageState('done')
    }

    // 링크 검증 중
    if (pageState === 'checking') {
        return (
            <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4">
                <div className="text-gray-500">링크를 확인하는 중...</div>
            </div>
        )
    }

    // 무효/만료된 링크
    if (pageState === 'invalid') {
        return (
            <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4">
                <Card className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm border-0 text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                        <KeyRound className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">링크가 유효하지 않아요</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        재설정 링크가 만료되었거나 이미 사용되었습니다.<br />
                        비밀번호 찾기를 다시 시도해주세요.
                    </p>
                    <Link href="/forgot-password">
                        <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors">
                            재설정 링크 다시 받기
                        </Button>
                    </Link>
                    <Link href="/login" className="inline-block mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors">
                        로그인 화면으로 돌아가기
                    </Link>
                </Card>
            </div>
        )
    }

    // 변경 완료
    if (pageState === 'done') {
        return (
            <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4">
                <Card className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm border-0 text-center">
                    <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">비밀번호가 변경되었어요</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        새 비밀번호로 로그인된 상태예요.<br />
                        바로 이용을 시작할 수 있습니다.
                    </p>
                    <Button
                        onClick={() => window.location.replace('/dashboard')}
                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
                    >
                        시작하기
                    </Button>
                </Card>
            </div>
        )
    }

    // 새 비밀번호 입력 폼
    return (
        <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm border-0">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">비밀번호 재설정</h1>
                    <p className="text-sm text-gray-500">
                        새로 사용할 비밀번호를 입력해주세요
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="password" className="text-sm font-medium text-gray-700">새 비밀번호</Label>
                        <Input
                            id="password" type="password" value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••" required minLength={6}
                            className="mt-1 h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">새 비밀번호 확인</Label>
                        <Input
                            id="confirmPassword" type="password" value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••" required minLength={6}
                            className="mt-1 h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <Button
                        type="submit" disabled={loading}
                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
                    >
                        {loading ? '변경 중...' : '비밀번호 변경'}
                    </Button>
                </form>
            </Card>
        </div>
    )
}
