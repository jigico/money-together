"use client"

interface SpenderToggleProps {
    spender: "husband" | "wife"
    onSpenderChange: (spender: "husband" | "wife") => void
    className?: string
}

export function SpenderToggle({ spender, onSpenderChange, className }: SpenderToggleProps) {
    return (
        <div className={className}>
            <div className="bg-white rounded-2xl p-1.5 shadow-sm flex">
                <button
                    type="button"
                    onClick={() => onSpenderChange("husband")}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.98] ${spender === "husband"
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                >
                    남편
                </button>
                <button
                    type="button"
                    onClick={() => onSpenderChange("wife")}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.98] ${spender === "wife"
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                >
                    아내
                </button>
            </div>
        </div>
    )
}
