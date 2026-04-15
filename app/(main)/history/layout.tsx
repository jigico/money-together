import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: '내역 리스트 | 머니투게더',
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
