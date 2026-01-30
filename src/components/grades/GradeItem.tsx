import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Grade } from '../../interfaces';

interface GradeItemProps {
  grade: Grade;
  onDelete: (id: string) => void;
}

export default function GradeItem({ grade, onDelete }: GradeItemProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.gradeSection}>
          <Text style={styles.label}>Nota</Text>
          <Text style={styles.value}>{grade.grade.toFixed(1)}</Text>
        </View>
        
        <View style={styles.separator} />
        
        <View style={styles.weightSection}>
          <Text style={styles.label}>Peso</Text>
          <Text style={styles.value}>{grade.weight}%</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => onDelete(grade.id)}
        activeOpacity={0.7}
      >
        <Text style={styles.deleteText}>✕</Text>
      </TouchableOpacity>
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
    color: '#999999',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  value: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  deleteText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
});
