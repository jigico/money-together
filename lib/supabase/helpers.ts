import { supabase } from './client'

// ─────────────────────────────────────────────────────────────────────────────
// Promise in-flight 캐싱 전략
//
// 문제: Promise.all()로 여러 쿼리가 동시에 실행될 때, 모듈 레벨 변수(null)를
//       각자 확인하고 동시에 API 요청을 발사하는 race condition이 발생한다.
//
// 해결: Promise 자체를 캐시한다. 첫 번째 호출이 Promise를 생성하고,
//       이후 동시 호출은 동일한 Promise를 공유하므로 API 요청이 1번만 나간다.
// ─────────────────────────────────────────────────────────────────────────────

// groupId in-flight Promise 캐시
let groupIdPromise: Promise<string | null> | null = null

async function fetchGroupId(): Promise<string | null> {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            console.error('No authenticated user found')
            return null
        }

        const { data, error } = await supabase
            .from('members')
            .select('group_id')
            .eq('user_id', user.id)
            .single() as { data: { group_id: string } | null, error: any }

        if (error || !data) {
            console.error('Error fetching user group:', error)
            // 실패 시 Promise 캐시를 초기화해서 재시도 허용
            groupIdPromise = null
            return null
        }

        return data.group_id
    } catch (error) {
        console.error('Error in getCurrentGroupId:', error)
        groupIdPromise = null
        return null
    }
}

// 현재 그룹 ID 가져오기 — Promise 캐시로 race condition 방지
export function getCurrentGroupId(): Promise<string | null> {
    if (!groupIdPromise) {
        groupIdPromise = fetchGroupId()
    }
    return groupIdPromise
}

// 캐시 초기화 (로그아웃 시 등)
export function clearGroupCache() {
    groupIdPromise = null
    memberIdPromise = null
}

// ─────────────────────────────────────────────────────────────────────────────

// memberId in-flight Promise 캐시
let memberIdPromise: Promise<string | null> | null = null

async function fetchMemberId(): Promise<string | null> {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            console.error('No authenticated user found')
            return null
        }

        const { data, error } = await supabase
            .from('members')
            .select('id')
            .eq('user_id', user.id)
            .single() as { data: { id: string } | null, error: any }

        if (error || !data) {
            console.error('Error fetching user member:', error)
            memberIdPromise = null
            return null
        }

        return data.id
    } catch (error) {
        console.error('Error in getCurrentUserMemberId:', error)
        memberIdPromise = null
        return null
    }
}

// 현재 로그인한 사용자의 멤버 ID 가져오기 — Promise 캐시로 중복 요청 방지
export function getCurrentUserMemberId(): Promise<string | null> {
    if (!memberIdPromise) {
        memberIdPromise = fetchMemberId()
    }
    return memberIdPromise
}
