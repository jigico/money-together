import type { Metadata, Viewport } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://money-together.vercel.app'),
    title: '머니투게더 - 부부가 함께하는 실시간 공유 가계부',
    description: "커플, 부부가 함께쓰는 실시간 공유 가계부 앱 머니투게더입니다. 지출, 수입, 자산을 간편하게 관리하고 연동하세요.",
    keywords: ["가계부", "부부 가계부", "공유 가계부", "커플 가계부", "머니투게더", "실시간 가계부", "가계부 어플"],
    openGraph: {
        title: "머니투게더 - 실시간 공유 가계부",
        description: "부부와 커플을 위한 깔끔하고 직관적인 맞춤형 공유 가계부 앱",
        url: "https://money-together.vercel.app",
        siteName: "머니투게더",
        images: [
            {
                url: "/opengraph-image.png",
                width: 1200,
                height: 630,
                alt: "머니투게더 - 부부가 함께 쓰는 가계부",
            },
        ],
        locale: "ko_KR",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "머니투게더 - 부부 공유 가계부",
        description: "커플, 부부가 함께쓰는 실시간 공유 가계부 앱 머니투게더",
        images: ["/opengraph-image.png"],
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko">
            <body className="antialiased">
                {children}
            </body>
            {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
        </html>
    );
}
