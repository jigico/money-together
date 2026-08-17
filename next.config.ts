import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development';

// ─────────────────────────────────────────────────────────────────────────────
// Content-Security-Policy
// 이 앱이 실제로 통신하는 출처만 화이트리스트로 허용해 XSS 시 스크립트 실행 및
// 외부 데이터 유출을 심층 방어한다.
//  - Supabase: REST/Auth(https) + Realtime(wss)
//  - Google Analytics(@next/third-parties): gtag 스크립트 + 수집 엔드포인트
//  - script/style 'unsafe-inline': Next.js 하이드레이션 인라인 스크립트/스타일용
//    (dev는 HMR 때문에 'unsafe-eval'도 필요)
// ─────────────────────────────────────────────────────────────────────────────
const cspDirectives = [
    `default-src 'self'`,
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://www.googletagmanager.com https://*.google-analytics.com`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: https://*.google-analytics.com https://*.googletagmanager.com`,
    `font-src 'self' data:`,
    // GA4 수집 비콘은 apex 도메인(analytics.google.com / google-analytics.com)으로 전송된다.
    // CSP 와일드카드(*.도메인)는 apex를 매칭하지 못하므로 apex를 명시적으로 허용해야 한다.
    `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.googletagmanager.com https://google-analytics.com https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com`,
    `worker-src 'self' blob:`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
    ...(isDev ? [] : [`upgrade-insecure-requests`]),
].join('; ');

const nextConfig: NextConfig = {
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: cspDirectives,
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
