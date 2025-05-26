import IUIContainer from '@/components/iui/IUIContainer';
import type { AnyExercise } from '@/data/exercises';
import Exercises from '@/data/exercises';
import { FlatList, StyleSheet, Text, View } from 'react-native';

export default function ExercisesScreen() {
  return (
    <IUIContainer>
      <FlatList<AnyExercise>
        data={Exercises}
        renderItem={(info) => {
          const exercise = info.item;
          return (
            <View style={styles.exercise}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Text style={{ fontWeight: 'bold' }}>{exercise.name}</Text>
              </View>
            </View>
          );
        }}
      />
    </IUIContainer>
  );
}

const styles = StyleSheet.create({
  exercise: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
});
