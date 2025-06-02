import IUIButton from '@/components/iui/IUIButton';
import IUIContainer from '@/components/iui/IUIContainer';
import IUIModal from '@/components/iui/IUIModal';
import { IUIStringTextInput } from '@/components/iui/IUITextInput';
import ExerciseLogTable from '@/components/workout/ExerciseLogTable';
import {
  createExerciseLog,
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
import assertNever from '@/utils/assertNever';
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
        {exerciseLogs.map((exerciseLog) => {
          switch (exerciseLog.type) {
            case 'weights':
              return (
                <ExerciseLogTable<'weights'>
                  type="weights"
                  key={exerciseLog.name}
                  log={exerciseLog}
                  pastLog={pastExerciseLog<'weights'>(exerciseLog)}
                  onRemove={() => removeExerciseLog(exerciseLog)}
                  setSetLogs={(setLogs) => {
                    updateExerciseLog(exerciseLog, { setLogs });
                  }}
                />
              );
            case 'reps':
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
            case 'time':
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
            default:
              assertNever(exerciseLog);
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
  const [exercises, setExercises] = useExercises();

  const exerciseGroups = dedupe(exercises.map((exercise) => exercise.group));
  const [selectedGroup, setSelectedGroup] = useState<ExerciseGroup>(
    exerciseGroups[0]
  );
  const page = exerciseGroups.indexOf(selectedGroup);

  const flatListRef = useRef<FlatList>(null);

  const [showCreateExerciseModal, setShowCreateExerciseModal] = useState(false);

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
            <View key={group} style={{ marginBottom: 10, marginEnd: 10 }}>
              <ExerciseGroup
                group={group}
                isSelected={group == selectedGroup}
                onSelect={() => setSelectedGroup(group)}
              />
            </View>
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
            <ExerciseList
              listWidth={listWidth}
              exercises={exercises.filter((exercise) => {
                return (
                  !alreadyPicked.has(exercise.name) &&
                  exercise.group == info.item
                );
              })}
              selectedExercise={selectedExercise}
              setSelectedExercise={setSelectedExercise}
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

      <View style={{ marginBottom: 10 }}>
        <IUIButton
          type="secondary"
          feeling="neutral"
          onPress={() => {
            setShowCreateExerciseModal(true);
          }}
        >
          Create Exercise
        </IUIButton>
      </View>

      <CreateExerciseModal
        visible={showCreateExerciseModal}
        exerciseGroups={exerciseGroups}
        exerciseNames={new Set(exercises.map((exercise) => exercise.name))}
        onRequestClose={(exercise: AnyExercise | null) => {
          setShowCreateExerciseModal(false);
          if (exercise != null) {
            setExercises([...exercises, exercise]);
            setSelectedGroup(exercise.group);
            setSelectedExercise(exercise);
          }
        }}
      />
    </IUIModal>
  );
}

function ExerciseList({
  listWidth,
  exercises,
  selectedExercise,
  setSelectedExercise,
}: {
  listWidth: number | null;
  exercises: ReadonlyArray<AnyExercise>;
  selectedExercise: AnyExercise | null;
  setSelectedExercise: (exercise: AnyExercise) => void;
}) {
  return (
    <FlatList<AnyExercise>
      data={exercises}
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
}

function CreateExerciseModal({
  visible,
  onRequestClose,
  exerciseGroups,
  exerciseNames,
}: {
  visible: boolean;
  onRequestClose: (exercise: AnyExercise | null) => void;
  exerciseGroups: ReadonlyArray<ExerciseGroup>;
  exerciseNames: Set<string>;
}) {
  const [exerciseName, setExerciseName] = useState('');
  const [exerciseType, setExerciseType] = useState<ExerciseType | null>(null);
  const [exerciseGroup, setExerciseGroup] = useState<ExerciseGroup | null>(
    null
  );

  function onClose(exercise: AnyExercise | null) {
    onRequestClose(exercise);
    if (exercise != null) {
      setExerciseName('');
      setExerciseGroup(null);
      setExerciseType(null);
    }
  }
  return (
    <IUIModal visible={visible} onRequestClose={() => onClose(null)}>
      <View style={{ alignItems: 'center', marginBottom: 15 }}>
        <Text style={{ fontWeight: 'bold' }}>Create Exercise?</Text>
      </View>
      <View style={{ marginBottom: 15 }}>
        <View style={{ flexDirection: 'row', marginBottom: 5 }}>
          <Text style={{ fontWeight: 'bold' }}>Exercise Name </Text>
          <Text style={{ color: 'red' }}>
            {exerciseNames.has(exerciseName.trim()) ? '(taken)' : ''}
          </Text>
        </View>

        <IUIStringTextInput value={exerciseName} onChange={setExerciseName} />
      </View>

      <View style={{ marginBottom: 5 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>
          Exercise Type
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {(['weights', 'reps', 'time'] as ExerciseType[]).map((type) => {
            return (
              <View key={type} style={{ marginBottom: 10, marginEnd: 10 }}>
                <ExerciseType
                  type={type}
                  isSelected={exerciseType == type}
                  onSelect={() => {
                    setExerciseType(type);
                  }}
                />
              </View>
            );
          })}
        </View>
      </View>

      <View style={{ marginBottom: 5 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>
          Exercise Group
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {exerciseGroups.map((group) => {
            return (
              <View key={group} style={{ marginBottom: 10, marginEnd: 10 }}>
                <ExerciseGroup
                  group={group}
                  isSelected={exerciseGroup == group}
                  onSelect={() => {
                    setExerciseGroup(group);
                  }}
                />
              </View>
            );
          })}
        </View>
      </View>

      <View style={{ marginBottom: 10, marginTop: 5 }}>
        <IUIButton
          type="secondary"
          feeling="positive"
          disabled={
            exerciseType == null ||
            exerciseGroup == null ||
            exerciseName.trim() == '' ||
            exerciseNames.has(exerciseName.trim())
          }
          onPress={() => {
            if (
              exerciseType == null ||
              exerciseGroup == null ||
              exerciseName.trim() == '' ||
              exerciseNames.has(exerciseName.trim())
            ) {
              return;
            }
            onClose({
              type: exerciseType,
              group: exerciseGroup,
              name: exerciseName,
            });
          }}
        >
          Create Exercise
        </IUIButton>
      </View>
    </IUIModal>
  );
}

function ExerciseType({
  type,
  onSelect = () => {},
  isSelected,
  abbreviated = false,
}: {
  type: ExerciseType;
  onSelect?: () => void;
  isSelected: boolean;
  abbreviated?: boolean;
}) {
  const text = abbreviated
    ? type === 'reps'
      ? '🔁'
      : type === 'weights'
      ? '🏋'
      : '⏳'
    : type;
  return (
    <View
      style={{
        minWidth: abbreviated ? 35 : 75,
      }}
    >
      <IUIButton
        type={abbreviated ? 'tertiary' : isSelected ? 'primary' : 'secondary'}
        feeling="mild"
        onPress={() => {
          onSelect();
        }}
      >
        {text}
      </IUIButton>
    </View>
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
      style={{
        minWidth: 70,
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
        paddingVertical: 5,
        borderRadius: 5,
        borderColor: 'rgba(0, 127, 255, 0.1)',
        borderBottomWidth: 1,
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
      <View
        style={{
          flexDirection: 'row',
          flex: 1,
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontWeight: 'bold', color: 'rgba(0, 127, 255, 1)' }}>
          {exercise.name}
        </Text>
        <ExerciseType
          type={exercise.type}
          isSelected={isSelected}
          abbreviated
        />
      </View>
    </Pressable>
  );
}

function dedupe<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}
