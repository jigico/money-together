"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn, signUp } from "@/lib/supabase/auth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
    const router = useRouter()
    const [mode, setMode] = useState<'login' | 'signup'>('login')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [nickname, setNickname] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            if (mode === 'signup') {
                // 회원가입
                if (!nickname.trim()) {
                    setError('닉네임을 입력해주세요.')
                    setLoading(false)
                    return
                }

                console.log('회원가입 시도:', { email, nickname })
                const result = await signUp(email, password, nickname)
                console.log('회원가입 결과:', result)

                if (!result.success) {
                    console.error('회원가입 실패:', result.error)
                    setError(result.error?.message || '회원가입에 실패했습니다.')
                    setLoading(false)
                    return
                }

                // 회원가입 성공 - 페이지 새로고침으로 세션 적용 후 미들웨어가 온보딩으로 리다이렉트
                console.log('회원가입 성공, 리다이렉트')
                window.location.href = '/onboarding'
            } else {
                // 로그인
                const result = await signIn(email, password)

                if (!result.success) {
                    setError(result.error?.message || '로그인에 실패했습니다.')
                    setLoading(false)
                    return
                }

                // 로그인 성공 - 페이지 새로고침으로 세션 적용 후 미들웨어가 리다이렉트
                window.location.href = '/'
            }
        } catch (err) {
            setError('오류가 발생했습니다. 다시 시도해주세요.')
            setLoading(false)
        }
    }

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
                            onChange={(e) => setEmail(e.target.value)}
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
