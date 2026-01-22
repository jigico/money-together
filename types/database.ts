// Database Types
export interface Database {
    public: {
        Tables: {
            groups: {
                Row: Group
                Insert: Omit<Group, 'id' | 'created_at'>
                Update: Partial<Omit<Group, 'id' | 'created_at'>>
            }
            transactions: {
                Row: Transaction
                Insert: Omit<Transaction, 'id' | 'created_at'>
                Update: Partial<Omit<Transaction, 'id' | 'created_at'>>
            }
            categories: {
                Row: Category
                Insert: Omit<Category, 'id'>
                Update: Partial<Omit<Category, 'id'>>
            }
            members: {
                Row: Member
                Insert: Omit<Member, 'id'>
                Update: Partial<Omit<Member, 'id'>>
            }
        }
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
