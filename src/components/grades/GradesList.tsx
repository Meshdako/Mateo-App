import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Grade } from '../../interfaces';
import GradeItem from './GradeItem';

interface GradesListProps {
  grades: Grade[];
  onDeleteGrade: (id: string) => void;
  weightedAverage: number;
}

export default function GradesList({ 
  grades, 
  onDeleteGrade,
  weightedAverage 
}: GradesListProps) {
  const totalWeight = grades.reduce((sum, g) => sum + g.weight, 0);

  if (grades.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No hay notas ingresadas</Text>
        <Text style={styles.emptySubtext}>Ingresa una nota y su peso para comenzar</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notas ingresadas</Text>
        <View style={styles.totalWeightContainer}>
          <Text style={styles.totalWeightLabel}>Peso total:</Text>
          <Text style={[
            styles.totalWeightValue,
            totalWeight !== 100 && styles.totalWeightWarning
          ]}>
            {totalWeight}%
          </Text>
        </View>
      </View>

      <FlatList
        data={grades}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <GradeItem grade={item} onDelete={onDeleteGrade} />
        )}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.averageContainer}>
        <Text style={styles.averageLabel}>Promedio Ponderado</Text>
        <Text style={styles.averageValue}>
          {weightedAverage.toFixed(2)}
        </Text>
        {totalWeight !== 100 && (
          <Text style={styles.warningText}>
            ⚠️ El peso total debe ser 100%
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#999999',
    fontSize: 14,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  totalWeightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalWeightLabel: {
    color: '#999999',
    fontSize: 14,
    marginRight: 6,
  },
  totalWeightValue: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '700',
  },
  totalWeightWarning: {
    color: '#FF9800',
  },
  list: {
    flex: 1,
  },
  averageContainer: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
    alignItems: 'center',
  },
  averageLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  averageValue: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '700',
  },
  warningText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
});
