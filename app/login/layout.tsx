import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: '로그인 | 머니투게더',
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
