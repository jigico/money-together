import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: '자주 쓰는 내역 관리 | 머니투게더',
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
