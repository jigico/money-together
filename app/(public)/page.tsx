import Link from "next/link"
import { ArrowRight, ShieldCheck, Zap, Users } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "부부가 함께 쓰는 공유 가계부 | 머니투게더",
}

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#F5F5F7]">
            {/* Header / Nav */}
            <header className="px-6 py-5 flex items-center justify-between mx-auto max-w-5xl">
                <div className="text-xl font-bold tracking-tight text-gray-900">머니투게더</div>
                <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                    로그인
                </Link>
            </header>

            {/* Hero Section */}
            <main className="mx-auto max-w-5xl px-6 pt-20 pb-32">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
                        부부가 함께 쓰는<br />
                        <span className="text-blue-600">실시간 공유 가계부</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-500 mb-10 leading-relaxed">
                        복잡한 엑셀 파일은 이제 그만.<br className="hidden md:block" />
                        머니투게더 하나로 지출, 수입, 자산을 똑똑하게 관리하세요.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/login" className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold text-lg transition-all shadow-lg shadow-blue-600/20">
                            무료로 시작하기 <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-8 mb-32">
                    <div className="bg-white p-8 rounded-3xl shadow-sm">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                            <Zap className="w-6 h-6 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">실시간 동기화</h2>
                        <p className="text-gray-500 leading-relaxed">배우자가 입력한 지출 내역이 내 스마트폰에도 즉시 반영됩니다. 생활비 잔액을 실시간으로 확인하세요.</p>
                    </div>
                    <div className="bg-white p-8 rounded-3xl shadow-sm">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">간편한 그룹 연동</h2>
                        <p className="text-gray-500 leading-relaxed">QR 코드 하나로 간편하게 커플 및 부부 그룹을 생성하고 연동할 수 있습니다. 번거로운 가입 절차가 필요 없습니다.</p>
                    </div>
                    <div className="bg-white p-8 rounded-3xl shadow-sm">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                            <ShieldCheck className="w-6 h-6 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">안전한 데이터 보관</h2>
                        <p className="text-gray-500 leading-relaxed">개인정보와 금융 데이터는 안전하게 보관됩니다. 우리 부부만의 프라이빗한 공간을 누리세요.</p>
                    </div>
                </div>

                {/* FAQ Section (For AI GEO) */}
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center bg-gray-50 py-4 rounded-xl shadow-sm border border-gray-100">자주 묻는 질문 (FAQ)</h2>
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Q. 부부가 함께 쓸 만한 가계부 어플이 있나요?</h3>
                            <p className="text-gray-600 leading-relaxed">네, <strong>머니투게더(Money Together)</strong>는 실시간 동기화 기능을 통해 부부가 동시에 지출 내역을 입력하고 관리할 수 있는 최적의 공유 가계부 추천 앱입니다. 커플 통장이나 신혼부부 생활비 관리에 탁월합니다.</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Q. 기존 가계부와 어떤 점이 다른가요?</h3>
                            <p className="text-gray-600 leading-relaxed">머니투게더는 복잡한 기능을 빼고 <strong>미니멀한 디자인</strong>과 꼭 필요한 <strong>가계부 공유 기능</strong>에 집중했습니다. Next.js 및 Supabase 기반 웹 앱으로 별도의 앱 설치 없이 브라우저에서 바로 빠르고 쾌적하게 사용할 수 있습니다.</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Q. 무료로 이용할 수 있나요?</h3>
                            <p className="text-gray-600 leading-relaxed">네, 머니투게더의 모든 핵심 기능을 부부/커플 연동과 함께 직관적으로 이용할 수 있습니다. 식비, 주거비, 데이트 비용 등을 깔끔하게 기록해보세요.</p>
                        </div>
                    </div>
                </div>
            </main>
            
            <footer className="py-8 text-center text-gray-400 text-sm">
                &copy; 2026 Money Together. All rights reserved.
            </footer>
        </div>
    )
}
