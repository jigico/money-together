import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "머니투게더 - Money Together",
    description: "부부가 함께하는 실시간 공유 가계부",
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
        </html>
    );
}
