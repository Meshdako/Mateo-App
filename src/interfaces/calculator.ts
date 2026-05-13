export type ButtonType = 'number' | 'decimal' | 'add' | 'delete' | 'help';

export type WeightEntryMode = 'integer' | 'decimal';

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
  /** Solo aplica cuando inputMode === 'weight': enteros (25) o un decimal tipo 25,5 % */
  weightEntryMode: WeightEntryMode;
  grades: Grade[];
}
