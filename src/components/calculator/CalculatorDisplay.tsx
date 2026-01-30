import { View, Text, StyleSheet } from 'react-native';

interface GradeDisplayProps {
  value: string;
  mode: 'grade' | 'weight';
  placeholder?: string;
}

export default function GradeDisplay({ 
  value, 
  mode,
  placeholder = '0'
}: GradeDisplayProps) {
  const displayValue = value || placeholder;
  const label = mode === 'grade' ? 'Nota' : 'Peso (%)';

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Text
        style={styles.text}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {displayValue}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginBottom: 8,
  },
  label: {
    color: '#999999',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 56,
    fontWeight: '300',
  },
});
