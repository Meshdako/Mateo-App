import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { ButtonType } from '../../interfaces';

interface GradeButtonProps {
  label: string;
  type: ButtonType;
  onPress: () => void;
  disabled?: boolean;
}

export default function GradeButton({ 
  label, 
  type, 
  onPress, 
  disabled = false 
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

  const getTextColor = (): string => {
    return '#FFFFFF';
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      activeOpacity={disabled ? 1 : 0.7}
      disabled={disabled}
    >
      <Text style={[styles.buttonText, { color: getTextColor() }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  disabled: {
    opacity: 0.4,
  },
  buttonText: {
    fontSize: 28,
    fontWeight: '600',
  },
});
