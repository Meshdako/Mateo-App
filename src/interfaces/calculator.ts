export type ButtonType = 'number' | 'decimal' | 'add' | 'delete' | 'help';

export interface GradeButton {
  label: string;
  type: ButtonType;
  value: string;
}

export interface Grade {
  id: string;
  grade: number;
  weight: number;
  timestamp: number;
}

export interface GradeCalculatorState {
  currentInput: string;
  inputMode: 'grade' | 'weight';
  grades: Grade[];
  isKeyboardBlocked: boolean;
  hasDecimal: boolean;
}
