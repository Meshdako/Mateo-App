import { useState, useCallback } from 'react';
import { View, StyleSheet, Alert, ScrollView, Text, TouchableOpacity } from 'react-native';
import { GradeButton, GradeDisplay, GradesList } from '../components';
import { GradeCalculatorState, Grade, ButtonType } from '../interfaces';
import { GradeCalculatorService } from '../services';
import { GRADE_CALCULATOR_BUTTONS, ACTION_BUTTONS } from '../constants';

const initialState: GradeCalculatorState = {
  currentInput: '',
  inputMode: 'grade',
  grades: [],
  isKeyboardBlocked: false,
  hasDecimal: false,
};

export default function GradeCalculatorView() {
  const [state, setState] = useState<GradeCalculatorState>(initialState);
  const [tempGrade, setTempGrade] = useState<number | null>(null);

  // Calcular promedio ponderado
  const weightedAverage = GradeCalculatorService.calculateWeightedAverage(state.grades);

  const handleNumberPress = useCallback((number: string) => {
    setState((prev) => {
      // Validar si se puede agregar el número
      const canAdd = GradeCalculatorService.canAddNumber(
        prev.currentInput,
        number,
        prev.hasDecimal,
        prev.inputMode
      );

      if (!canAdd) {
        return prev;
      }

      return {
        ...prev,
        currentInput: prev.currentInput + number,
      };
    });
  }, []);

  const handleDecimalPress = useCallback(() => {
    setState((prev) => {
      // Solo permitir decimal en modo nota
      if (prev.inputMode === 'weight') {
        return prev;
      }

      const canAdd = GradeCalculatorService.canAddDecimal(
        prev.currentInput,
        prev.hasDecimal
      );

      if (!canAdd) {
        return prev;
      }

      return {
        ...prev,
        currentInput: prev.currentInput + '.',
        hasDecimal: true,
      };
    });
  }, []);

  const handleDeletePress = useCallback(() => {
    setState((prev) => {
      if (prev.currentInput === '') {
        Alert.alert('Error', 'No hay números para borrar');
        return prev;
      }

      const lastChar = prev.currentInput[prev.currentInput.length - 1];
      const newInput = prev.currentInput.slice(0, -1);

      return {
        ...prev,
        currentInput: newInput,
        hasDecimal: lastChar === '.' ? false : newInput.includes('.'),
      };
    });
  }, []);

  const handleAddPress = useCallback(() => {
    // Si no hay input, mostrar error
    if (state.currentInput === '') {
      Alert.alert('Error', 'Debes ingresar un valor');
      return;
    }

    // Modo nota: guardar temporalmente y cambiar a modo peso
    if (state.inputMode === 'grade') {
      const formattedGrade = GradeCalculatorService.formatGrade(state.currentInput);
      const gradeValue = parseFloat(formattedGrade);

      if (!GradeCalculatorService.isValidGrade(gradeValue)) {
        Alert.alert('Error', 'La nota debe estar entre 1.0 y 7.0');
        return;
      }

      setTempGrade(gradeValue);
      setState((prev) => ({
        ...prev,
        currentInput: '',
        inputMode: 'weight',
        hasDecimal: false,
      }));
      return;
    }

    // Modo peso: guardar la nota completa
    if (state.inputMode === 'weight' && tempGrade !== null) {
      const weightValue = parseInt(state.currentInput);

      if (!GradeCalculatorService.isValidWeight(weightValue)) {
        Alert.alert('Error', 'El peso debe estar entre 1 y 100');
        return;
      }

      const newGrade: Grade = {
        id: Date.now().toString(),
        grade: tempGrade,
        weight: weightValue,
        timestamp: Date.now(),
      };

      setState((prev) => ({
        ...prev,
        currentInput: '',
        inputMode: 'grade',
        grades: [...prev.grades, newGrade],
        hasDecimal: false,
      }));

      setTempGrade(null);
    }
  }, [state.currentInput, state.inputMode, tempGrade]);

  const handleDeleteGrade = useCallback((id: string) => {
    Alert.alert(
      'Eliminar nota',
      '¿Estás seguro de que quieres eliminar esta nota?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setState((prev) => ({
              ...prev,
              grades: prev.grades.filter((g) => g.id !== id),
            }));
          },
        },
      ]
    );
  }, []);

  const handleHelpPress = useCallback(() => {
    Alert.alert(
      'Ayuda - Sistema de Notas Chileno',
      'Reglas de ingreso:\n\n' +
      '• Notas válidas: 1.0 a 7.0\n' +
      '• El 0 nunca se puede ingresar\n' +
      '• El 7 solo puede ser 7.0 (sin decimales mayores)\n' +
      '• Los números 8 y 9 solo se pueden usar como decimales\n' +
      '• Ejemplo: 5.8, 6.9 son válidos\n' +
      '• Ejemplo: 8.5, 9.0 NO son válidos\n\n' +
      'Uso:\n' +
      '1. Ingresa la nota (ej: 6.5)\n' +
      '2. Presiona + para continuar\n' +
      '3. Ingresa el peso (ej: 30)\n' +
      '4. Presiona + para guardar\n' +
      '5. El peso total debe sumar 100%'
    );
  }, []);

  const handlePress = useCallback(
    (value: string, type: ButtonType) => {
      switch (type) {
        case 'number':
          handleNumberPress(value);
          break;
        case 'decimal':
          handleDecimalPress();
          break;
        case 'delete':
          handleDeletePress();
          break;
        case 'add':
          handleAddPress();
          break;
        case 'help':
          handleHelpPress();
          break;
      }
    },
    [handleNumberPress, handleDecimalPress, handleDeletePress, handleAddPress, handleHelpPress]
  );

  const isButtonDisabled = (value: string, type: ButtonType): boolean => {
    if (type === 'number') {
      return !GradeCalculatorService.canAddNumber(
        state.currentInput,
        value,
        state.hasDecimal,
        state.inputMode
      );
    }
    if (type === 'decimal') {
      return (
        state.inputMode === 'weight' ||
        !GradeCalculatorService.canAddDecimal(state.currentInput, state.hasDecimal)
      );
    }
    return false;
  };

  return (
    <View style={styles.container}>
      {/* Sección superior: Input y teclado */}
      <View style={styles.inputSection}>
        <GradeDisplay
          value={state.currentInput}
          mode={state.inputMode}
          placeholder={state.inputMode === 'grade' ? '0.0' : '0'}
        />

        {tempGrade !== null && (
          <View style={styles.tempGradeContainer}>
            <Text style={styles.tempGradeLabel}>Nota ingresada:</Text>
            <Text style={styles.tempGradeValue}>{tempGrade.toFixed(1)}</Text>
          </View>
        )}

        <View style={styles.keyboardContainer}>
          {GRADE_CALCULATOR_BUTTONS.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((btn) => (
                <GradeButton
                  key={btn.value}
                  label={btn.label}
                  type={btn.type}
                  onPress={() => handlePress(btn.value, btn.type)}
                  disabled={isButtonDisabled(btn.value, btn.type)}
                />
              ))}
            </View>
          ))}

          {/* Botones de acción */}
          <View style={styles.actionRow}>
            {ACTION_BUTTONS.map((btn) => (
              <TouchableOpacity
                key={btn.value}
                style={[
                  styles.actionButton,
                  btn.type === 'add' && styles.addButton,
                  btn.type === 'help' && styles.helpButton,
                ]}
                onPress={() => handlePress(btn.value, btn.type)}
                activeOpacity={0.7}
              >
                <Text style={styles.actionButtonText}>{btn.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Sección inferior: Lista de notas */}
      <View style={styles.gradesSection}>
        <GradesList
          grades={state.grades}
          onDeleteGrade={handleDeleteGrade}
          weightedAverage={weightedAverage}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  inputSection: {
    padding: 16,
    backgroundColor: '#0a0a0a',
  },
  tempGradeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    marginBottom: 16,
  },
  tempGradeLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  tempGradeValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  keyboardContainer: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 4,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    gap: 12,
  },
  actionButton: {
    width: 120,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addButton: {
    backgroundColor: '#4CAF50',
  },
  helpButton: {
    backgroundColor: '#2196F3',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
  },
  gradesSection: {
    flex: 1,
    padding: 16,
    backgroundColor: '#000000',
  },
});
