import IUIButton from '@/components/iui/IUIButton';
import IUIContainer from '@/components/iui/IUIContainer';
import IUIDelayedStubber from '@/components/iui/IUIDelayedStubber';
import IUIModal from '@/components/iui/IUIModal';
import IUISwipeToReveal from '@/components/iui/IUISwipeToReveal';
import { IUIStringTextInput } from '@/components/iui/IUITextInput';
import ExerciseLogTable from '@/components/workout/ExerciseLogTable';
import {
  AllMuscleGroups,
  createExercise,
  createExerciseLog,
  emptyWorkout,
  useCurrentWorkout,
  useExercises,
  usePastWorkouts,
  type AnyExercise,
  type AnyExerciseLog,
  type ExerciseLog,
  type ExerciseType,
  type MuscleGroup,
} from '@/data/store';
import assertNever from '@/utils/assertNever';
import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
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

  function addExercises(exercises: ReadonlyArray<AnyExercise>) {
    setExerciseLogs([
      ...exerciseLogs,
      ...exercises.map((exercise) => createExerciseLog(exercise)),
    ]);
  }

  function removeExerciseLog(exerciseLog: AnyExerciseLog) {
    setExerciseLogs(
      exerciseLogs.filter((otherExerciseLog) => exerciseLog != otherExerciseLog)
    );
  }

  const [exercises, setExercises] = useExercises();
  const exerciseMap: { [id: string]: AnyExercise } = exercises.reduce(
    (map, exercise) => {
      return {
        ...map,
        [exercise.id]: exercise,
      };
    },
    {}
  );

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
        if (pastExerciseLog.exerciseId == exerciseLog.exerciseId) {
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
          const exercise = exerciseMap[exerciseLog.exerciseId];
          switch (exerciseLog.type) {
            case 'weights':
              return (
                <ExerciseLogTable<'weights'>
                  type="weights"
                  key={exerciseLog.id}
                  name={exercise.name}
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
                  key={exerciseLog.id}
                  name={exercise.name}
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
                  key={exerciseLog.id}
                  name={exercise.name}
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
        exercisesInWorkout={new Set(exerciseLogs.map((log) => log.exerciseId))}
        exercises={exercises}
        setExercises={setExercises}
        onRequestClose={(exercisesSelected) => {
          addExercises(exercisesSelected);
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
  exercisesInWorkout,
  onRequestClose,
  exercises,
  setExercises,
}: {
  visible: boolean;
  exercisesInWorkout: Set<string>;
  onRequestClose: (exercises: ReadonlyArray<AnyExercise>) => void;
  exercises: ReadonlyArray<AnyExercise>;
  setExercises: (exercises: ReadonlyArray<AnyExercise>) => void;
}) {
  const [exercisesSelected, setSelectedExercises] = useState<
    ReadonlyArray<AnyExercise>
  >([]);
  const [listWidth, setListWidth] = useState<number | null>(null);

  function updateExercise(
    exercise: AnyExercise,
    partial: Partial<AnyExercise>
  ) {
    setExercises(
      exercises.map((other) => {
        if (other == exercise) {
          return { ...other, ...partial };
        }

        return other;
      })
    );
  }

  const muscleGroups = dedupe(exercises.map((exercise) => exercise.group));
  const [selectedGroup, setSelectedGroup] = useState<MuscleGroup>(
    muscleGroups[0]
  );

  const flatListRef = useRef<FlatList>(null);

  const [showCreateExerciseModal, setShowCreateExerciseModal] = useState(false);
  const [exerciseToEdit, setExerciseToEdit] = useState<AnyExercise | null>(
    null
  );

  function close(exercises: ReadonlyArray<AnyExercise>) {
    onRequestClose(exercises);
    setTimeout(() => {
      setSelectedExercises([]);
      setSelectedGroup(muscleGroups[0]);
    }, 1000);
  }

  return (
    <IUIModal
      visible={visible}
      onRequestClose={() => {
        close([]);
      }}
      onReceiveSize={({ width, height }) => {
        setListWidth(width);
      }}
    >
      <View
        style={{
          alignItems: 'center',
          marginBottom: 15,
        }}
      >
        <IUIButton type="tertiary" feeling="neutral">
          Add Exercise?
        </IUIButton>
        <View style={{ position: 'absolute', right: 0 }}>
          <IUIButton
            type="tertiary"
            feeling="positive"
            onPress={() => {
              setShowCreateExerciseModal(true);
            }}
          >
            New
          </IUIButton>
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {muscleGroups.map((group) => {
          return (
            <View
              key={group}
              style={{
                minWidth: 70,
                marginBottom: 10,
                marginEnd: 10,
              }}
            >
              <IUIButton
                type={group == selectedGroup ? 'primary' : 'secondary'}
                feeling="done"
                onPress={() => {
                  setSelectedGroup(group);

                  // Just scroll the list immediately
                  // vs. setting state, and then scrolling in an effect
                  if (flatListRef.current) {
                    flatListRef.current.scrollToIndex({
                      animated: true,
                      index: muscleGroups.indexOf(group),
                    });
                  }
                }}
              >
                {group}
              </IUIButton>
            </View>
          );
        })}
      </View>

      <FlatList
        ref={flatListRef}
        horizontal={true}
        data={muscleGroups}
        keyExtractor={(item) => item}
        scrollEnabled={false}
        initialNumToRender={2}
        style={{
          height: Dimensions.get('window').height - 500,
          marginTop: 5,
          marginBottom: 15,
          borderRadius: 5,
        }}
        renderItem={(info) => {
          const exercises2 = exercises
            .filter((exercise) => exercise.group == info.item)
            .sort((a, b) => a.name.localeCompare(b.name))
            .sort((a, b) => Number(a.archived) - Number(b.archived));

          return (
            <ExerciseList
              isVisible={selectedGroup == info.item}
              listWidth={listWidth}
              exercises={exercises2}
              exercisesInWorkout={exercisesInWorkout}
              exercisesSelected={exercisesSelected}
              setSelectedExercises={setSelectedExercises}
              onRequestEdit={setExerciseToEdit}
            />
          );
        }}
      />

      <View style={{ marginBottom: 10 }}>
        <IUIButton
          type="secondary"
          feeling="positive"
          disabled={exercisesSelected.length == 0}
          onPress={() => {
            close(exercisesSelected);
          }}
        >
          Add Exercise
        </IUIButton>
      </View>

      <CreateExerciseModal
        visible={showCreateExerciseModal}
        exercises={exercises}
        muscleGroups={muscleGroups}
        onRequestCancel={() => {
          setShowCreateExerciseModal(false);
        }}
        onRequestCreate={(
          name: string,
          type: ExerciseType,
          group: MuscleGroup
        ) => {
          setShowCreateExerciseModal(false);
          const exercise = createExercise(name, type, group);
          setExercises([...exercises, exercise]);
          setSelectedGroup(exercise.group);
          setSelectedExercises([...exercisesSelected, exercise]);
        }}
      />

      <EditExerciseModal
        visible={exerciseToEdit != null}
        exercise={exerciseToEdit}
        exercises={exercises}
        onRequestCancel={() => {
          setExerciseToEdit(null);
        }}
        onRequestUpdate={(partial) => {
          if (exerciseToEdit != null) {
            updateExercise(exerciseToEdit, partial);
          }
          setExerciseToEdit(null);
        }}
      />
    </IUIModal>
  );
}

function ExerciseList({
  listWidth,
  isVisible,
  exercises,
  exercisesSelected,
  exercisesInWorkout,
  setSelectedExercises,
  onRequestEdit,
}: {
  listWidth: number | null;
  isVisible: boolean;
  exercises: ReadonlyArray<AnyExercise>;
  exercisesSelected: ReadonlyArray<AnyExercise>;
  exercisesInWorkout: Set<string>;
  setSelectedExercises: (exercises: ReadonlyArray<AnyExercise>) => void;
  onRequestEdit: (exercise: AnyExercise) => void;
}) {
  const [viewableExercises, setViewableExercises] = useState(exercises);

  return (
    <IUIDelayedStubber
      isVisible={isVisible}
      stub={
        <View
          style={{
            paddingBottom: 10,
            width: listWidth ? listWidth : undefined,
          }}
        />
      }
    >
      <FlatList<AnyExercise>
        data={exercises}
        keyExtractor={(info) => info.id}
        style={{
          paddingBottom: 10,
          width: listWidth ? listWidth : undefined,
        }}
        onViewableItemsChanged={(info) => {
          setViewableExercises(info.viewableItems.map(({ item }) => item));
        }}
        renderItem={(info) => {
          const exercise = info.item;
          if (listWidth == null) {
            return null;
          }
          return (
            <ExerciseListRow
              exercise={exercise}
              isVisible={isVisible && viewableExercises.includes(exercise)}
              isSelected={exercisesSelected.includes(exercise)}
              isInWorkout={exercisesInWorkout.has(exercise.id)}
              onPress={() => {
                if (exercisesSelected.length == 0) {
                  setSelectedExercises([...exercisesSelected, exercise]);
                } else if (exercisesSelected.length == 1) {
                  if (exercisesSelected.includes(exercise)) {
                    setSelectedExercises(
                      exercisesSelected.filter((other) => other != exercise)
                    );
                  } else {
                    setSelectedExercises([exercise]);
                  }
                }
              }}
              onRequestEdit={() => onRequestEdit(exercise)}
            />
          );
        }}
      />
    </IUIDelayedStubber>
  );
}

function ExerciseListRow({
  exercise,
  isVisible,
  isSelected,
  isInWorkout,
  onRequestEdit,
  onPress,
}: {
  exercise: AnyExercise;
  isVisible: boolean;
  isSelected: boolean;
  isInWorkout: boolean;
  onRequestEdit: () => void;
  onPress: () => void;
}) {
  const [status, setStatus] = useState<'revealed' | 'hidden'>('hidden');
  const borderColor = (alpha: number) => {
    if (isInWorkout) {
      return `rgba(150, 90, 253, ${alpha})`;
    }
    if (exercise.archived) {
      return `rgba(0, 0, 0, ${alpha})`;
    }
    return `rgba(0, 127, 255, ${alpha})`;
  };
  const paddingHorizontal = 1;
  const borderStartWidth = 5;
  const borderEndWidth = 1;
  const rightButtonPadding = 5;

  const paddingStart =
    paddingHorizontal +
    (borderStartWidth - borderEndWidth) +
    rightButtonPadding;
  const paddingEnd = paddingHorizontal;

  const $content = (
    <Pressable
      onPress={() => {
        if (exercise.archived || isInWorkout) {
          return;
        }

        onPress();
      }}
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingStart,
        paddingEnd,
        paddingVertical: 5,
        borderRadius: 1,
        borderBottomColor: `rgba(0, 0, 0, 0.1)`,
        borderColor: borderColor(0.25),
        borderWidth: 1,
        borderStartWidth,
        borderEndWidth,
        ...(isSelected
          ? {
              borderStartColor: borderColor(0.75),
            }
          : {
              borderStartColor: borderColor(0.25),
            }),
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          flex: 1,
          justifyContent: 'space-between',
          alignItems: 'center',
          ...(exercise.archived || isInWorkout ? { opacity: 0.4 } : {}),
        }}
      >
        <Text
          style={{
            // fontWeight: 'bold',
            flexShrink: 1,
          }}
          numberOfLines={1}
        >
          {exercise.archived ? '(archived) ' : ''}
          {exercise.name}
        </Text>
        <View
          style={{
            minWidth: 35,
          }}
        >
          <IUIButton type="tertiary" feeling="mild">
            {exercise.type === 'reps'
              ? '🔁'
              : exercise.type === 'weights'
              ? '🏋'
              : '⏳'}
          </IUIButton>
        </View>
      </View>
    </Pressable>
  );

  if (!isVisible) {
    return $content;
  }

  return (
    <IUISwipeToReveal
      actionsPos="end"
      status={status}
      setStatus={setStatus}
      actions={
        <IUIButton
          type="tertiary"
          feeling="neutral"
          onPress={() => {
            onRequestEdit();
            setStatus('hidden');
          }}
        >
          ⚙
        </IUIButton>
      }
    >
      {$content}
    </IUISwipeToReveal>
  );
}

function EditExerciseModal({
  visible,
  exercise,
  exercises,
  onRequestCancel,
  onRequestUpdate,
}: {
  visible: boolean;
  exercise: AnyExercise | null;
  exercises: ReadonlyArray<AnyExercise>;
  onRequestCancel: () => void;
  onRequestUpdate: (exercise: Partial<AnyExercise>) => void;
}) {
  const [exerciseName, setExerciseName] = useState(exercise?.name ?? '');
  const isArchived = exercise?.archived;

  useEffect(() => {
    if (exercise) {
      setExerciseName(exercise.name);
    }
  }, [exercise]);

  const isExerciseNameTaken =
    exercise != null &&
    exerciseName != '' &&
    exercises.some((otherExercise) => {
      return exercise != otherExercise && otherExercise.name == exerciseName;
    });

  return (
    <IUIModal visible={visible} onRequestClose={() => onRequestCancel()}>
      <View style={{ alignItems: 'center', marginBottom: 15 }}>
        <View style={{ flexDirection: 'row' }}>
          <Text style={{ fontWeight: 'bold' }}>Edit Exercise</Text>
        </View>
      </View>

      <View style={{ marginBottom: 15 }}>
        <View style={{ flexDirection: 'row' }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Name</Text>
          <Text style={{ color: 'red' }}>
            {isExerciseNameTaken ? '(taken)' : ''}
          </Text>
        </View>

        <IUIStringTextInput value={exerciseName} onChange={setExerciseName} />
      </View>

      <View style={{ marginBottom: 5 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Type</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <View style={{ marginBottom: 10, marginEnd: 10, minWidth: 75 }}>
            <IUIButton type="primary" feeling="mild">
              {exercise?.type || ''}
            </IUIButton>
          </View>
        </View>
      </View>

      <View style={{ marginBottom: 5 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>
          Muscle Group
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <View style={{ marginBottom: 10, marginEnd: 10, minWidth: 70 }}>
            <IUIButton type="primary" feeling="done">
              {exercise?.group || ''}
            </IUIButton>
          </View>
        </View>
      </View>

      <View style={{ marginTop: 5, marginBottom: 5 }}>
        <IUIButton
          type="secondary"
          feeling="done"
          disabled={exerciseName.trim() == '' || isExerciseNameTaken}
          onPress={() => {
            if (exerciseName.trim() == '' || isExerciseNameTaken) {
              return;
            }
            onRequestUpdate({
              name: exerciseName,
            });
          }}
        >
          Save
        </IUIButton>
      </View>
      <View style={{ marginTop: 5, marginBottom: 10 }}>
        <IUIButton
          type="secondary"
          feeling={isArchived ? 'positive' : 'neutral'}
          disabled={exerciseName.trim() == '' || isExerciseNameTaken}
          onPress={() => {
            onRequestUpdate({
              archived: !isArchived,
            });
          }}
        >
          {isArchived ? 'Unarchive' : 'Archive'}
        </IUIButton>
      </View>
    </IUIModal>
  );
}

function CreateExerciseModal({
  visible,
  onRequestCreate,
  onRequestCancel,
  muscleGroups,
  exercises,
}: {
  visible: boolean;
  onRequestCreate: (
    name: string,
    type: ExerciseType,
    group: MuscleGroup
  ) => void;
  onRequestCancel: () => void;
  muscleGroups: ReadonlyArray<MuscleGroup>;
  exercises: ReadonlyArray<AnyExercise>;
}) {
  const [exerciseName, setExerciseName] = useState('');
  const [exerciseType, setExerciseType] = useState<ExerciseType | null>(null);
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | null>(null);

  const allMuscleGroups: ReadonlyArray<MuscleGroup> = dedupe([
    ...muscleGroups,
    ...AllMuscleGroups,
  ]);

  function clearState() {
    setExerciseName('');
    setMuscleGroup(null);
    setExerciseType(null);
  }

  const isExerciseNameTaken =
    exerciseName != '' &&
    exercises.some((otherExercise) => {
      return otherExercise.name == exerciseName;
    });

  return (
    <IUIModal visible={visible} onRequestClose={() => onRequestCancel()}>
      <View style={{ alignItems: 'center', marginBottom: 15 }}>
        <Text style={{ fontWeight: 'bold' }}>Create Exercise?</Text>
      </View>
      <View style={{ marginBottom: 15 }}>
        <View style={{ flexDirection: 'row', marginBottom: 5 }}>
          <Text style={{ fontWeight: 'bold' }}>Name </Text>
          <Text style={{ color: 'red' }}>
            {isExerciseNameTaken ? '(taken)' : ''}
          </Text>
        </View>

        <IUIStringTextInput value={exerciseName} onChange={setExerciseName} />
      </View>

      <View style={{ marginBottom: 5 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Type</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {(['weights', 'reps', 'time'] as ExerciseType[]).map((type) => {
            return (
              <View
                key={type}
                style={{ marginBottom: 10, marginEnd: 10, minWidth: 75 }}
              >
                <IUIButton
                  type={exerciseType == type ? 'primary' : 'secondary'}
                  feeling="mild"
                  onPress={() => {
                    setExerciseType(type);
                  }}
                >
                  {type}
                </IUIButton>
              </View>
            );
          })}
        </View>
      </View>

      <View style={{ marginBottom: 5 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Muscles</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {allMuscleGroups.map((group) => {
            return (
              <View
                key={group}
                style={{ marginBottom: 10, marginEnd: 10, minWidth: 70 }}
              >
                <IUIButton
                  type={muscleGroup == group ? 'primary' : 'secondary'}
                  feeling="done"
                  onPress={() => {
                    setMuscleGroup(group);
                  }}
                >
                  {group}
                </IUIButton>
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
            muscleGroup == null ||
            exerciseName.trim() == '' ||
            isExerciseNameTaken
          }
          onPress={() => {
            if (
              exerciseType == null ||
              muscleGroup == null ||
              exerciseName.trim() == '' ||
              isExerciseNameTaken
            ) {
              return;
            }
            onRequestCreate(exerciseName, exerciseType, muscleGroup);
            clearState();
          }}
        >
          Create Exercise
        </IUIButton>
      </View>
    </IUIModal>
  );
}

function dedupe<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}
