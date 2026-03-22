import { render, screen, fireEvent } from '@testing-library/react'
import { NumberKeypad } from './number-keypad'

describe('NumberKeypad', () => {
    const mockOnKeyPress = jest.fn()
    const mockOnSave = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    // 기본 렌더링 테스트
    describe('렌더링', () => {
        it('숫자 버튼 0~9와 00이 모두 렌더링된다', () => {
            render(
                <NumberKeypad onKeyPress={mockOnKeyPress} onSave={mockOnSave} isValid={true} />
            )

            const expectedKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '00']
            expectedKeys.forEach((key) => {
                expect(screen.getByText(key)).toBeInTheDocument()
            })
        })

        it('삭제(delete) 버튼이 SVG 아이콘으로 렌더링된다', () => {
            render(
                <NumberKeypad onKeyPress={mockOnKeyPress} onSave={mockOnSave} isValid={true} />
            )

            // delete 버튼은 SVG로 렌더링됨
            const buttons = screen.getAllByRole('button')
            // 숫자 11개 + delete 1개 + 저장 1개 = 13개
            expect(buttons.length).toBe(13)
        })

        it('저장하기 버튼이 렌더링된다', () => {
            render(
                <NumberKeypad onKeyPress={mockOnKeyPress} onSave={mockOnSave} isValid={true} />
            )

            expect(screen.getByText('저장하기')).toBeInTheDocument()
        })
    })

    // 키 입력 테스트
    describe('키 입력', () => {
        it('숫자 버튼 클릭 시 onKeyPress가 호출된다', () => {
            render(
                <NumberKeypad onKeyPress={mockOnKeyPress} onSave={mockOnSave} isValid={true} />
            )

            fireEvent.click(screen.getByText('5'))
            expect(mockOnKeyPress).toHaveBeenCalledWith('5')
            expect(mockOnKeyPress).toHaveBeenCalledTimes(1)
        })

        it('00 버튼 클릭 시 onKeyPress가 "00"으로 호출된다', () => {
            render(
                <NumberKeypad onKeyPress={mockOnKeyPress} onSave={mockOnSave} isValid={true} />
            )

            fireEvent.click(screen.getByText('00'))
            expect(mockOnKeyPress).toHaveBeenCalledWith('00')
        })

        it('빠른 연속 입력 시 모든 입력이 정상적으로 처리된다', () => {
            render(
                <NumberKeypad onKeyPress={mockOnKeyPress} onSave={mockOnSave} isValid={true} />
            )

            // 빠르게 1, 2, 3, 4, 5를 연속 클릭
            fireEvent.click(screen.getByText('1'))
            fireEvent.click(screen.getByText('2'))
            fireEvent.click(screen.getByText('3'))
            fireEvent.click(screen.getByText('4'))
            fireEvent.click(screen.getByText('5'))

            expect(mockOnKeyPress).toHaveBeenCalledTimes(5)
            expect(mockOnKeyPress).toHaveBeenNthCalledWith(1, '1')
            expect(mockOnKeyPress).toHaveBeenNthCalledWith(2, '2')
            expect(mockOnKeyPress).toHaveBeenNthCalledWith(3, '3')
            expect(mockOnKeyPress).toHaveBeenNthCalledWith(4, '4')
            expect(mockOnKeyPress).toHaveBeenNthCalledWith(5, '5')
        })

        it('같은 숫자를 빠르게 연속으로 누를 수 있다', () => {
            render(
                <NumberKeypad onKeyPress={mockOnKeyPress} onSave={mockOnSave} isValid={true} />
            )

            const button7 = screen.getByText('7')
            fireEvent.click(button7)
            fireEvent.click(button7)
            fireEvent.click(button7)

            expect(mockOnKeyPress).toHaveBeenCalledTimes(3)
            expect(mockOnKeyPress).toHaveBeenNthCalledWith(1, '7')
            expect(mockOnKeyPress).toHaveBeenNthCalledWith(2, '7')
            expect(mockOnKeyPress).toHaveBeenNthCalledWith(3, '7')
        })
    })

    // touch-manipulation CSS 클래스 테스트
    describe('터치 최적화 CSS 클래스', () => {
        it('숫자 버튼에 touch-manipulation 클래스가 적용되어 있다', () => {
            render(
                <NumberKeypad onKeyPress={mockOnKeyPress} onSave={mockOnSave} isValid={true} />
            )

            const button1 = screen.getByText('1')
            expect(button1).toHaveClass('touch-manipulation')
            expect(button1).toHaveClass('select-none')
        })

        it('저장하기 버튼에 touch-manipulation 클래스가 적용되어 있다', () => {
            render(
                <NumberKeypad onKeyPress={mockOnKeyPress} onSave={mockOnSave} isValid={true} />
            )

            const saveButton = screen.getByText('저장하기')
            expect(saveButton).toHaveClass('touch-manipulation')
            expect(saveButton).toHaveClass('select-none')
        })

        it('모든 키패드 숫자 버튼에 touch-manipulation이 적용되어 있다', () => {
            render(
                <NumberKeypad onKeyPress={mockOnKeyPress} onSave={mockOnSave} isValid={true} />
            )

            const allKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '00']
            allKeys.forEach((key) => {
                const button = screen.getByText(key)
                expect(button).toHaveClass('touch-manipulation')
                expect(button).toHaveClass('select-none')
            })
        })
    })

    // 저장 버튼 상태 테스트
    describe('저장 버튼', () => {
        it('isValid가 true일 때 저장 버튼이 활성화된다', () => {
            render(
                <NumberKeypad onKeyPress={mockOnKeyPress} onSave={mockOnSave} isValid={true} />
            )

            const saveButton = screen.getByText('저장하기')
            expect(saveButton).not.toBeDisabled()
        })

        it('isValid가 false일 때 저장 버튼이 비활성화된다', () => {
            render(
                <NumberKeypad onKeyPress={mockOnKeyPress} onSave={mockOnSave} isValid={false} />
            )

            const saveButton = screen.getByText('저장하기')
            expect(saveButton).toBeDisabled()
        })

        it('저장 버튼 클릭 시 onSave가 호출된다', () => {
            render(
                <NumberKeypad onKeyPress={mockOnKeyPress} onSave={mockOnSave} isValid={true} />
            )

            fireEvent.click(screen.getByText('저장하기'))
            expect(mockOnSave).toHaveBeenCalledTimes(1)
        })
    })

    // 삭제 버튼 모드 테스트
    describe('삭제 모드 (수정 화면)', () => {
        const mockOnDelete = jest.fn()

        it('showDelete가 true이고 onDelete가 있으면 삭제 버튼이 표시된다', () => {
            render(
                <NumberKeypad
                    onKeyPress={mockOnKeyPress}
                    onSave={mockOnSave}
                    isValid={true}
                    showDelete={true}
                    onDelete={mockOnDelete}
                />
            )

            expect(screen.getByText('삭제')).toBeInTheDocument()
        })

        it('삭제 버튼 클릭 시 onDelete가 호출된다', () => {
            render(
                <NumberKeypad
                    onKeyPress={mockOnKeyPress}
                    onSave={mockOnSave}
                    isValid={true}
                    showDelete={true}
                    onDelete={mockOnDelete}
                />
            )

            fireEvent.click(screen.getByText('삭제'))
            expect(mockOnDelete).toHaveBeenCalledTimes(1)
        })

        it('삭제 버튼에도 touch-manipulation 클래스가 적용되어 있다', () => {
            render(
                <NumberKeypad
                    onKeyPress={mockOnKeyPress}
                    onSave={mockOnSave}
                    isValid={true}
                    showDelete={true}
                    onDelete={mockOnDelete}
                />
            )

            const deleteButton = screen.getByText('삭제')
            expect(deleteButton).toHaveClass('touch-manipulation')
            expect(deleteButton).toHaveClass('select-none')
        })
    })
})
