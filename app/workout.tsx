import IUIButton from '@/components/iui/IUIButton';
import IUIModal from '@/components/iui/IUIModal';
import type { Exercise } from '@/components/workout/Exercise';
import ExerciseTable, { createSet } from '@/components/workout/Exercise';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';

export default function WorkoutLog() {
  const [showModal, setShowModal] = useState(false);
  const workoutName = 'HI C&S';
  const [exercises, setExercises] = useState<
    (Exercise<'loaded'> | Exercise<'reps'> | Exercise<'time'>)[]
  >([
    {
      name: 'Bench Press',
      type: 'loaded',
      sets: [createSet('loaded', 'w')],
    },
    {
      name: 'Sprints',
      type: 'time',
      sets: [createSet('time', 'w')],
    },
    {
      name: 'Skin the cat',
      type: 'reps',
      sets: [createSet('reps', 'w')],
    },
  ]);

  function updateExercise<T extends 'loaded' | 'reps' | 'time'>(
    exercise: Exercise<T>,
    update: Partial<Exercise<T>>
  ) {
    setExercises(
      exercises.map((otherExercise) => {
        return exercise == otherExercise
          ? { ...exercise, ...update }
          : otherExercise;
      })
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      <View>
        <WorkoutHeaderBar
          title={workoutName}
          onFinish={() => setShowModal(true)}
        />
        <ScrollView>
          {exercises.map((exercise, i) => {
            if (exercise.type == 'loaded') {
              return (
                <ExerciseTable
                  key={exercise.name}
                  name={exercise.name}
                  type={exercise.type}
                  sets={exercise.sets}
                  setSets={(sets) => {
                    updateExercise(exercise, { sets });
                  }}
                />
              );
            }
            if (exercise.type == 'reps') {
              return (
                <ExerciseTable
                  key={exercise.name}
                  name={exercise.name}
                  type={exercise.type}
                  sets={exercise.sets}
                  setSets={(sets) => {
                    updateExercise(exercise, { sets });
                  }}
                />
              );
            }
            if (exercise.type == 'time') {
              return (
                <ExerciseTable
                  key={exercise.name}
                  name={exercise.name}
                  type={exercise.type}
                  sets={exercise.sets}
                  setSets={(sets) => {
                    updateExercise(exercise, { sets });
                  }}
                />
              );
            }
          })}
        </ScrollView>
      </View>
      <WOFinishModal
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      />
    </SafeAreaView>
  );
}

function WorkoutHeaderBar({
  title,
  onFinish,
}: {
  title: string;
  onFinish: () => void;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
      }}
    >
      <View>
        <Text style={{ fontWeight: 'bold' }}>{title}</Text>
      </View>
      <IUIButton type="positive" onPress={onFinish}>
        Finish
      </IUIButton>
    </View>
  );
}

function WOFinishModal({
  visible,
  onRequestClose,
}: {
  visible: boolean;
  onRequestClose: () => void;
}) {
  const router = useRouter();
  return (
    <IUIModal visible={visible} onRequestClose={onRequestClose}>
      <View style={{ alignItems: 'center', padding: 20 }}>
        <Text style={{ fontWeight: 'bold' }}>🙌</Text>
      </View>
      <View style={{ alignItems: 'center', paddingBottom: 20 }}>
        <Text style={{ fontWeight: 'bold' }}>Finished Workout?</Text>
      </View>
      <IUIButton
        type="positive"
        onPress={() => {
          router.back();
        }}
        style={{ marginBottom: 10 }}
      >
        Finish Workout
      </IUIButton>
      <IUIButton
        type="negative"
        onPress={() => {
          router.back();
        }}
        style={{ marginBottom: 10 }}
      >
        Cancel Workout
      </IUIButton>
    </IUIModal>
  );
}
