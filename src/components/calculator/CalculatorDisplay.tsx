import { View, Text, StyleSheet } from 'react-native';
import { FONT_CALDSTONE_SEMIBOLD } from '../../constants/typography';

const fontApp = { fontFamily: FONT_CALDSTONE_SEMIBOLD };

interface GradeDisplayProps {
  value: string;
  mode: 'grade' | 'weight';
  placeholder?: string;
  weightEntryMode?: 'integer' | 'decimal';
  /** Menos padding y tipografía más pequeña para que quepa en una sola vista. */
  variant?: 'default' | 'compact';
}

export default function GradeDisplay({
  value,
  mode,
  placeholder = '0',
  weightEntryMode,
  variant = 'default',
}: GradeDisplayProps) {
  const displayValue = value || placeholder;
  const label = mode === 'grade' ? 'Nota' : 'Peso (%)';
  const subLabel =
    mode === 'weight' && weightEntryMode != null
      ? weightEntryMode === 'integer'
        ? 'Enteros'
        : 'Con decimal'
      : null;
  const compact = variant === 'compact';

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <Text style={[styles.label, compact && styles.labelCompact]}>{label}</Text>
      {subLabel ? (
        <Text style={[styles.subLabel, compact && styles.subLabelCompact]}>{subLabel}</Text>
      ) : null}
      <Text
        style={[styles.text, compact && styles.textCompact]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={compact ? 0.45 : 0.5}
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
    ...fontApp,
    color: '#999999',
    fontSize: 16,
    marginBottom: 4,
  },
  subLabel: {
    ...fontApp,
    color: '#777777',
    fontSize: 13,
    marginBottom: 8,
  },
  text: {
    ...fontApp,
    color: '#FFFFFF',
    fontSize: 56,
  },
  containerCompact: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 4,
  },
  labelCompact: {
    fontSize: 12,
    marginBottom: 2,
  },
  subLabelCompact: {
    fontSize: 11,
    marginBottom: 4,
  },
  textCompact: {
    fontSize: 36,
  },
});
