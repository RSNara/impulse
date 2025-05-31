import type { Exercise } from '@/data/exercises';
import type {
  AnySetLog,
  ExerciseLog,
  ExerciseType,
  SetLog,
} from '@/data/store';
import { useEffect } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  useAnimatedValue,
} from 'react-native';
import IUIButton from '../iui/IUIButton';
import IUIDismissable from '../iui/IUIDismissable';
import { IUINumericTextInput } from '../iui/IUITextInput';

function assertNever(x: never): never {
  throw new Error('Unexpected value: ' + x);
}

export function createExerciseLog<T extends ExerciseType>(
  exercise: Exercise<T>
): ExerciseLog<T> {
  if (exercise.type == 'loaded') {
    return {
      name: exercise.name,
      type: exercise.type,
      setLogs: [createSetLog<'loaded'>('loaded', false)],
    } as ExerciseLog<'loaded'> as ExerciseLog<T>;
  }

  if (exercise.type == 'reps') {
    return {
      name: exercise.name,
      type: exercise.type,
      setLogs: [createSetLog<'reps'>('reps', false)],
    } as ExerciseLog<'reps'> as ExerciseLog<T>;
  }

  if (exercise.type == 'time') {
    return {
      name: exercise.name,
      type: exercise.type,
      setLogs: [createSetLog<'time'>('time', false)],
    } as ExerciseLog<'time'> as ExerciseLog<T>;
  }

  assertNever(exercise);
}

export function createSetLog<T extends ExerciseType>(
  type: T,
  warmup: boolean
): SetLog<T> {
  if (type == 'time') {
    return {
      type: 'time',
      time: null,
      previous: undefined,
      done: false,
      warmup,
    } as SetLog<T>;
  }

  if (type == 'loaded') {
    return {
      type: 'loaded',
      mass: null,
      reps: null,
      previous: undefined,
      done: false,
      warmup,
    } as SetLog<T>;
  }

  return {
    type: 'reps',
    reps: null,
    previous: undefined,
    done: false,
    warmup,
  } as SetLog<T>;
}

export type ExerciseLogTableProps<T extends ExerciseType> = {
  name: string;
  type: T;
  setLogs: ReadonlyArray<SetLog<T>>;
  setSetLogs: (sets: ReadonlyArray<SetLog<T>>) => void;
  onRemove: () => void;
};

export default function ExerciseLogTable<T extends ExerciseType>({
  name,
  type,
  setLogs,
  setSetLogs,
  onRemove,
}: ExerciseLogTableProps<T>) {
  function updateSet(set: SetLog<T>, update: Partial<SetLog<T>>) {
    setSetLogs(
      setLogs.map((otherSet) => {
        return set == otherSet ? { ...set, ...update } : otherSet;
      })
    );
  }

  function removeSet(set: SetLog<T>) {
    setSetLogs(
      setLogs.filter((otherSet) => {
        return otherSet != set;
      })
    );
  }

  type RowAccumulator = { rows: React.ReactNode[]; num: number };
  const { rows: $rows } = setLogs.reduce(
    (acc: RowAccumulator, set: SetLog<T>) => {
      const num = !set.warmup ? acc.num + 1 : acc.num;
      return {
        num,
        rows: [
          ...acc.rows,
          <ExerciseLogTableRow
            key={num}
            set={set}
            num={num}
            updateSet={(update) => updateSet(set, update)}
            onDismiss={() => removeSet(set)}
          />,
        ],
      };
    },
    { rows: [], num: 0 }
  );

  return (
    <IUIDismissable
      style={{ marginBottom: 20 }}
      onDismiss={onRemove}
      towards="left"
    >
      <View style={[styles.row, { justifyContent: 'space-between' }]}>
        <Text style={{ fontWeight: 'bold', color: 'rgba(0, 128, 255, 1)' }}>
          {name}
        </Text>
      </View>
      <ExerciseLogTableHeader type={type} />
      {$rows}
      <View style={{ marginHorizontal: 10, marginTop: 10 }}>
        <IUIButton
          type="secondary"
          feeling="neutral"
          onPress={() => {
            setSetLogs(setLogs.concat(createSetLog(type, false)));
          }}
        >
          + Add Set
        </IUIButton>
      </View>
    </IUIDismissable>
  );
}

function ExerciseLogTableHeader({ type }: { type: ExerciseType }) {
  return (
    <View style={styles.row}>
      <View style={headingStyles.setNum}>
        <Title>Set</Title>
      </View>
      <View style={headingStyles.previous}>
        <Title>Previous</Title>
      </View>
      <View style={headingStyles.dataContainer}>
        {(type == 'time' || type == 'reps') && (
          <View style={headingStyles.data}>
            <Title />
          </View>
        )}
        {type == 'time' && (
          <View style={headingStyles.data}>
            <Title>Time</Title>
          </View>
        )}
        {type == 'loaded' && (
          <View style={headingStyles.data}>
            <Title>Mass</Title>
          </View>
        )}
        {(type == 'loaded' || type == 'reps') && (
          <View style={headingStyles.data}>
            <Title>Reps</Title>
          </View>
        )}
      </View>

      <View style={{ flex: 1 }}>
        <IUIButton type="tertiary" feeling="neutral" onPress={() => {}}>
          ✓
        </IUIButton>
      </View>
    </View>
  );

  function Title({ children }: { children?: string }) {
    return (
      <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>
        {children}
      </Text>
    );
  }
}

