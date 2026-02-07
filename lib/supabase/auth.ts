import { supabase } from './client'

export interface AuthError {
    message: string
}

export interface AuthResult {
    success: boolean
    error?: AuthError
    userId?: string
}

/**
 * 회원가입
 * @param email 이메일
 * @param password 비밀번호
 * @param nickname 닉네임 (user metadata에 저장)
 */
export async function signUp(
    email: string,
    password: string,
    nickname: string
): Promise<AuthResult> {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    nickname,
                },
            },
        })

        if (error) {
            return {
                success: false,
                error: { message: error.message },
            }
        }

        if (!data.user) {
            return {
                success: false,
                error: { message: '회원가입에 실패했습니다.' },
            }
        }

        return {
            success: true,
            userId: data.user.id,
        }
    } catch (error) {
        return {
            success: false,
            error: { message: '회원가입 중 오류가 발생했습니다.' },
        }
    }
}

/**
 * 로그인
 * @param email 이메일
 * @param password 비밀번호
 */
export async function signIn(email: string, password: string): Promise<AuthResult> {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            return {
                success: false,
                error: { message: error.message },
            }
        }

        if (!data.user) {
            return {
                success: false,
                error: { message: '로그인에 실패했습니다.' },
            }
        }

        return {
            success: true,
            userId: data.user.id,
        }
    } catch (error) {
        return {
            success: false,
            error: { message: '로그인 중 오류가 발생했습니다.' },
        }
    }
}

/**
 * 로그아웃
 */
export async function signOut(): Promise<AuthResult> {
    try {
        const { error } = await supabase.auth.signOut()

        if (error) {
            return {
                success: false,
                error: { message: error.message },
            }
        }

        return { success: true }
    } catch (error) {
        return {
            success: false,
            error: { message: '로그아웃 중 오류가 발생했습니다.' },
        }
    }
}

/**
 * 현재 사용자 정보 조회
 */
export async function getUser() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
            return null
        }

        return {
            id: user.id,
            email: user.email,
            nickname: user.user_metadata?.nickname || '',
        }
    } catch (error) {
        return null
    }
}

/**
 * 사용자의 그룹 정보 조회
 */
export async function getUserGroup(userId: string) {
    try {
        const { data, error } = await supabase
            .from('members')
            .select(`
                id,
                name,
                role,
                group:groups(*)
            `)
            .eq('user_id', userId)
            .single()

        if (error || !data) {
            return null
        }

        return data
    } catch (error) {
        return null
    }
}
