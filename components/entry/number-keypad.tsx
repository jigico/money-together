"use client"

const keypadKeys = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["00", "0", "delete"],
]

interface NumberKeypadProps {
    onKeyPress: (key: string) => void
    onSave: () => void
    isValid: boolean
    className?: string
}

export function NumberKeypad({ onKeyPress, onSave, isValid, className }: NumberKeypadProps) {
    return (
        <div className={`bg-white rounded-t-[2rem] shadow-[0_-4px_30px_rgba(0,0,0,0.05)] p-4 pb-8 ${className || ''}`}>
            <div className="grid grid-cols-3 gap-3 mb-4">
                {keypadKeys.flat().map((key, index) => (
                    <button
                        key={index}
                        type="button"
                        onClick={() => onKeyPress(key)}
                        className={`h-16 rounded-2xl text-xl font-semibold transition-all duration-150 active:scale-95 ${key === "delete"
                                ? "bg-muted text-muted-foreground active:bg-muted/80"
                                : "bg-secondary text-foreground active:bg-secondary/80"
                            }`}
                    >
                        {key === "delete" ? (
                            <span className="flex items-center justify-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                                    <line x1="18" y1="9" x2="12" y2="15" />
                                    <line x1="12" y1="9" x2="18" y2="15" />
                                </svg>
                            </span>
                        ) : (
                            key
                        )}
                    </button>
                ))}
            </div>

            {/* Save Button */}
            <button
                type="button"
                onClick={onSave}
                disabled={!isValid}
                className={`w-full py-4 rounded-2xl text-lg font-semibold transition-all duration-200 active:scale-[0.98] ${isValid
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                    }`}
            >
                저장하기
            </button>
        </div>
    )
}