function ExerciseLogTableRow<T extends ExerciseType>({
  set,
  num,
  updateSet,
  onDismiss,
}: {
  set: SetLog<T>;
  num: number;
  updateSet: (partial: Partial<SetLog<T>>) => void;
  onDismiss: () => void;
}) {
  const colorValue = useAnimatedValue(set.done ? 1 : 0);
  const backgroundColor = colorValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(0, 255, 0, 0)', 'rgba(0, 255, 0, 0.125)'],
    extrapolate: 'clamp',
  });

  const canFinishSet = !(
    (set.type === 'time' && set.time == null) ||
    (set.type == 'loaded' && (set.reps == null || set.mass == null)) ||
    (set.type == 'reps' && set.reps == null)
  );

  useEffect(() => {
    if (!canFinishSet && set.done) {
      updateSet({
        done: false,
      } as Partial<SetLog<T>>);

      Animated.spring(colorValue, {
        toValue: 0,
        useNativeDriver: false,
      }).start();
    }
  }, [set, canFinishSet]);

  return (
    <IUIDismissable onDismiss={onDismiss} towards="right">
      <Animated.View
        style={{
          flex: 1,
          flexDirection: 'row',
          paddingHorizontal: 10,
          paddingVertical: 5,
          backgroundColor,
        }}
      >
        <View style={rowStyles.setNum}>
          <SetIndicator set={set} num={num} />
        </View>
        <View style={rowStyles.previous}>
          <SetPreviousPerf set={set} />
        </View>
        <View style={rowStyles.dataContainer}>
          {(set.type == 'time' || set.type == 'reps') && (
            <View style={rowStyles.data} />
          )}
          {set.type === 'time' ? (
            <View style={rowStyles.data}>
              <IUINumericTextInput
                value={set.time}
                onChange={(time) => updateSet({ time } as SetLog<T>)}
              />
            </View>
          ) : null}
          {set.type === 'loaded' ? (
            <View style={rowStyles.data}>
              <IUINumericTextInput
                value={set.mass}
                onChange={(mass) => updateSet({ mass } as SetLog<T>)}
              />
            </View>
          ) : null}
          {set.type == 'loaded' || set.type == 'reps' ? (
            <View style={rowStyles.data}>
              <IUINumericTextInput
                value={set.reps}
                onChange={(reps) => updateSet({ reps } as SetLog<T>)}
              />
            </View>
          ) : null}
        </View>
        <View style={rowStyles.done}>
          <IUIButton
            disabled={!canFinishSet}
            type={set.done ? 'primary' : 'secondary'}
            feeling={set.done ? 'done' : 'neutral'}
            onPress={() => {
              const isDone = !set.done;
              updateSet({
                done: isDone,
              } as Partial<SetLog<T>>);

              if (isDone) {
                Animated.timing(colorValue, {
                  toValue: 1,
                  duration: 200,
                  useNativeDriver: false,
                }).start();
              } else {
                Animated.spring(colorValue, {
                  toValue: 0,
                  useNativeDriver: false,
                }).start();
              }
            }}
          >
            ✓
          </IUIButton>
        </View>
      </Animated.View>
    </IUIDismissable>
  );
}
2;

function SetIndicator({ set, num }: { set: AnySetLog; num: number }) {
  return (
    <IUIButton type="secondary" feeling="neutral" onPress={() => {}}>
      {set.warmup ? 'w' : String(num)}
    </IUIButton>
  );
}

function SetPreviousPerf({ set }: { set: AnySetLog }) {
  return (
    <View
      style={{
        alignItems: 'center',
        borderRadius: 5,
        padding: 5,
      }}
    >
      <Text style={{ fontWeight: 'bold' }}>
        {set.previous && set.type == 'loaded'
          ? `${set.previous.mass} x ${set.previous.reps}`
          : null}
        {set.previous && set.type == 'reps' ? `${set.previous.reps}` : null}
        {set.previous && set.type == 'time' ? `${set.previous.time}s` : null}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: 'center',
  },
});

const headingStyles = StyleSheet.create({
  setNum: { flex: 1, justifyContent: 'center' },
  previous: {
    flex: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dataContainer: {
    flex: 5,
    flexDirection: 'row',
  },
  data: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  done: {
    flex: 1,
    justifyContent: 'center',
  },
});

const rowStyles = StyleSheet.create({
  setNum: {
    flex: 1,
    justifyContent: 'center',
  },
  previous: {
    flex: 5,
    justifyContent: 'center',
  },
  dataContainer: {
    flex: 5,
    flexDirection: 'row',
  },
  data: {
    flex: 1,
    justifyContent: 'center',
  },
  done: {
    flex: 1,
    justifyContent: 'center',
  },
});
