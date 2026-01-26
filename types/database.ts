// Database Types - Structured for Supabase v2
export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            groups: {
                Row: Group
                Insert: Omit<Group, 'id' | 'created_at'>
                Update: Partial<Omit<Group, 'id' | 'created_at'>>
                Relationships: []
            }
            transactions: {
                Row: Transaction
                Insert: {
                    group_id: string
                    amount: number
                    category_id: string
                    member_id: string
                    description?: string
                    date: string
                }
                Update: Partial<{
                    group_id: string
                    amount: number
                    category_id: string
                    member_id: string
                    description: string
                    date: string
                }>
                Relationships: [
                    {
                        foreignKeyName: "transactions_category_id_fkey"
                        columns: ["category_id"]
                        referencedRelation: "categories"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "transactions_group_id_fkey"
                        columns: ["group_id"]
                        referencedRelation: "groups"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "transactions_member_id_fkey"
                        columns: ["member_id"]
                        referencedRelation: "members"
                        referencedColumns: ["id"]
                    }
                ]
            }
            categories: {
                Row: Category
                Insert: Omit<Category, 'id'>
                Update: Partial<Omit<Category, 'id'>>
                Relationships: []
            }
            members: {
                Row: Member
                Insert: Omit<Member, 'id'>
                Update: Partial<Omit<Member, 'id'>>
                Relationships: [
                    {
                        foreignKeyName: "members_group_id_fkey"
                        columns: ["group_id"]
                        referencedRelation: "groups"
                        referencedColumns: ["id"]
                    }
                ]
            }
        }
        Views: Record<string, never>
        Functions: Record<string, never>
        Enums: Record<string, never>
        CompositeTypes: Record<string, never>
    }
}


// Group Type (부부/가구 그룹)
export interface Group {
    id: string
    name: string
    created_at: string
}

// Transaction Type
export interface Transaction {
    id: string
    group_id: string
    amount: number
    category_id: string
    member_id: string
    description?: string
    created_at: string
    date: string
}

// Category Type
export interface Category {
    id: string
    name: string
    icon: string
    color: string
}

// Member Type
export interface Member {
    id: string
    group_id: string
    name: string
    avatar: string
    color: string
    bg_color: string
}

// UI Component Types (프론트엔드에서 사용)
export interface TransactionUI {
    id: number | string
    category: string
    icon: string
    amount: number
    date: string
    rawDate: string // 원본 날짜 (YYYY-MM-DD)
    color: string
}

export interface CategoryDataUI {
    name: string
    value: number
    color: string
}

export interface MemberSpendingUI {
    id: string
    name: string
    avatar: string
    amount: number
    color: string
    bgColor: string
}

// 변환 함수들
export function transactionToUI(
    transaction: Transaction,
    category: Category
): TransactionUI {
    return {
        id: transaction.id,
        category: category.name,
        icon: category.icon,
        amount: transaction.amount,
        date: formatDate(transaction.date),
        rawDate: transaction.date,
        color: category.color,
    }
}

export function memberToUI(member: Member, amount: number): MemberSpendingUI {
    return {
        id: member.id,
        name: member.name,
        avatar: member.avatar,
        amount,
        color: member.color,
        bgColor: member.bg_color,
    }
}

// 날짜 포맷팅 헬퍼
function formatDate(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return '오늘'
    if (diffDays === 1) return '어제'
    if (diffDays < 7) return `${diffDays}일 전`

    return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
}
