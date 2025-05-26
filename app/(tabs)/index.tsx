import IUIButton from '@/components/iui/IUIButton';
import IUIContainer from '@/components/iui/IUIContainer';
import IUIModal from '@/components/iui/IUIModal';
import type { ExerciseLog } from '@/components/workout/ExerciseLogTable';
import ExerciseLogTable, {
  createSetLog,
} from '@/components/workout/ExerciseLogTable';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

export default function WorkoutLog() {
  const [showModal, setShowModal] = useState(false);
  const workoutName = 'HI C&S';
  const [exercises, setExercises] = useState<
    (ExerciseLog<'loaded'> | ExerciseLog<'reps'> | ExerciseLog<'time'>)[]
  >([
    {
      name: 'Bench Press',
      type: 'loaded',
      sets: [createSetLog('loaded', true)],
    },
    {
      name: 'Sprints',
      type: 'time',
      sets: [createSetLog('time', true)],
    },
    {
      name: 'Skin the cat',
      type: 'reps',
      sets: [createSetLog('reps', true)],
    },
  ]);

  function updateExerciseLog<T extends 'loaded' | 'reps' | 'time'>(
    exercise: ExerciseLog<T>,
    update: Partial<ExerciseLog<T>>
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
    <IUIContainer>
      <WorkoutHeaderBar
        title={workoutName}
        onFinish={() => setShowModal(true)}
      />
      <ScrollView>
        {exercises.map((exercise, i) => {
          if (exercise.type == 'loaded') {
            return (
              <ExerciseLogTable
                key={exercise.name}
                name={exercise.name}
                type={exercise.type}
                sets={exercise.sets}
                setSets={(sets) => {
                  updateExerciseLog(exercise, { sets });
                }}
              />
            );
          }
          if (exercise.type == 'reps') {
            return (
              <ExerciseLogTable
                key={exercise.name}
                name={exercise.name}
                type={exercise.type}
                sets={exercise.sets}
                setSets={(sets) => {
                  updateExerciseLog(exercise, { sets });
                }}
              />
            );
          }
          if (exercise.type == 'time') {
            return (
              <ExerciseLogTable
                key={exercise.name}
                name={exercise.name}
                type={exercise.type}
                sets={exercise.sets}
                setSets={(sets) => {
                  updateExerciseLog(exercise, { sets });
                }}
              />
            );
          }
        })}
      </ScrollView>
      <WOFinishModal
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      />
    </IUIContainer>
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
