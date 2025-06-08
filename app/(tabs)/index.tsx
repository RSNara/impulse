import IUIButton from '@/components/iui/IUIButton';
import IUIContainer from '@/components/iui/IUIContainer';
import IUIModal from '@/components/iui/IUIModal';
import IUISwipeToReveal from '@/components/iui/IUISwipeToReveal';
import { IUIStringTextInput } from '@/components/iui/IUITextInput';
import ExerciseLogTable from '@/components/workout/ExerciseLogTable';
import {
  createExercise,
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

  function addExercise(exercise: AnyExercise) {
    setExerciseLogs([...exerciseLogs, createExerciseLog(exercise)]);
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
        alreadyPicked={new Set(exerciseLogs.map((log) => log.exerciseId))}
        exercises={exercises}
        setExercises={setExercises}
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
  exercises,
  setExercises,
}: {
  visible: boolean;
  alreadyPicked: Set<string>;
  onRequestClose: (exercise?: AnyExercise | null) => void;
  exercises: ReadonlyArray<AnyExercise>;
  setExercises: (exercises: ReadonlyArray<AnyExercise>) => void;
}) {
  const [selectedExercise, setSelectedExercise] = useState<AnyExercise | null>(
    null
  );
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

  const exerciseGroups = dedupe(exercises.map((exercise) => exercise.group));
  const [selectedGroup, setSelectedGroup] = useState<ExerciseGroup>(
    exerciseGroups[0]
  );
  const page = exerciseGroups.indexOf(selectedGroup);

  const flatListRef = useRef<FlatList>(null);

  const [showCreateExerciseModal, setShowCreateExerciseModal] = useState(false);
  const [exerciseToEdit, setExerciseToEdit] = useState<AnyExercise | null>(
    null
  );

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
        {exerciseGroups.map((group) => {
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
        data={exerciseGroups}
        keyExtractor={(item) => item}
        scrollEnabled={false}
        initialNumToRender={1}
        style={{
          height: Dimensions.get('window').height - 500,
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
                  !alreadyPicked.has(exercise.id) && exercise.group == info.item
                );
              })}
              selected={selectedExercise}
              onRequestSelect={setSelectedExercise}
              onRequestEdit={setExerciseToEdit}
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

      <CreateExerciseModal
        visible={showCreateExerciseModal}
        exercises={exercises}
        exerciseGroups={exerciseGroups}
        onRequestCancel={() => {
          setShowCreateExerciseModal(false);
        }}
        onRequestCreate={(
          name: string,
          type: ExerciseType,
          group: ExerciseGroup
        ) => {
          setShowCreateExerciseModal(false);
          const exercise = createExercise(name, type, group);
          setExercises([...exercises, exercise]);
          setSelectedGroup(exercise.group);
          setSelectedExercise(exercise);
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
        onRequestArchive={() => {
          if (exerciseToEdit != null) {
            updateExercise(exerciseToEdit, { archived: true });
          }
          setExerciseToEdit(null);
        }}
      />
    </IUIModal>
  );
}

function ExerciseList({
  listWidth,
  exercises,
  selected,
  onRequestSelect,
  onRequestEdit,
}: {
  listWidth: number | null;
  exercises: ReadonlyArray<AnyExercise>;
  selected: AnyExercise | null;
  onRequestSelect: (exercise: AnyExercise) => void;
  onRequestEdit: (exercise: AnyExercise) => void;
}) {
  return (
    <FlatList<AnyExercise>
      data={exercises}
      keyExtractor={(info) => info.name.replaceAll(' ', '-')}
      style={{
        paddingBottom: 10,
        width: listWidth ? listWidth : undefined,
      }}
      initialNumToRender={14}
      renderItem={(info) => {
        const exercise = info.item;
        if (listWidth == null) {
          return null;
        }
        return (
          <ExerciseListRow
            exercise={exercise}
            isSelected={exercise == selected}
            onRequestSelect={() => onRequestSelect(exercise)}
            onRequestEdit={() => onRequestEdit(exercise)}
          />
        );
      }}
    />
  );
}

function ExerciseListRow({
  exercise,
  isSelected,
  onRequestEdit,
  onRequestSelect,
}: {
  exercise: AnyExercise;
  isSelected: boolean;
  onRequestEdit: () => void;
  onRequestSelect: () => void;
}) {
  const [status, setStatus] = useState<'revealed' | 'hidden'>('hidden');
  const paddingHorizontal = 10;
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
      <Pressable
        onPress={onRequestSelect}
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingStart: paddingHorizontal,
          paddingEnd: paddingHorizontal - 5,
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
          <Text style={{ fontWeight: 'bold', flexShrink: 1 }} numberOfLines={1}>
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
    </IUISwipeToReveal>
  );
}

function EditExerciseModal({
  visible,
  exercise,
  exercises,
  onRequestCancel,
  onRequestUpdate,
  onRequestArchive,
}: {
  visible: boolean;
  exercise: AnyExercise | null;
  exercises: ReadonlyArray<AnyExercise>;
  onRequestCancel: () => void;
  onRequestUpdate: (exercise: Partial<AnyExercise>) => void;
  onRequestArchive: () => void;
}) {
  const [exerciseName, setExerciseName] = useState(exercise?.name ?? '');

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
          <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>
            Exercise Name
          </Text>
          <Text style={{ color: 'red' }}>
            {isExerciseNameTaken ? '(taken)' : ''}
          </Text>
        </View>

        <IUIStringTextInput value={exerciseName} onChange={setExerciseName} />
      </View>

      <View style={{ marginBottom: 5 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>
          Exercise Type
        </Text>
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
          Exercise Group
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
          feeling="negative"
          disabled={exerciseName.trim() == '' || isExerciseNameTaken}
          onPress={onRequestArchive}
        >
          Archive
        </IUIButton>
      </View>
    </IUIModal>
  );
}

function CreateExerciseModal({
  visible,
  onRequestCreate,
  onRequestCancel,
  exerciseGroups,
  exercises,
}: {
  visible: boolean;
  onRequestCreate: (
    name: string,
    type: ExerciseType,
    group: ExerciseGroup
  ) => void;
  onRequestCancel: () => void;
  exerciseGroups: ReadonlyArray<ExerciseGroup>;
  exercises: ReadonlyArray<AnyExercise>;
}) {
  const [exerciseName, setExerciseName] = useState('');
  const [exerciseType, setExerciseType] = useState<ExerciseType | null>(null);
  const [exerciseGroup, setExerciseGroup] = useState<ExerciseGroup | null>(
    null
  );

  function clearState() {
    setExerciseName('');
    setExerciseGroup(null);
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
          <Text style={{ fontWeight: 'bold' }}>Exercise Name </Text>
          <Text style={{ color: 'red' }}>
            {isExerciseNameTaken ? '(taken)' : ''}
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
        <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>
          Exercise Group
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {exerciseGroups.map((group) => {
            return (
              <View
                key={group}
                style={{ marginBottom: 10, marginEnd: 10, minWidth: 70 }}
              >
                <IUIButton
                  type={exerciseGroup == group ? 'primary' : 'secondary'}
                  feeling="done"
                  onPress={() => {
                    setExerciseGroup(group);
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
            exerciseGroup == null ||
            exerciseName.trim() == '' ||
            isExerciseNameTaken
          }
          onPress={() => {
            if (
              exerciseType == null ||
              exerciseGroup == null ||
              exerciseName.trim() == '' ||
              isExerciseNameTaken
            ) {
              return;
            }
            onRequestCreate(exerciseName, exerciseType, exerciseGroup);
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
