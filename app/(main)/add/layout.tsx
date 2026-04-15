import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: '새 내역 입력 | 머니투게더',
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
