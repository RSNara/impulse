import IUIButton from '@/components/iui/IUIButton';
import IUIContainer from '@/components/iui/IUIContainer';
import IUIModal from '@/components/iui/IUIModal';
import type {
  ExerciseLog,
  SetLog,
} from '@/components/workout/ExerciseLogTable';
import ExerciseLogTable from '@/components/workout/ExerciseLogTable';
import type { AnyExercise, Exercise, ExerciseType } from '@/data/exercises';
import Exercises from '@/data/exercises';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';

function assertNever(x: never): never {
  throw new Error('Unexpected value: ' + x);
}

function createExerciseLog<T extends ExerciseType>(
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

  function addExercise(exercise: AnyExercise) {
    setExerciseLogs([...exerciseLogs, createExerciseLog(exercise)]);
  }

  function removeExerciseLog(
    exerciseLog:
      | ExerciseLog<'loaded'>
      | ExerciseLog<'reps'>
      | ExerciseLog<'time'>
  ) {
    setExerciseLogs(
      exerciseLogs.filter((otherExerciseLog) => exerciseLog != otherExerciseLog)
    );
  }

  function updateExerciseLog<T extends ExerciseType>(
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
                onRemove={() => removeExerciseLog(exerciseLog)}
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
                onRemove={() => removeExerciseLog(exerciseLog)}
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
                onRemove={() => removeExerciseLog(exerciseLog)}
                setSets={(sets) => {
                  updateExerciseLog(exerciseLog, { sets });
                }}
              />
            );
          }
        })}
      </ScrollView>
      <View style={{ marginHorizontal: 10, marginVertical: 20 }}>
        <IUIButton
          type="secondary"
          feeling="positive"
          onPress={() => {
            setShowAddExerciseModal(true);
          }}
        >
          + Add Exercise
        </IUIButton>
      </View>

      <FinishWorkoutModal
        visible={showFinishWorkoutModal}
        onRequestClose={() => setShowFinishWorkoutModal(false)}
      />
      <AddExerciseModal
        visible={showAddExerciseModal}
        alreadyPicked={new Set(exerciseLogs.map((log) => log.name))}
        onRequestClose={(exercise) => {
          if (exercise) {
            addExercise(exercise);
          }
          setShowAddExerciseModal(false);
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
      <IUIButton type="primary" feeling="done" onPress={onFinish}>
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
      <View style={{ marginBottom: 10 }}>
        <IUIButton
          type="primary"
          feeling="done"
          onPress={() => {
            router.back();
          }}
        >
          Finish Workout
        </IUIButton>
      </View>

      <View style={{ marginBottom: 10 }}>
        <IUIButton
          type="secondary"
          feeling="negative"
          onPress={() => {
            router.back();
          }}
        >
          Finish Workout
        </IUIButton>
      </View>
    </IUIModal>
  );
}

function AddExerciseModal({
  visible,
  alreadyPicked,
  onRequestClose,
}: {
  visible: boolean;
  alreadyPicked: Set<string>;
  onRequestClose: (exercise?: AnyExercise | null) => void;
}) {
  const [selectedExercise, setSelectedExercise] = useState<AnyExercise | null>(
    null
  );
  return (
    <IUIModal visible={visible} onRequestClose={() => onRequestClose(null)}>
      <View style={{ alignItems: 'center', paddingBottom: 10 }}>
        <Text style={{ fontWeight: 'bold' }}>Add Exercise?</Text>
      </View>
      <FlatList<AnyExercise>
        data={Exercises.filter((exercise) => !alreadyPicked.has(exercise.name))}
        keyExtractor={(info) => info.name.replaceAll(' ', '-')}
        style={{ paddingBottom: 10 }}
        renderItem={(info) => {
          const exercise = info.item;
          const isSelected = selectedExercise == exercise;
          return (
            <ExerciseRow
              exercise={exercise}
              isSelected={selectedExercise == exercise}
              onPress={() => {
                setSelectedExercise(isSelected ? null : exercise);
              }}
            />
          );
        }}
      />
      <View style={{ marginVertical: 10 }}>
        <IUIButton
          type="secondary"
          feeling="positive"
          onPress={() => {
            onRequestClose(selectedExercise);
          }}
        >
          Add Exercise
        </IUIButton>
      </View>
    </IUIModal>
  );
}

function ExerciseRow({
  exercise,
  isSelected,
  onPress,
}: {
  exercise: AnyExercise;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderColor: 'rgba(0, 127, 255, 0.05)',
        borderRadius: 5,
        ...(isSelected
          ? {
              borderWidth: 1,
              borderBottomWidth: 3,
              backgroundColor: 'rgba(0, 127, 255, 0.05)',
              marginBottom: 4,
            }
          : {
              borderWidth: 1,
              marginBottom: 6,
            }),
      }}
    >
      <Text style={{ fontWeight: 'bold', color: 'rgba(0, 127, 255, 1)' }}>
        {exercise.name}
      </Text>
    </Pressable>
  );
}
