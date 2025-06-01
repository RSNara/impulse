import IUIButton from '@/components/iui/IUIButton';
import IUIContainer from '@/components/iui/IUIContainer';
import IUIModal from '@/components/iui/IUIModal';
import ExerciseLogTable from '@/components/workout/ExerciseLogTable';
import createExerciseLog from '@/components/workout/ExerciseLogTable/createExerciseLog';
import {
  emptyWorkout,
  useCurrentWorkout,
  useExercises,
  usePastWorkouts,
  type AnyExercise,
  type AnyExerciseLog,
  type ExerciseGroup,
  type ExerciseLog,
  type ExerciseType,
} from '@/data/store';
import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function WorkoutScreen() {
  const [showFinishWorkoutModal, setShowFinishWorkoutModal] = useState(false);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);

  const [currentWorkout, setCurrentWorkout] = useCurrentWorkout();
  const [pastWorkouts, setPastWorkouts] = usePastWorkouts();

  const exerciseLogs = currentWorkout.exerciseLogs;
  function setExerciseLogs(exerciseLogs: AnyExerciseLog[]) {
    setCurrentWorkout({
      ...currentWorkout,
      exerciseLogs: exerciseLogs,
    });
  }

  function addExercise(exercise: AnyExercise) {
    setExerciseLogs([...exerciseLogs, createExerciseLog(exercise)]);
  }

  function removeExerciseLog(exerciseLog: AnyExerciseLog) {
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

  function finishWorkout() {
    setCurrentWorkout(emptyWorkout());
    setPastWorkouts([currentWorkout, ...pastWorkouts]);
  }

  const canFinishWorkout =
    exerciseLogs.length != 0 &&
    exerciseLogs.every(
      (exerciseLog) =>
        exerciseLog.setLogs.length != 0 &&
        exerciseLog.setLogs.every((setLog) => setLog.done)
    );

  function pastExerciseLog<T extends ExerciseType>(
    exerciseLog: ExerciseLog<T>
  ): ExerciseLog<T> | null {
    for (const workout of pastWorkouts) {
      for (const pastExerciseLog of workout.exerciseLogs) {
        if (
          pastExerciseLog.name == exerciseLog.name &&
          pastExerciseLog.type == exerciseLog.type
        ) {
          return pastExerciseLog as ExerciseLog<T>;
        }
      }
    }
    return null;
  }

  return (
    <IUIContainer>
      <WorkoutHeader
        name={currentWorkout.name || ''}
        setName={(name) => {
          setCurrentWorkout({
            ...currentWorkout,
            name,
          });
        }}
        disableFinish={!canFinishWorkout}
        onFinish={() => {
          setShowFinishWorkoutModal(true);
        }}
      />
      <ScrollView>
        {exerciseLogs.map((exerciseLog, i) => {
          if (exerciseLog.type == 'loaded') {
            return (
              <ExerciseLogTable<'loaded'>
                type="loaded"
                key={exerciseLog.name}
                log={exerciseLog}
                pastLog={pastExerciseLog<'loaded'>(exerciseLog)}
                onRemove={() => removeExerciseLog(exerciseLog)}
                setSetLogs={(setLogs) => {
                  updateExerciseLog(exerciseLog, { setLogs });
                }}
              />
            );
          }
          if (exerciseLog.type == 'reps') {
            return (
              <ExerciseLogTable<'reps'>
                type="reps"
                key={exerciseLog.name}
                log={exerciseLog}
                pastLog={pastExerciseLog<'reps'>(exerciseLog)}
                onRemove={() => removeExerciseLog(exerciseLog)}
                setSetLogs={(setLogs) => {
                  updateExerciseLog(exerciseLog, { setLogs });
                }}
              />
            );
          }
          if (exerciseLog.type == 'time') {
            return (
              <ExerciseLogTable<'time'>
                type="time"
                key={exerciseLog.name}
                log={exerciseLog}
                pastLog={pastExerciseLog<'time'>(exerciseLog)}
                onRemove={() => removeExerciseLog(exerciseLog)}
                setSetLogs={(setLogs) => {
                  updateExerciseLog(exerciseLog, { setLogs });
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
        onRequestClose={(finished) => {
          setShowFinishWorkoutModal(false);
          if (finished) {
            finishWorkout();
          }
        }}
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

function WorkoutHeader({
  name,
  setName,
  disableFinish,
  onFinish,
}: {
  name: string;
  setName: (name: string) => void;
  disableFinish: boolean;
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
      <View style={{ flexDirection: 'row' }}>
        <Text>✍️ </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={{ fontWeight: 'bold' }}
        />
      </View>
      <View style={{ flexDirection: 'row' }}>
        <IUIButton
          type="primary"
          feeling="done"
          disabled={disableFinish}
          onPress={onFinish}
        >
          Finish
        </IUIButton>
      </View>
    </View>
  );
}

function FinishWorkoutModal({
  visible,
  onRequestClose,
}: {
  visible: boolean;
  onRequestClose: (finished: boolean) => void;
}) {
  return (
    <IUIModal visible={visible} onRequestClose={() => onRequestClose(false)}>
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
            onRequestClose(true);
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
  const [listWidth, setListWidth] = useState<number | null>(null);
  const [exercises] = useExercises();

  const exerciseGroups = dedupe(exercises.map((exercise) => exercise.group));
  const [selectedGroup, setSelectedGroup] = useState<ExerciseGroup>(
    exerciseGroups[0]
  );
  const page = exerciseGroups.indexOf(selectedGroup);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({
        animated: true,
        index: page,
      });
    }
  }, [page]);

  function close(exercise?: AnyExercise | null) {
    onRequestClose(exercise);
    setTimeout(() => {
      setSelectedExercise(null);
      setSelectedGroup(exerciseGroups[0]);
    }, 1000);
  }

  return (
    <IUIModal
      visible={visible}
      onRequestClose={() => {
        close(null);
      }}
      onReceiveSize={({ width, height }) => {
        setListWidth(width);
      }}
    >
      <View style={{ alignItems: 'center', marginBottom: 15 }}>
        <Text style={{ fontWeight: 'bold' }}>Add Exercise?</Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {exerciseGroups.map((group, i) => {
          return (
            <ExerciseGroup
              key={group}
              group={group}
              isSelected={group == selectedGroup}
              onSelect={() => setSelectedGroup(group)}
            />
          );
        })}
      </View>

      <FlatList
        ref={flatListRef}
        horizontal={true}
        data={exerciseGroups}
        keyExtractor={(item) => item}
        scrollEnabled={false}
        style={{
          marginTop: 5,
          marginBottom: 15,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderRadius: 5,
          borderColor: 'rgba(0, 127, 255, 0.1)',
        }}
        renderItem={(info) => {
          return (
            <FlatList<AnyExercise>
              data={exercises.filter((exercise) => {
                return (
                  !alreadyPicked.has(exercise.name) &&
                  exercise.group == info.item
                );
              })}
              keyExtractor={(info) => info.name.replaceAll(' ', '-')}
              style={{
                paddingBottom: 10,
                width: listWidth ? listWidth : undefined,
              }}
              renderItem={(info) => {
                const exercise = info.item;
                const isSelected = selectedExercise == exercise;

                return (
                  <Exercise
                    exercise={exercise}
                    isSelected={isSelected}
                    onPress={() => {
                      setSelectedExercise(exercise);
                    }}
                  ></Exercise>
                );
              }}
            />
          );
        }}
      />

      <View style={{ marginBottom: 10 }}>
        <IUIButton
          type="secondary"
          feeling="positive"
          disabled={selectedExercise == null}
          onPress={() => {
            close(selectedExercise);
          }}
        >
          Add Exercise
        </IUIButton>
      </View>
    </IUIModal>
  );
}

function ExerciseGroup({
  group,
  onSelect,
  isSelected,
}: {
  group: ExerciseGroup;
  onSelect: () => void;
  isSelected: boolean;
}) {
  return (
    <View
      key={group}
      style={{
        marginBottom: 10,
        marginRight: 10,
        minWidth: 65,
      }}
    >
      <IUIButton
        type={isSelected ? 'primary' : 'secondary'}
        feeling="done"
        onPress={() => {
          onSelect();
        }}
      >
        {group}
      </IUIButton>
    </View>
  );
}

function Exercise({
  exercise,
  isSelected,
  onPress,
}: {
  exercise: AnyExercise;
  isSelected: boolean;
  onPress: () => void;
}) {
  const paddingHorizontal = 10;
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal,
        paddingVertical: 10,
        borderRadius: 5,
        ...(isSelected
          ? {
              backgroundColor: 'rgba(0, 127, 255, 0.05)',
              borderStartWidth: 2,
              borderEndWidth: 2,
              paddingHorizontal: paddingHorizontal - 2,
              borderColor: 'rgba(0, 127, 255, 0.05)',
            }
          : {}),
      }}
    >
      <Text style={{ fontWeight: 'bold', color: 'rgba(0, 127, 255, 1)' }}>
        {exercise.name}
      </Text>
    </Pressable>
  );
}

function dedupe<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}
