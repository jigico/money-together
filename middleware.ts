import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()
    const path = request.nextUrl.pathname

    console.log('[Middleware] Path:', path, 'User:', user?.id)

    const publicPaths = ['/login', '/']
    const isPublicPath = publicPaths.some(p => path === p || (path.startsWith(p) && p !== '/'))

    // 1. 미인증 사용자 처리
    if (!user) {
        if (!isPublicPath) {
            console.log('[Middleware] No user, redirect to /login')
            const loginUrl = new URL('/login', request.url)
            const originalPath = path + request.nextUrl.search
            if (path !== '/') {
                loginUrl.searchParams.set('redirect', originalPath)
            }
            return NextResponse.redirect(loginUrl)
        }
        return response
    }

    // 2. 인증된 사용자 - 그룹 확인
    const { data: memberData } = await supabase
        .from('members')
        .select('id, group_id')
        .eq('user_id', user.id)
        .maybeSingle()

    const hasGroup = !!memberData

    if (hasGroup) {
        // 그룹이 있는 경우, 로그인/온보딩/루트 접근 시 대시보드로 이동
        if (path === '/' || path === '/login' || path === '/onboarding') {
            console.log('[Middleware] Logged in & has group, redirect to /dashboard')
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    } else {
        // 그룹이 없는 사용자 (온보딩 필요)
        if (path === '/login') {
            const redirectParam = request.nextUrl.searchParams.get('redirect')
            const onboardingUrl = new URL('/onboarding', request.url)
            if (redirectParam) {
                const redirectUrl = new URL(redirectParam, request.url)
                const code = redirectUrl.searchParams.get('code')
                if (code) onboardingUrl.searchParams.set('code', code)
            }
            console.log('[Middleware] Logged in but no group, redirect to /onboarding')
            return NextResponse.redirect(onboardingUrl)
        }
        
        // 온보딩 페이지가 아닌 곳으로 갈 경우 온보딩으로 강제 이동
        if (path !== '/onboarding') {
            console.log('[Middleware] No group, redirect to /onboarding')
            return NextResponse.redirect(new URL('/onboarding', request.url))
        }
    }

    console.log('[Middleware] No redirect, continue')
    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public directory)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
