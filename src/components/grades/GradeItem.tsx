import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Grade } from '../../interfaces';
import { FONT_CALDSTONE_SEMIBOLD } from '../../constants/typography';
import GradeGlowValue from './GradeGlowValue';

const fontApp = { fontFamily: FONT_CALDSTONE_SEMIBOLD };

interface GradeItemProps {
  grade: Grade;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  /** Fila estrecha junto al teclado (panel derecho). */
  embedded?: boolean;
}

function formatWeightPercent(weight: number): string {
  const r = Math.round(weight * 10) / 10;
  if (Number.isInteger(r) || Math.abs(r - Math.round(r)) < 1e-9) {
    return `${Math.round(r)}`;
  }
  return r.toFixed(1).replace('.', ',');
}

export default function GradeItem({ grade, onDelete, onEdit, embedded = false }: GradeItemProps) {
  return (
    <View style={[styles.container, embedded && styles.containerEmbedded]}>
      <View style={styles.content}>
        <View style={styles.gradeSection}>
          <Text style={[styles.label, embedded && styles.labelEmbedded]}>Nota</Text>
          <GradeGlowValue
            grade={grade.grade}
            style={[styles.value, embedded && styles.valueEmbedded]}
            compact={embedded}
          >
            {grade.grade.toFixed(1)}
          </GradeGlowValue>
        </View>

        <View style={[styles.separator, embedded && styles.separatorEmbedded]} />

        <View style={styles.weightSection}>
          <Text style={[styles.label, embedded && styles.labelEmbedded]}>Peso</Text>
          <Text style={[styles.value, embedded && styles.valueEmbedded]}>
            {formatWeightPercent(grade.weight)}%
          </Text>
        </View>
      </View>

      <View style={[styles.actions, embedded && styles.actionsEmbedded]}>
        <TouchableOpacity
          style={[styles.editButton, embedded && styles.editButtonEmbedded]}
          onPress={() => onEdit(grade.id)}
          activeOpacity={0.7}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          accessibilityLabel="Editar nota"
        >
          <Text style={[styles.editIcon, embedded && styles.editIconEmbedded]}>✎</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.deleteButton, embedded && styles.deleteButtonEmbedded]}
          onPress={() => onDelete(grade.id)}
          activeOpacity={0.7}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          accessibilityLabel="Eliminar nota"
        >
          <Text style={[styles.deleteText, embedded && styles.deleteTextEmbedded]}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  gradeSection: {
    flex: 1,
    alignItems: 'center',
  },
  weightSection: {
    flex: 1,
    alignItems: 'center',
  },
  separator: {
    width: 1,
    height: 40,
    backgroundColor: '#333333',
    marginHorizontal: 16,
  },
  label: {
    ...fontApp,
    color: '#999999',
    fontSize: 12,
    marginBottom: 4,
  },
  value: {
    ...fontApp,
    color: '#FFFFFF',
    fontSize: 24,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  actionsEmbedded: {
    marginLeft: 4,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2a6bc7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  editButtonEmbedded: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 4,
  },
  editIcon: {
    ...fontApp,
    color: '#FFFFFF',
    fontSize: 18,
    marginTop: -1,
  },
  editIconEmbedded: {
    fontSize: 14,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 0,
  },
  deleteText: {
    ...fontApp,
    color: '#FFFFFF',
    fontSize: 20,
  },
  containerEmbedded: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginBottom: 6,
    borderRadius: 8,
  },
  labelEmbedded: {
    fontSize: 10,
    marginBottom: 2,
  },
  valueEmbedded: {
    fontSize: 15,
  },
  separatorEmbedded: {
    height: 28,
    marginHorizontal: 6,
  },
  deleteButtonEmbedded: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginLeft: 6,
  },
  deleteTextEmbedded: {
    fontSize: 14,
  },
});
