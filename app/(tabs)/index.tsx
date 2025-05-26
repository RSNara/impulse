import IUIButton from '@/components/iui/IUIButton';
import IUIContainer from '@/components/iui/IUIContainer';
import IUIModal from '@/components/iui/IUIModal';
import type {
  ExerciseLog,
  SetLog,
} from '@/components/workout/ExerciseLogTable';
import ExerciseLogTable from '@/components/workout/ExerciseLogTable';
import type { AnyExercise, Exercise } from '@/data/exercises';
import Exercises from '@/data/exercises';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';

function assertNever(x: never): never {
  throw new Error('Unexpected value: ' + x);
}

function createExerciseLog<T extends 'loaded' | 'reps' | 'time'>(
  exercise: Exercise<T>
): ExerciseLog<T> {
  if (exercise.type == 'loaded') {
    return {
      name: exercise.name,
      type: exercise.type,
      sets: [] as SetLog<'loaded'>[],
    } as ExerciseLog<'loaded'> as ExerciseLog<T>;
  }

  if (exercise.type == 'reps') {
    return {
      name: exercise.name,
      type: exercise.type,
      sets: [] as SetLog<'reps'>[],
    } as ExerciseLog<'reps'> as ExerciseLog<T>;
  }

  if (exercise.type == 'time') {
    return {
      name: exercise.name,
      type: exercise.type,
      sets: [] as SetLog<'time'>[],
    } as ExerciseLog<'time'> as ExerciseLog<T>;
  }

  assertNever(exercise);
}

export default function WorkoutScreen() {
  const [showFinishWorkoutModal, setShowFinishWorkoutModal] = useState(false);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const workoutName = 'HI C&S';
  const [exerciseLogs, setExerciseLogs] = useState<
    (ExerciseLog<'loaded'> | ExerciseLog<'reps'> | ExerciseLog<'time'>)[]
  >([]);

  function addExercise<T extends 'loaded' | 'reps' | 'time'>(
    exercise: Exercise<T>
  ) {
    setExerciseLogs([...exerciseLogs, createExerciseLog(exercise)]);
  }

  function updateExerciseLog<T extends 'loaded' | 'reps' | 'time'>(
    exerciseLog: ExerciseLog<T>,
    update: Partial<ExerciseLog<T>>
  ) {
    setExerciseLogs(
      exerciseLogs.map((otherExerciseLog) => {
        return exerciseLog == otherExerciseLog
          ? { ...exerciseLog, ...update }
          : otherExerciseLog;
      })
    );
  }

  return (
    <IUIContainer>
      <WorkoutHeaderBar
        title={workoutName}
        onFinish={() => setShowFinishWorkoutModal(true)}
      />
      <ScrollView>
        {exerciseLogs.map((exerciseLog, i) => {
          if (exerciseLog.type == 'loaded') {
            return (
              <ExerciseLogTable
                key={exerciseLog.name}
                name={exerciseLog.name}
                type={exerciseLog.type}
                sets={exerciseLog.sets}
                setSets={(sets) => {
                  updateExerciseLog(exerciseLog, { sets });
                }}
              />
            );
          }
          if (exerciseLog.type == 'reps') {
            return (
              <ExerciseLogTable
                key={exerciseLog.name}
                name={exerciseLog.name}
                type={exerciseLog.type}
                sets={exerciseLog.sets}
                setSets={(sets) => {
                  updateExerciseLog(exerciseLog, { sets });
                }}
              />
            );
          }
          if (exerciseLog.type == 'time') {
            return (
              <ExerciseLogTable
                key={exerciseLog.name}
                name={exerciseLog.name}
                type={exerciseLog.type}
                sets={exerciseLog.sets}
                setSets={(sets) => {
                  updateExerciseLog(exerciseLog, { sets });
                }}
              />
            );
          }
        })}
        <IUIButton
          style={{ marginHorizontal: 10, marginVertical: 5 }}
          type={'positive'}
          onPress={() => {
            setShowAddExerciseModal(true);
          }}
        >
          + Add Exercise
        </IUIButton>
      </ScrollView>
      <FinishWorkoutModal
        visible={showFinishWorkoutModal}
        onRequestClose={() => setShowFinishWorkoutModal(false)}
      />
      <AddExerciseModal
        visible={showAddExerciseModal}
        onRequestClose={(exercise) => {
          if (exercise) {
            addExercise(exercise);
            setShowAddExerciseModal(false);
          }
        }}
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

function FinishWorkoutModal({
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

function AddExerciseModal({
  visible,
  onRequestClose,
}: {
  visible: boolean;
  onRequestClose: (exercise?: AnyExercise | null) => void;
}) {
  const router = useRouter();
  return (
    <IUIModal visible={visible} onRequestClose={() => onRequestClose(null)}>
      <View style={{ alignItems: 'center', paddingBottom: 20 }}>
        <Text style={{ fontWeight: 'bold' }}>Add Exercise?</Text>
      </View>
      <FlatList<AnyExercise>
        data={Exercises.slice(0, 10)}
        keyExtractor={(info) => info.name.replaceAll(' ', '-')}
        renderItem={(info) => {
          const exercise = info.item;
          return (
            <Pressable
              style={{ padding: 10 }}
              onPress={() => {
                onRequestClose(exercise);
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Text style={{ fontWeight: 'bold' }}>{exercise.name}</Text>
              </View>
            </Pressable>
          );
        }}
      />
    </IUIModal>
  );
}
