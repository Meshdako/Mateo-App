import { Grade, WeightEntryMode } from '../interfaces';

function canAddWeightIntegerDigit(buffer: string, digit: string): boolean {
  if (buffer.length >= 3) return false;
  const next = buffer + digit;
  const n = parseInt(next, 10);
  if (Number.isNaN(n)) return false;
  if (n > 100) return false;
  return true;
}

function canAddWeightDecimalDigit(buffer: string, digit: string): boolean {
  if (buffer.includes('.')) {
    const parts = buffer.split('.');
    const frac = parts[1] ?? '';
    if (frac.length >= 1) return false;
    return /^[0-9]$/.test(digit);
  }
  if (buffer.length >= 3) return false;
  const next = buffer + digit;
  const n = parseInt(next, 10);
  if (Number.isNaN(n)) return false;
  if (n > 100) return false;
  return true;
}

/**
 * Servicio que contiene la lógica de cálculo de notas chilenas
 */
export const GradeCalculatorService = {
  /**
   * Nota sin tecla coma: buffer "5" → 5.0, "58" → 5.8 (máx. 2 caracteres sin punto).
   * Peso: según weightEntryMode (enteros o un decimal, p. ej. 25,5).
   */
  canAddNumber: (
    currentInput: string,
    number: string,
    inputMode: 'grade' | 'weight',
    weightEntryMode: WeightEntryMode = 'integer'
  ): boolean => {
    if (inputMode === 'weight') {
      if (weightEntryMode === 'integer') {
        return canAddWeightIntegerDigit(currentInput, number);
      }
      return canAddWeightDecimalDigit(currentInput, number);
    }

    if (number === '0') return false;

    const len = currentInput.length;

    if (len === 0) {
      const n = parseInt(number, 10);
      return n >= 1 && n <= 7;
    }

    if (len === 1) {
      const first = currentInput[0];
      if (first === '7') return false;
      if (first < '1' || first > '6') return false;

      const tentative = parseFloat(`${first}.${number}`);
      return tentative >= 1.0 && tentative <= 7.0;
    }

    return false;
  },

  /**
   * Separador decimal solo en peso modo «decimal» (buffer interno con '.').
   */
  canAddWeightDecimalSeparator: (buffer: string): boolean => {
    if (buffer.includes('.')) return false;
    if (buffer === '') return false;
    const whole = parseInt(buffer, 10);
    if (Number.isNaN(whole)) return false;
    if (whole >= 100) return false;
    return true;
  },

  /**
   * Buffer interno usa punto; pantalla puede usar coma chilena.
   */
  getWeightDisplayFromBuffer: (buffer: string): string => {
    return buffer.replace('.', ',');
  },

  /**
   * Parsea peso según modo (enteros o hasta un decimal, ej. 25,5).
   */
  parseWeightInput: (buffer: string, weightEntryMode: WeightEntryMode): number | null => {
    if (!buffer) return null;
    if (weightEntryMode === 'integer') {
      const n = parseInt(buffer, 10);
      return Number.isNaN(n) ? null : n;
    }
    const normalized = buffer.endsWith('.') ? `${buffer}0` : buffer;
    const n = parseFloat(normalized);
    return Number.isNaN(n) ? null : n;
  },

  /**
   * Texto mostrado en pantalla para el buffer de nota (sin coma en teclado).
   */
  getGradeDisplayFromBuffer: (buffer: string): string => {
    if (!buffer) return '';
    if (buffer.includes('.')) return buffer;
    if (buffer.length === 1) return `${buffer}.0`;
    if (buffer.length === 2) return `${buffer[0]}.${buffer[1]}`;
    return buffer;
  },

  /**
   * Convierte el buffer de nota a string con punto para parseFloat.
   */
  formatGrade: (input: string): string => {
    if (!input) return '';
    if (input.includes('.')) {
      if (input.endsWith('.')) return `${input}0`;
      return input;
    }
    if (input.length === 1) return `${input}.0`;
    if (input.length === 2) return `${input[0]}.${input[1]}`;
    return input;
  },

  isValidGrade: (grade: number): boolean => {
    return grade >= 1.0 && grade <= 7.0;
  },

  isValidWeight: (weight: number): boolean => {
    return weight > 0 && weight <= 100;
  },

  /** Suma de pesos ya asignados (%). */
  getTotalWeightPercent: (grades: Grade[]): number => {
    return grades.reduce((sum, g) => sum + g.weight, 0);
  },

  /**
   * Comprueba si al sumar `additionalWeight` se supera el 100 % global.
   * Si `excludeGradeId` está definido, no cuenta ese ítem (útil al editar una fila).
   */
  wouldExceedTotalWeightPercent: (
    grades: Grade[],
    additionalWeight: number,
    excludeGradeId?: string
  ): boolean => {
    let total = 0;
    for (const g of grades) {
      if (excludeGradeId !== undefined && g.id === excludeGradeId) continue;
      total += g.weight;
    }
    return total + additionalWeight > 100 + 1e-9;
  },

  calculateWeightedAverage: (grades: Grade[]): number => {
    if (grades.length === 0) return 0;

    const totalWeight = grades.reduce((sum, g) => sum + g.weight, 0);

    if (totalWeight === 0) return 0;

    const weightedSum = grades.reduce((sum, g) => {
      return sum + g.grade * g.weight;
    }, 0);

    return weightedSum / totalWeight;
  },

  formatDisplay: (value: number): string => {
    return value.toFixed(1);
  },

  /** Buffer de teclas de nota (ej. 5.1 → "51", 7.0 → "7"). */
  gradeToInputBuffer: (grade: number): string => {
    const parts = grade.toFixed(1).split('.');
    const whole = parts[0] ?? '';
    const dec = parts[1] ?? '0';
    return dec === '0' ? whole : `${whole}${dec}`;
  },
};
