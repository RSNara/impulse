import type { Exercise } from '@/data/exercises';
import type {
  AnySetLog,
  ExerciseLog,
  ExerciseType,
  SetLog,
} from '@/data/store';
import { useEffect, useRef } from 'react';
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
      done: false,
      warmup,
    } as SetLog<T>;
  }

  if (type == 'loaded') {
    return {
      type: 'loaded',
      mass: null,
      reps: null,
      done: false,
      warmup,
    } as SetLog<T>;
  }

  return {
    type: 'reps',
    reps: null,
    done: false,
    warmup,
  } as SetLog<T>;
}

export type ExerciseLogTableProps<T extends ExerciseType> = {
  log: ExerciseLog<T>;
  pastLog: ExerciseLog<T> | null;
  updateSetLogs: (sets: ReadonlyArray<SetLog<T>>) => void;
  onRemove: () => void;
};

export default function ExerciseLogTable<T extends ExerciseType>({
  log,
  pastLog,
  updateSetLogs,
  onRemove,
}: ExerciseLogTableProps<T>) {
  const pastSetLogs = pastLog?.setLogs || [];
  const setLogs = log.setLogs as SetLog<T>[];
  const name = log.name;
  const type = log.type;

  const idRef = useRef(0);
  const setIdMap = useRef(new WeakMap<SetLog<T>, number>()).current;

  function getSetLogKey(setLog: SetLog<T>) {
    const result = setIdMap.get(setLog);
    if (result == null) {
      setIdMap.set(setLog, idRef.current++);
    }
    return setIdMap.get(setLog);
  }

  function updateSetLog(setLog: SetLog<T>, update: Partial<SetLog<T>>) {
    updateSetLogs(
      setLogs.map((otherSetLog) => {
        return setLog == otherSetLog ? { ...setLog, ...update } : otherSetLog;
      })
    );
  }

  function removeSetLog(setLog: SetLog<T>) {
    updateSetLogs(
      setLogs.filter((otherSetLog) => {
        return otherSetLog != setLog;
      })
    );
  }

  type RowAccumulator = { rows: React.ReactNode[]; num: number };
  const { rows: $rows } = setLogs.reduce(
    (acc: RowAccumulator, set: SetLog<T>) => {
      const num = !set.warmup ? acc.num + 1 : acc.num;
      const pastSetLog = pastSetLogs.filter((setLog) => !setLog.warmup)[
        num - 1
      ] as SetLog<T> | null;
      return {
        num,
        rows: [
          ...acc.rows,
          <ExerciseLogTableRow
            key={getSetLogKey(set)}
            setLog={set}
            pastSetLog={pastSetLog}
            num={num}
            onUpdate={(update) => updateSetLog(set, update)}
            onDismiss={() => removeSetLog(set)}
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
            updateSetLogs(setLogs.concat(createSetLog<T>(type as T, false)));
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
  num,
  setLog,
  pastSetLog,
  onUpdate,
  onDismiss,
}: {
  num: number;
  setLog: SetLog<T>;
  pastSetLog: SetLog<T> | null;
  onUpdate: (partial: Partial<SetLog<T>>) => void;
  onDismiss: () => void;
}) {
  const colorValue = useAnimatedValue(setLog.done ? 1 : 0);
  const backgroundColor = colorValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(0, 255, 0, 0)', 'rgba(0, 255, 0, 0.125)'],
    extrapolate: 'clamp',
  });

  const canFinishSet = !(
    (setLog.type === 'time' && setLog.time == null) ||
    (setLog.type == 'loaded' && (setLog.reps == null || setLog.mass == null)) ||
    (setLog.type == 'reps' && setLog.reps == null)
  );

  useEffect(() => {
    if (!canFinishSet && setLog.done) {
      onUpdate({
        done: false,
      } as Partial<SetLog<T>>);

      Animated.spring(colorValue, {
        toValue: 0,
        useNativeDriver: false,
      }).start();
    }
  }, [setLog, canFinishSet]);

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
          <SetIndicator setLog={setLog} num={num} />
        </View>
        <View style={rowStyles.previous}>
          <SetPreviousPerf pastSetLog={pastSetLog} />
        </View>
        <View style={rowStyles.dataContainer}>
          {(setLog.type == 'time' || setLog.type == 'reps') && (
            <View style={rowStyles.data} />
          )}
          {setLog.type === 'time' ? (
            <View style={rowStyles.data}>
              <IUINumericTextInput
                value={setLog.time}
                onChange={(time) => onUpdate({ time } as SetLog<T>)}
              />
            </View>
          ) : null}
          {setLog.type === 'loaded' ? (
            <View style={rowStyles.data}>
              <IUINumericTextInput
                value={setLog.mass}
                onChange={(mass) => onUpdate({ mass } as SetLog<T>)}
              />
            </View>
          ) : null}
          {setLog.type == 'loaded' || setLog.type == 'reps' ? (
            <View style={rowStyles.data}>
              <IUINumericTextInput
                value={setLog.reps}
                onChange={(reps) => onUpdate({ reps } as SetLog<T>)}
              />
            </View>
          ) : null}
        </View>
        <View style={rowStyles.done}>
          <IUIButton
            disabled={!canFinishSet}
            type={setLog.done ? 'primary' : 'secondary'}
            feeling={setLog.done ? 'done' : 'neutral'}
            onPress={() => {
              const isDone = !setLog.done;
              onUpdate({
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

function SetIndicator({ setLog, num }: { setLog: AnySetLog; num: number }) {
  return (
    <IUIButton type="secondary" feeling="neutral" onPress={() => {}}>
      {setLog.warmup ? 'w' : String(num)}
    </IUIButton>
  );
}

function SetPreviousPerf({ pastSetLog }: { pastSetLog: AnySetLog | null }) {
  return (
    <View
      style={{
        alignItems: 'center',
        borderRadius: 5,
        padding: 5,
      }}
    >
      <Text style={{ fontWeight: 'bold' }}>
        {pastSetLog && pastSetLog.type == 'loaded'
          ? `${pastSetLog.mass} x ${pastSetLog.reps}`
          : null}
        {pastSetLog && pastSetLog.type == 'reps' ? `${pastSetLog.reps}` : null}
        {pastSetLog && pastSetLog.type == 'time' ? `${pastSetLog.time}s` : null}
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
