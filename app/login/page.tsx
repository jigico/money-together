"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn, signUp } from "@/lib/supabase/auth"
import { supabase } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, RotateCcw } from "lucide-react"

export default function LoginPage() {
    const router = useRouter()
    const [mode, setMode] = useState<'login' | 'signup'>('login')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [nickname, setNickname] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    // 회원가입 후 이메일 인증 대기 상태
    const [pendingEmail, setPendingEmail] = useState<string | null>(null)
    const [resendLoading, setResendLoading] = useState(false)
    const [resendSuccess, setResendSuccess] = useState(false)
    // 로그인 시 이메일 미인증 감지
    const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setUnconfirmedEmail(null)
        setLoading(true)

        try {
            if (mode === 'signup') {
                if (!nickname.trim()) {
                    setError('닉네임을 입력해주세요.')
                    setLoading(false)
                    return
                }

                const result = await signUp(email, password, nickname)

                if (!result.success) {
                    setError(result.error?.message || '회원가입에 실패했습니다.')
                    setLoading(false)
                    return
                }

                // 이메일 인증 대기 화면으로 전환
                setPendingEmail(email)
                setLoading(false)

            } else {
                const result = await signIn(email, password)

                if (!result.success) {
                    const msg = result.error?.message || ''

                    if (msg.toLowerCase().includes('email not confirmed')) {
                        // 이메일 미인증 — 재발송 버튼 노출
                        setUnconfirmedEmail(email)
                        setError('')
                    } else if (msg.toLowerCase().includes('invalid login credentials')) {
                        setError('이메일 또는 비밀번호가 올바르지 않습니다.')
                    } else {
                        setError(msg || '로그인에 실패했습니다.')
                    }
                    setLoading(false)
                    return
                }

                window.location.href = '/'
            }
        } catch (err) {
            setError('오류가 발생했습니다. 다시 시도해주세요.')
            setLoading(false)
        }
    }

    const handleResend = async (targetEmail: string) => {
        setResendLoading(true)
        setResendSuccess(false)
        try {
            await supabase.auth.resend({ type: 'signup', email: targetEmail })
            setResendSuccess(true)
        } catch {
            // 실패해도 재시도 가능하게
        } finally {
            setResendLoading(false)
        }
    }

    // ── 회원가입 완료 → 이메일 인증 대기 화면 ──────────────────────
    if (pendingEmail) {
        return (
            <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4">
                <Card className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm border-0 text-center">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                        <Mail className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">이메일을 확인해주세요</h2>
                    <p className="text-sm text-gray-500 mb-1">
                        <span className="font-semibold text-gray-700">{pendingEmail}</span>으로
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                        인증 링크를 보냈어요. 링크를 클릭하면 로그인할 수 있습니다.
                    </p>

                    {resendSuccess ? (
                        <p className="text-sm text-green-600 font-medium mb-4">✅ 인증 메일을 다시 보냈습니다!</p>
                    ) : (
                        <button
                            onClick={() => handleResend(pendingEmail)}
                            disabled={resendLoading}
                            className="flex items-center gap-1.5 text-sm text-blue-600 font-medium mx-auto mb-6 disabled:opacity-50"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            {resendLoading ? '발송 중...' : '인증 메일 다시 보내기'}
                        </button>
                    )}

                    <button
                        onClick={() => { setPendingEmail(null); setMode('login'); setEmail(''); setPassword('') }}
                        className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        로그인 화면으로 돌아가기
                    </button>
                </Card>
            </div>
        )
    }

    // ── 메인 로그인/회원가입 화면 ──────────────────────────────────
    return (
        <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm border-0">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        머니투게더
                    </h1>
                    <p className="text-sm text-gray-500">
                        {mode === 'login' ? '로그인하여 시작하세요' : '새 계정을 만들어보세요'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email */}
                    <div>
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                            이메일
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setUnconfirmedEmail(null) }}
                            placeholder="your@email.com"
                            required
                            className="mt-1 h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    {/* Nickname (회원가입 시에만) */}
                    {mode === 'signup' && (
                        <div>
                            <Label htmlFor="nickname" className="text-sm font-medium text-gray-700">
                                닉네임
                            </Label>
                            <Input
                                id="nickname"
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                placeholder="홍길동"
                                required
                                className="mt-1 h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                    )}

                    {/* Password */}
                    <div>
                        <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                            비밀번호
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={6}
                            className="mt-1 h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    {/* 이메일 미인증 안내 */}
                    {unconfirmedEmail && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                            <p className="text-sm text-amber-800 font-medium">📧 이메일 인증이 필요합니다</p>
                            <p className="text-xs text-amber-700">
                                가입 시 보낸 인증 메일의 링크를 클릭해주세요.
                            </p>
                            {resendSuccess ? (
                                <p className="text-xs text-green-700 font-semibold">✅ 인증 메일을 다시 보냈습니다!</p>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => handleResend(unconfirmedEmail)}
                                    disabled={resendLoading}
                                    className="flex items-center gap-1 text-xs text-amber-800 font-semibold underline disabled:opacity-50"
                                >
                                    <RotateCcw className="w-3 h-3" />
                                    {resendLoading ? '발송 중...' : '인증 메일 다시 보내기'}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
                    >
                        {loading ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
                    </Button>
                </form>

                {/* Toggle Mode */}
                <div className="mt-6 text-center">
                    <button
                        type="button"
                        onClick={() => {
                            setMode(mode === 'login' ? 'signup' : 'login')
                            setError('')
                            setUnconfirmedEmail(null)
                            setResendSuccess(false)
                        }}
                        className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        {mode === 'login'
                            ? '계정이 없으신가요? 회원가입'
                            : '이미 계정이 있으신가요? 로그인'}
                    </button>
                </div>
            </Card>
        </div>
    )
}
