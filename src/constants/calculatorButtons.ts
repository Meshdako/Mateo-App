import { GradeButton } from '../interfaces';

/**
 * Configuración de los botones de la calculadora de notas chilenas
 */
export const GRADE_CALCULATOR_BUTTONS: GradeButton[][] = [
  [
    { label: '7', type: 'number', value: '7' },
    { label: '8', type: 'number', value: '8' },
    { label: '9', type: 'number', value: '9' },
  ],
  [
    { label: '4', type: 'number', value: '4' },
    { label: '5', type: 'number', value: '5' },
    { label: '6', type: 'number', value: '6' },
  ],
  [
    { label: '1', type: 'number', value: '1' },
    { label: '2', type: 'number', value: '2' },
    { label: '3', type: 'number', value: '3' },
  ],
  [
    { label: ',', type: 'decimal', value: '.' },
    { label: '0', type: 'number', value: '0' },
    { label: '←', type: 'delete', value: 'delete' },
  ],
];

/**
 * Botones de acción
 */
export const ACTION_BUTTONS: GradeButton[] = [
  { label: '+', type: 'add', value: 'add' },
  { label: '?', type: 'help', value: 'help' },
];
