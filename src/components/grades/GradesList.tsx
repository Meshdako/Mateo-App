import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Grade } from '../../interfaces';
import { FONT_CALDSTONE_SEMIBOLD } from '../../constants/typography';
import GradeItem from './GradeItem';

const fontApp = { fontFamily: FONT_CALDSTONE_SEMIBOLD };

interface GradesListProps {
  grades: Grade[];
  onDeleteGrade: (id: string) => void;
  onEditGrade: (id: string) => void;
  /** Lista en columna estrecha junto al teclado. */
  embedded?: boolean;
}

export default function GradesList({
  grades,
  onDeleteGrade,
  onEditGrade,
  embedded = false,
}: GradesListProps) {
  const totalWeight = grades.reduce((sum, g) => sum + g.weight, 0);
  const totalWeightRounded = Math.round(totalWeight * 10) / 10;
  const totalWeightDisplay =
    Math.abs(totalWeightRounded - Math.round(totalWeightRounded)) < 1e-9
      ? `${Math.round(totalWeightRounded)}`
      : totalWeightRounded.toFixed(1).replace('.', ',');
  const weightOk = Math.abs(totalWeight - 100) < 0.051;

  if (grades.length === 0) {
    return (
      <View style={[styles.emptyContainer, embedded && styles.emptyContainerEmbedded]}>
        <Text style={[styles.emptyText, embedded && styles.emptyTextEmbedded]}>
          Sin notas aún
        </Text>
        <Text style={[styles.emptySubtext, embedded && styles.emptySubtextEmbedded]}>
          {embedded
            ? 'Agrega con +'
            : 'Ingresa una nota y su peso para comenzar'}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, embedded && styles.containerEmbedded]}>
      <View style={[styles.header, embedded && styles.headerEmbedded]}>
        <Text style={[styles.title, embedded && styles.titleEmbedded]}>Notas</Text>
        <View style={styles.totalWeightContainer}>
          <Text style={[styles.totalWeightLabel, embedded && styles.totalWeightLabelEmbedded]}>
            Σ%
          </Text>
          <Text
            style={[
              styles.totalWeightValue,
              embedded && styles.totalWeightValueEmbedded,
              !weightOk && styles.totalWeightWarning,
            ]}
          >
            {totalWeightDisplay}%
          </Text>
        </View>
      </View>

      <FlatList
        data={grades}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <GradeItem
            grade={item}
            onDelete={onDeleteGrade}
            onEdit={onEditGrade}
            embedded={embedded}
          />
        )}
        style={styles.list}
        showsVerticalScrollIndicator
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.listContent, embedded && styles.listContentEmbedded]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerEmbedded: {
    backgroundColor: '#0d0d0d',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    paddingHorizontal: 6,
    paddingTop: 6,
    overflow: 'hidden',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyContainerEmbedded: {
    paddingHorizontal: 6,
    minHeight: 80,
    flex: 1,
  },
  emptyText: {
    ...fontApp,
    color: '#FFFFFF',
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyTextEmbedded: {
    fontSize: 13,
    marginBottom: 4,
  },
  emptySubtext: {
    ...fontApp,
    color: '#999999',
    fontSize: 14,
    textAlign: 'center',
  },
  emptySubtextEmbedded: {
    fontSize: 11,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    flexShrink: 0,
  },
  headerEmbedded: {
    marginBottom: 4,
  },
  title: {
    ...fontApp,
    color: '#FFFFFF',
    fontSize: 16,
  },
  titleEmbedded: {
    fontSize: 13,
  },
  totalWeightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalWeightLabel: {
    ...fontApp,
    color: '#999999',
    fontSize: 14,
    marginRight: 6,
  },
  totalWeightLabelEmbedded: {
    fontSize: 11,
    marginRight: 4,
  },
  totalWeightValue: {
    ...fontApp,
    color: '#4CAF50',
    fontSize: 16,
  },
  totalWeightValueEmbedded: {
    fontSize: 13,
  },
  totalWeightWarning: {
    color: '#FF9800',
  },
  list: {
    flex: 1,
    flexGrow: 1,
  },
  listContent: {
    paddingBottom: 4,
  },
  listContentEmbedded: {
    paddingBottom: 2,
  },
});
