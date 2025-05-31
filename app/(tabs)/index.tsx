import IUIButton from '@/components/iui/IUIButton';
import IUIContainer from '@/components/iui/IUIContainer';
import IUIModal from '@/components/iui/IUIModal';
import ExerciseLogTable, {
  createExerciseLog,
} from '@/components/workout/ExerciseLogTable';
import type {
  AnyExercise,
  ExerciseGroup,
  ExerciseType,
} from '@/data/exercises';
import Exercises from '@/data/exercises';
import type { Workout } from '@/data/store';
import {
  emptyWorkout,
  useStore,
  type AnyExerciseLog,
  type ExerciseLog,
} from '@/data/store';
import { useRef, useState } from 'react';
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
  const [store, setStore] = useStore();

  const workout = store.currentWorkout;
  function setWorkout(workout: Workout) {
    setStore({
      ...store,
      currentWorkout: workout,
    });
  }

  const exerciseLogs = workout.exerciseLogs;
  function setExerciseLogs(exerciseLogs: AnyExerciseLog[]) {
    setStore({
      ...store,
      currentWorkout: {
        ...store.currentWorkout,
        exerciseLogs: exerciseLogs,
      },
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
    setStore({
      currentWorkout: emptyWorkout(),
      pastWorkouts: [workout, ...store.pastWorkouts],
    });
  }

  const canFinishWorkout =
    exerciseLogs.length != 0 &&
    exerciseLogs.every(
      (exerciseLog) =>
        exerciseLog.sets.length != 0 &&
        exerciseLog.sets.every((set) => set.done)
    );

  return (
    <IUIContainer>
      <WorkoutHeader
        name={workout?.name || ''}
        setName={(name) => {
          if (workout == null) {
            return;
          }

          setWorkout({
            ...workout,
            name,
          });
        }}
        disableFinish={!canFinishWorkout}
        onFinish={() => {
          setShowFinishWorkoutModal(true);
        }}
      />
      <ScrollView>
        {(workout?.exerciseLogs || []).map((exerciseLog, i) => {
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
        onRequestClose={(finished) => {
          setShowFinishWorkoutModal(false);
          if (finished) {
            finishWorkout();
          }
        }}
      />
      <AddExerciseModal
        visible={showAddExerciseModal}
        alreadyPicked={
          new Set((workout?.exerciseLogs || []).map((log) => log.name))
        }
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
  const [selectedGroup, setSelectedGroup] = useState<ExerciseGroup | null>(
    null
  );
  const [listWidth, setListWidth] = useState<number | null>(null);

  const exerciseGroups = [
    ...new Set(Exercises.map((exercise) => exercise.group)),
  ];

  const flatListRef = useRef<FlatList>(null);

  return (
    <IUIModal
      visible={visible}
      onRequestClose={() => {
        onRequestClose(null);
        setSelectedExercise(null);
      }}
      onReceiveSize={({ width, height }) => {
        setListWidth(width);
      }}
    >
      <View style={{ alignItems: 'center', paddingBottom: 10 }}>
        <Text style={{ fontWeight: 'bold' }}>Add Exercise?</Text>
      </View>

      <ExerciseGroups
        selectedGroup={selectedGroup}
        onSelectGroup={(group) => {
          if (group == selectedGroup) {
            return;
          }
          setSelectedGroup(group);
          setSelectedExercise(null);
          if (flatListRef.current) {
            flatListRef.current.scrollToIndex({
              animated: true,
              index: exerciseGroups.indexOf(group),
            });
          }
        }}
        groups={exerciseGroups}
      />
      <FlatList
        ref={flatListRef}
        horizontal={true}
        data={exerciseGroups}
        keyExtractor={(item) => item}
        scrollEnabled={false}
        renderItem={(info) => {
          return (
            <FlatList<AnyExercise>
              data={Exercises.filter((exercise) => {
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
                  <ExerciseRow
                    exercise={exercise}
                    isSelected={isSelected}
                    onPress={() => {
                      setSelectedExercise(exercise);
                    }}
                  ></ExerciseRow>
                );
              }}
            />
          );
        }}
      />

      <View style={{ marginVertical: 10 }}>
        <IUIButton
          type="secondary"
          feeling="positive"
          disabled={selectedExercise == null}
          onPress={() => {
            onRequestClose(selectedExercise);
            setSelectedExercise(null);
          }}
        >
          Add Exercise
        </IUIButton>
      </View>
    </IUIModal>
  );
}

function ExerciseGroups({
  groups,
  onSelectGroup,
  selectedGroup,
}: {
  groups: ReadonlyArray<ExerciseGroup>;
  onSelectGroup: (group: ExerciseGroup) => void;
  selectedGroup: ExerciseGroup | null;
}) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      {groups.map((group, i) => {
        return (
          <View
            key={group}
            style={{
              paddingBottom: 10,
              marginRight: 10,
              minWidth: 65,
            }}
          >
            <IUIButton
              type={selectedGroup == group ? 'primary' : 'secondary'}
              feeling="done"
              onPress={() => {
                onSelectGroup(group);
              }}
            >
              {group}
            </IUIButton>
          </View>
        );
      })}
    </View>
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
  const paddingHorizontal = 10;
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal,
        paddingVertical: 12,
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
