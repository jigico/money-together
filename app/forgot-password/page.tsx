"use client"

import { useState } from "react"
import Link from "next/link"
import { requestPasswordReset } from "@/lib/supabase/auth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, RotateCcw, ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [sentEmail, setSentEmail] = useState<string | null>(null)
    const [resendLoading, setResendLoading] = useState(false)
    const [resendSuccess, setResendSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const result = await requestPasswordReset(email)

        if (!result.success) {
            const msg = result.error?.message || ''
            if (msg.toLowerCase().includes('rate limit')) {
                setError('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.')
            } else if (msg.toLowerCase().includes('is invalid')) {
                setError('올바르지 않은 이메일 주소입니다.')
            } else {
                setError(msg || '재설정 메일 발송에 실패했습니다.')
            }
            setLoading(false)
            return
        }

        setSentEmail(email)
        setLoading(false)
    }

    const handleResend = async () => {
        if (!sentEmail) return
        setResendLoading(true)
        setResendSuccess(false)
        const result = await requestPasswordReset(sentEmail)
        if (result.success) setResendSuccess(true)
        setResendLoading(false)
    }

    // 메일 발송 완료 화면
    if (sentEmail) {
        return (
            <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4">
                <Card className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm border-0 text-center">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                        <Mail className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">메일을 확인해주세요</h2>
                    <p className="text-sm text-gray-500 mb-1">
                        <span className="font-semibold text-gray-700">{sentEmail}</span>으로
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                        비밀번호 재설정 링크를 보냈어요. 링크를 클릭해 새 비밀번호를 설정하세요.
                    </p>
                    {resendSuccess ? (
                        <p className="text-sm text-green-600 font-medium mb-4">✅ 재설정 메일을 다시 보냈습니다!</p>
                    ) : (
                        <button
                            onClick={handleResend}
                            disabled={resendLoading}
                            className="flex items-center gap-1.5 text-sm text-blue-600 font-medium mx-auto mb-6 disabled:opacity-50"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            {resendLoading ? '발송 중...' : '재설정 메일 다시 보내기'}
                        </button>
                    )}
                    <Link href="/login" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                        로그인 화면으로 돌아가기
                    </Link>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm border-0">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">비밀번호 찾기</h1>
                    <p className="text-sm text-gray-500">
                        가입한 이메일로 재설정 링크를 보내드려요
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">이메일</Label>
                        <Input
                            id="email" type="email" value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com" required
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
                        {loading ? '발송 중...' : '재설정 링크 보내기'}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        로그인으로 돌아가기
                    </Link>
                </div>
            </Card>
        </div>
    )
}
