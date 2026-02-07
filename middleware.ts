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

    console.log('[Middleware] Path:', request.nextUrl.pathname, 'User:', user?.id)

    // 공개 경로
    const publicPaths = ['/login']
    const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path))

    // 미인증 사용자 처리
    if (!user && !isPublicPath) {
        console.log('[Middleware] No user, redirect to /login')
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // 인증된 사용자가 로그인 페이지 접근 시
    if (user && request.nextUrl.pathname === '/login') {
        const { data: memberData } = await supabase
            .from('members')
            .select('id, group_id')
            .eq('user_id', user.id)
            .maybeSingle()

        const hasGroup = !!memberData

        if (hasGroup) {
            console.log('[Middleware] Logged in user has group, redirect to /')
            return NextResponse.redirect(new URL('/', request.url))
        } else {
            console.log('[Middleware] Logged in user no group, redirect to /onboarding')
            return NextResponse.redirect(new URL('/onboarding', request.url))
        }
    }

    // 인증된 사용자 - 그룹 확인
    if (user && !isPublicPath) {
        const { data: memberData } = await supabase
            .from('members')
            .select('id, group_id')
            .eq('user_id', user.id)
            .maybeSingle()

        const hasGroup = !!memberData
        console.log('[Middleware] User has group:', hasGroup, 'Path:', request.nextUrl.pathname)

        // 그룹이 없는 사용자
        if (!hasGroup && request.nextUrl.pathname !== '/onboarding') {
            console.log('[Middleware] No group, redirect to /onboarding')
            return NextResponse.redirect(new URL('/onboarding', request.url))
        }

        // 그룹이 있는 사용자가 온보딩 페이지 접근 시
        if (hasGroup && request.nextUrl.pathname === '/onboarding') {
            console.log('[Middleware] Has group, redirect to /')
            return NextResponse.redirect(new URL('/', request.url))
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
