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
    const [invalidReason, setInvalidReason] = useState('')

    // 재설정 링크로 진입 시 세션을 확보할 때까지 대기.
    // 지원하는 링크 형식:
    //  1) token_hash + type  → verifyOtp (권장: 메일 스캐너/크로스디바이스에 강함)
    //  2) ?code=             → @supabase/ssr가 자동 교환 (PKCE, 같은 브라우저 필요)
    //  3) 기존 세션           → 그대로 진행
    useEffect(() => {
        let resolved = false

        const url = new URL(window.location.href)
        const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''))

        const markReady = () => {
            if (resolved) return
            resolved = true
            setPageState('ready')
        }
        const markInvalid = (reason: string) => {
            if (resolved) return
            resolved = true
            setInvalidReason(reason)
            setPageState('invalid')
        }

        // 링크가 만료/무효인 경우 URL에 error 파라미터가 실림
        const urlError = url.searchParams.get('error_description') || hashParams.get('error_description')
            || url.searchParams.get('error') || hashParams.get('error')
        if (urlError) {
            markInvalid(decodeURIComponent(urlError))
            return
        }

        // 1) token_hash 방식: 우리 페이지에서 직접 OTP 검증 (일회용 토큰을 이 시점에만 소비)
        const tokenHash = url.searchParams.get('token_hash')
        const type = url.searchParams.get('type')
        if (tokenHash) {
            supabase.auth
                .verifyOtp({ type: (type as any) || 'recovery', token_hash: tokenHash })
                .then(({ error }) => {
                    if (error) markInvalid(error.message)
                    else markReady()
                })
            return
        }

        // 2) 세션 자동 감지 (?code= PKCE 교환 또는 기존 세션)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session && (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
                markReady()
            }
        })

        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) markReady()
        })

        // 모바일 네트워크를 고려해 넉넉히 대기 후, 마지막으로 세션을 한 번 더 확인
        const timer = setTimeout(async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) markReady()
            else markInvalid('no_session')
        }, 8000)

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
                    {invalidReason && (
                        <p className="mt-5 text-[11px] text-gray-300 break-all">사유: {invalidReason}</p>
                    )}
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
