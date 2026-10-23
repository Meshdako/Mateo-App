import { View, Text, StyleSheet } from 'react-native';
import { FONT_CALDSTONE_SEMIBOLD } from '../../constants/typography';

const fontApp = { fontFamily: FONT_CALDSTONE_SEMIBOLD };

interface GradeDisplayProps {
  /** Valor que se muestra en la columna "Nota". */
  gradeValue: string;
  /** Valor que se muestra en la columna "Peso (%)". */
  weightValue: string;
  /** Columna que se está editando actualmente. */
  activeColumn: 'grade' | 'weight';
  /** Modo de ingreso del peso, para mostrar el subtítulo. */
  weightEntryMode?: 'integer' | 'decimal';
  /** Menos padding y tipografía más pequeña para que quepa en una sola vista. */
  variant?: 'default' | 'compact';
}

export default function GradeDisplay({
  gradeValue,
  weightValue,
  activeColumn,
  weightEntryMode,
  variant = 'default',
}: GradeDisplayProps) {
  const compact = variant === 'compact';
  const gradeDisplay = gradeValue || (activeColumn === 'grade' ? '0.0' : '—');
  const weightDisplay = weightValue || (activeColumn === 'weight' ? '0' : '—');
  const weightSubLabel =
    weightEntryMode != null
      ? weightEntryMode === 'integer'
        ? 'Enteros'
        : 'Con decimal'
      : null;

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <View style={styles.column}>
        <Text
          style={[
            styles.label,
            compact && styles.labelCompact,
            activeColumn === 'grade' && styles.labelActive,
          ]}
        >
          Nota
        </Text>
        <Text style={[styles.subLabel, compact && styles.subLabelCompact]}>
          {' '}
        </Text>
        <Text
          style={[
            styles.text,
            compact && styles.textCompact,
            activeColumn !== 'grade' && styles.textInactive,
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={compact ? 0.45 : 0.5}
        >
          {gradeDisplay}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.column}>
        <Text
          style={[
            styles.label,
            compact && styles.labelCompact,
            activeColumn === 'weight' && styles.labelActive,
          ]}
        >
          Peso (%)
        </Text>
        <Text style={[styles.subLabel, compact && styles.subLabelCompact]}>
          {weightSubLabel ?? ' '}
        </Text>
        <Text
          style={[
            styles.text,
            compact && styles.textCompact,
            activeColumn !== 'weight' && styles.textInactive,
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={compact ? 0.45 : 0.5}
        >
          {weightDisplay}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginBottom: 8,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  divider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: '#333333',
    marginHorizontal: 6,
  },
  label: {
    ...fontApp,
    color: '#777777',
    fontSize: 16,
    marginBottom: 4,
  },
  labelActive: {
    color: '#FFFFFF',
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
  textInactive: {
    color: '#666666',
  },
  containerCompact: {
    paddingHorizontal: 10,
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
