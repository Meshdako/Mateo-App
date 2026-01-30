import { Grade } from '../interfaces';

/**
 * Servicio que contiene la lógica de cálculo de notas chilenas
 */
export const GradeCalculatorService = {
  /**
   * Valida si un número puede ser ingresado según las reglas chilenas
   */
  canAddNumber: (
    currentInput: string,
    number: string,
    hasDecimal: boolean,
    inputMode: 'grade' | 'weight'
  ): boolean => {
    // Regla 1: El 0 nunca se agrega
    if (number === '0') return false;

    // Si es modo peso, permitir todos los números
    if (inputMode === 'weight') {
      // No permitir más de 3 dígitos (máximo 100%)
      if (currentInput.length >= 3) return false;
      return true;
    }

    // Modo nota (grade)
    const isEmpty = currentInput === '';

    // Regla 2: 8 y 9 solo después de la coma
    if ((number === '8' || number === '9') && !hasDecimal) {
      return false;
    }

    // Regla 3: Si ya hay un 7 como primer dígito, bloquear más entrada
    if (currentInput === '7') {
      return false;
    }

    // Regla 4: Si hay decimal y el primer número es 7, no permitir más números
    if (hasDecimal && currentInput.startsWith('7.')) {
      return false;
    }

    return true;
  },

  /**
   * Valida si se puede agregar un decimal
   */
  canAddDecimal: (currentInput: string, hasDecimal: boolean): boolean => {
    // No agregar decimal si ya existe uno
    if (hasDecimal) return false;
    
    // No agregar decimal si no hay números
    if (currentInput === '') return false;

    return true;
  },

  /**
   * Formatea la nota antes de guardar
   */
  formatGrade: (input: string): string => {
    // Si es entero, agregar .0
    if (!input.includes('.')) {
      return `${input}.0`;
    }

    // Si termina en punto, agregar 0
    if (input.endsWith('.')) {
      return `${input}0`;
    }

    return input;
  },

  /**
   * Valida si una nota es válida (1.0 a 7.0)
   */
  isValidGrade: (grade: number): boolean => {
    return grade >= 1.0 && grade <= 7.0;
  },

  /**
   * Valida si un peso es válido
   */
  isValidWeight: (weight: number): boolean => {
    return weight > 0 && weight <= 100;
  },

  /**
   * Calcula el promedio ponderado de las notas
   */
  calculateWeightedAverage: (grades: Grade[]): number => {
    if (grades.length === 0) return 0;

    const totalWeight = grades.reduce((sum, g) => sum + g.weight, 0);
    
    if (totalWeight === 0) return 0;

    const weightedSum = grades.reduce((sum, g) => {
      return sum + (g.grade * g.weight);
    }, 0);

    return weightedSum / totalWeight;
  },

  /**
   * Formatea un número para mostrar (con un decimal)
   */
  formatDisplay: (value: number): string => {
    return value.toFixed(1);
  },
};
