import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { ButtonType } from '../../interfaces';
import { FONT_CALDSTONE_SEMIBOLD } from '../../constants/typography';

interface GradeButtonProps {
  label: string;
  type: ButtonType;
  onPress: () => void;
  disabled?: boolean;
  /** Tamaño del botón (ancho y alto); se adapta al ancho de pantalla desde la vista. */
  size?: number;
  /** Margen horizontal/vertical entre botones (la mitad se aplica a cada lado). */
  gap?: number;
}

export default function GradeButton({
  label,
  type,
  onPress,
  disabled = false,
  size = 72,
  gap = 8,
}: GradeButtonProps) {
  const getBackgroundColor = (): string => {
    if (disabled) return '#555555';

    switch (type) {
      case 'add':
        return '#4CAF50';
      case 'delete':
        return '#F44336';
      case 'help':
        return '#2196F3';
      case 'decimal':
        return '#FF9800';
      default:
        return '#333333';
    }
  };

  const margin = gap / 2;
  const fontSize = Math.max(16, Math.round(size * 0.34));

  const dynamicButton: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    marginHorizontal: margin,
    marginVertical: margin,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: getBackgroundColor(),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  };

  return (
    <TouchableOpacity
      style={[dynamicButton, disabled && styles.disabled]}
      onPress={onPress}
      activeOpacity={disabled ? 1 : 0.7}
      disabled={disabled}
    >
      <Text style={[styles.buttonText, { fontSize, color: '#FFFFFF' }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.45,
  },
  buttonText: {
    fontFamily: FONT_CALDSTONE_SEMIBOLD,
  },
});
