import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: '소비 통계 분석 | 머니투게더',
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
