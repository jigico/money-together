import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: '비밀번호 재설정 | 머니투게더',
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
