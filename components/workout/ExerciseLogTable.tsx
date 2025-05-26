import { useEffect } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  useAnimatedValue,
} from 'react-native';
import IUIButton from '../iui/IUIButton';
import IUICheckbox from '../iui/IUICheckbox';
import IUIDismissable from '../iui/IUIDismissable';
import { IUINumericTextInput } from '../iui/IUITextInput';

type AnySetLog = LoadedSetLog | RepsSetLog | TimeSetLog;

type LoadedSetLog = {
  type: 'loaded';
  warmup: boolean;
  done: boolean;
  previous?: {
    mass: number;
    reps: number;
  };
  mass: number | null;
  reps: number | null;
  id: number;
};

type RepsSetLog = {
  type: 'reps';
  warmup: boolean;
  done: boolean;
  previous?: {
    reps: number;
  };
  reps: number | null;
  id: number;
};

type TimeSetLog = {
  type: 'time';
  warmup: boolean;
  done: boolean;
  previous?: {
    time: number;
  };
  time: number | null;
  id: number;
};

export type SetLog<T extends ExerciseType> = {
  loaded: LoadedSetLog;
  reps: RepsSetLog;
  time: TimeSetLog;
}[T];

let setId = 0;

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
      id: setId++,
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
      id: setId++,
    } as SetLog<T>;
  }

  return {
    type: 'reps',
    reps: null,
    previous: undefined,
    done: false,
    warmup,
    id: setId++,
  } as SetLog<T>;
}

type ExerciseType = 'loaded' | 'reps' | 'time';

type LoadedExerciseLog = {
  name: string;
  type: 'loaded';
  sets: ReadonlyArray<SetLog<'loaded'>>;
};

type RepsExerciseLog = {
  name: string;
  type: 'reps';
  sets: ReadonlyArray<SetLog<'reps'>>;
};

type TimeExerciseLog = {
  name: string;
  type: 'time';
  sets: ReadonlyArray<SetLog<'time'>>;
};

export type ExerciseLog<T extends ExerciseType> = {
  loaded: LoadedExerciseLog;
  reps: RepsExerciseLog;
  time: TimeExerciseLog;
}[T];

export type ExerciseLogTableProps<T extends ExerciseType> = {
  name: string;
  type: T;
  sets: ReadonlyArray<SetLog<T>>;
  setSets: (sets: ReadonlyArray<SetLog<T>>) => void;
  onRemove: () => void;
};

export default function ExerciseLogTable<T extends ExerciseType>({
  name,
  type,
  sets,
  setSets,
  onRemove,
}: ExerciseLogTableProps<T>) {
  function updateSet(set: SetLog<T>, update: Partial<SetLog<T>>) {
    setSets(
      sets.map((otherSet) => {
        return set == otherSet ? { ...set, ...update } : otherSet;
      })
    );
  }

  function removeSet(set: SetLog<T>) {
    setSets(
      sets.filter((otherSet) => {
        return otherSet != set;
      })
    );
  }

  type RowAccumulator = { rows: React.ReactNode[]; num: number };
  const { rows: $rows } = sets.reduce(
    (acc: RowAccumulator, set: SetLog<T>) => {
      const num = !set.warmup ? acc.num + 1 : acc.num;
      return {
        num,
        rows: [
          ...acc.rows,
          <ExerciseLogTableRow
            key={set.id}
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
    <View style={{ marginBottom: 20 }}>
      <View style={[styles.row, { justifyContent: 'space-between' }]}>
        <Text style={{ fontWeight: 'bold', color: 'rgba(0, 128, 255, 0.9)' }}>
          {name}
        </Text>
        <IUIButton type="negative" onPress={onRemove}>
          Remove
        </IUIButton>
      </View>
      <ExerciseLogTableHeader type={type} />
      {$rows}
      <IUIButton
        style={{ marginHorizontal: 10, marginTop: 10 }}
        onPress={() => {
          setSets(sets.concat(createSetLog(type, false)));
        }}
      >
        + Add Set
      </IUIButton>
    </View>
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
        <IUICheckbox
          style={{ backgroundColor: 'transparent' }}
          checked={false}
          setChecked={(checked) => {}}
        ></IUICheckbox>
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
  const colorValue = useAnimatedValue(0);
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
      Animated.spring(colorValue, {
        toValue: 0,
        useNativeDriver: false,
      }).start(() => {
        if (set.done) {
          updateSet({
            done: false,
          } as Partial<SetLog<T>>);
        }
      });
    }
  }, [set, canFinishSet]);

  return (
    <IUIDismissable onDismiss={onDismiss}>
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
          <IUICheckbox
            checked={set.done}
            disabled={!canFinishSet}
            setChecked={(checked) => {
              updateSet({
                done: checked,
              } as Partial<SetLog<T>>);

              if (checked) {
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
          ></IUICheckbox>
        </View>
      </Animated.View>
    </IUIDismissable>
  );
}

function SetIndicator({ set, num }: { set: AnySetLog; num: number }) {
  return (
    <View
      style={{
        alignItems: 'center',
        borderRadius: 5,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        padding: 5,
      }}
    >
      <Text style={{ fontWeight: 'bold' }}>{set.warmup ? 'w' : num}</Text>
    </View>
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
