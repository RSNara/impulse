import type {
  AnySetLog,
  ExerciseLog,
  ExerciseType,
  SetLog,
} from '@/data/store';
import { emptyTimer, useTimer } from '@/data/store';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  useAnimatedValue,
} from 'react-native';
import IUIButton from '../../iui/IUIButton';
import IUIDismissable from '../../iui/IUIDismissable';
import { IUINumericTextInput } from '../../iui/IUITextInput';
import createSetLog from './createSetLog';

export default function ExerciseLogTable<T extends ExerciseType>(
  props: {
    loaded: {
      type: 'loaded';
      log: ExerciseLog<'loaded'>;
      pastLog: ExerciseLog<'loaded'> | null;
      setSetLogs: (sets: ReadonlyArray<SetLog<'loaded'>>) => void;
      onRemove: () => void;
    };
    reps: {
      type: 'reps';
      log: ExerciseLog<'reps'>;
      pastLog: ExerciseLog<'reps'> | null;
      setSetLogs: (sets: ReadonlyArray<SetLog<'reps'>>) => void;
      onRemove: () => void;
    };
    time: {
      type: 'time';
      log: ExerciseLog<'time'>;
      pastLog: ExerciseLog<'time'> | null;
      setSetLogs: (sets: ReadonlyArray<SetLog<'time'>>) => void;
      onRemove: () => void;
    };
  }[T]
) {
  let $rows = null;
  switch (props.type) {
    case 'loaded':
      $rows = (
        <ExerciseLogTableRows<'loaded'>
          type={props.type}
          setLogs={props.log.setLogs}
          pastSetLogs={props.pastLog?.setLogs || null}
          setSetLogs={props.setSetLogs}
        />
      );
      break;
    case 'reps':
      $rows = (
        <ExerciseLogTableRows<'reps'>
          type={props.type}
          setLogs={props.log.setLogs}
          pastSetLogs={props.pastLog?.setLogs || null}
          setSetLogs={props.setSetLogs}
        />
      );
      break;
    case 'time':
      $rows = (
        <ExerciseLogTableRows<'time'>
          type={props.type}
          setLogs={props.log.setLogs}
          pastSetLogs={props.pastLog?.setLogs || null}
          setSetLogs={props.setSetLogs}
        />
      );
      break;
  }

  return (
    <IUIDismissable
      style={{ marginBottom: 20 }}
      onDismiss={props.onRemove}
      towards="left"
    >
      <View style={[styles.row, { justifyContent: 'space-between' }]}>
        <Text style={{ fontWeight: 'bold', color: 'rgba(0, 128, 255, 1)' }}>
          {props.log.name}
        </Text>
      </View>
      <ExerciseLogTableHeader type={props.type} />
      {$rows}
      <View style={{ marginHorizontal: 10, marginTop: 10 }}>
        <IUIButton
          type="secondary"
          feeling="neutral"
          onPress={() => {
            switch (props.type) {
              case 'reps':
                props.setSetLogs(
                  props.log.setLogs.concat(createSetLog(props.type, false))
                );
                return;
              case 'loaded':
                props.setSetLogs(
                  props.log.setLogs.concat(createSetLog(props.type, false))
                );
                return;
              case 'time':
                props.setSetLogs(
                  props.log.setLogs.concat(createSetLog(props.type, false))
                );
                return;
            }
          }}
        >
          + Add Set
        </IUIButton>
      </View>
    </IUIDismissable>
  );
}

function ExerciseLogTableRows<T extends ExerciseType>(
  props: {
    loaded: {
      type: 'loaded';
      setLogs: ReadonlyArray<SetLog<'loaded'>>;
      pastSetLogs: ReadonlyArray<SetLog<'loaded'>> | null;
      setSetLogs: (setLogs: ReadonlyArray<SetLog<'loaded'>>) => void;
    };
    reps: {
      type: 'reps';
      setLogs: ReadonlyArray<SetLog<'reps'>>;
      pastSetLogs: ReadonlyArray<SetLog<'reps'>> | null;
      setSetLogs: (setLogs: ReadonlyArray<SetLog<'reps'>>) => void;
    };
    time: {
      type: 'time';
      setLogs: ReadonlyArray<SetLog<'time'>>;
      pastSetLogs: ReadonlyArray<SetLog<'time'>> | null;
      setSetLogs: (setLogs: ReadonlyArray<SetLog<'time'>>) => void;
    };
  }[T]
) {
  type RowAccumulator = {
    rows: React.ReactNode[];
    workingNum: number;
    warmupNum: number;
  };

  switch (props.type) {
    case 'loaded': {
      let { rows: $rows } = props.setLogs.reduce(
        (acc: RowAccumulator, setLog: SetLog<'loaded'>) => {
          const warmupNum = setLog.warmup ? acc.warmupNum + 1 : acc.warmupNum;
          const workingNum = !setLog.warmup
            ? acc.workingNum + 1
            : acc.workingNum;
          const pastSetLogs = props.pastSetLogs || [];
          const pastSetLog: SetLog<'loaded'> | null = setLog.warmup
            ? pastSetLogs.filter((setLog) => setLog.warmup)[warmupNum]
            : pastSetLogs.filter((setLog) => !setLog.warmup)[workingNum];
          return {
            workingNum,
            warmupNum,
            rows: [
              ...acc.rows,
              <ExerciseLogTableRow<'loaded'>
                key={setLog.id}
                setLog={setLog}
                pastSetLog={pastSetLog}
                num={setLog.warmup ? warmupNum : workingNum}
                updateSetLog={(update) => {
                  props.setSetLogs(
                    props.setLogs.map((otherSetLog) => {
                      return otherSetLog == setLog
                        ? { ...otherSetLog, ...update }
                        : otherSetLog;
                    })
                  );
                }}
                onDismiss={() => {
                  props.setSetLogs(
                    props.setLogs.filter((otherSetLog) => {
                      return otherSetLog != setLog;
                    })
                  );
                }}
              />,
            ],
          };
        },
        { rows: [], workingNum: 0, warmupNum: 0 }
      );
      return $rows;
    }
    case 'reps': {
      const { rows: $rows } = props.setLogs.reduce(
        (acc: RowAccumulator, setLog: SetLog<'reps'>) => {
          const warmupNum = setLog.warmup ? acc.warmupNum + 1 : acc.warmupNum;
          const workingNum = !setLog.warmup
            ? acc.workingNum + 1
            : acc.workingNum;
          const pastSetLogs = props.pastSetLogs || [];
          const pastSetLog: SetLog<'reps'> | null = setLog.warmup
            ? pastSetLogs.filter((setLog) => setLog.warmup)[warmupNum]
            : pastSetLogs.filter((setLog) => !setLog.warmup)[workingNum];
          return {
            workingNum,
            warmupNum,
            rows: [
              ...acc.rows,
              <ExerciseLogTableRow<'reps'>
                key={setLog.id}
                setLog={setLog}
                pastSetLog={pastSetLog}
                num={setLog.warmup ? warmupNum : workingNum}
                updateSetLog={(update) => {
                  props.setSetLogs(
                    props.setLogs.map((otherSetLog) => {
                      return otherSetLog == setLog
                        ? { ...otherSetLog, ...update }
                        : otherSetLog;
                    })
                  );
                }}
                onDismiss={() => {
                  props.setSetLogs(
                    props.setLogs.filter((otherSetLog) => {
                      return otherSetLog != setLog;
                    })
                  );
                }}
              />,
            ],
          };
        },
        { rows: [], workingNum: 0, warmupNum: 0 }
      );
      return $rows;
    }
    case 'time': {
      const { rows: $rows } = props.setLogs.reduce(
        (acc: RowAccumulator, setLog: SetLog<'time'>) => {
          const warmupNum = setLog.warmup ? acc.warmupNum + 1 : acc.warmupNum;
          const workingNum = !setLog.warmup
            ? acc.workingNum + 1
            : acc.workingNum;
          const pastSetLogs = props.pastSetLogs || [];
          const pastSetLog: SetLog<'time'> | null = setLog.warmup
            ? pastSetLogs.filter((setLog) => setLog.warmup)[warmupNum]
            : pastSetLogs.filter((setLog) => !setLog.warmup)[workingNum];
          return {
            workingNum,
            warmupNum,
            rows: [
              ...acc.rows,
              <ExerciseLogTableRow<'time'>
                key={setLog.id}
                setLog={setLog}
                pastSetLog={pastSetLog}
                num={setLog.warmup ? warmupNum : workingNum}
                updateSetLog={(update) => {
                  props.setSetLogs(
                    props.setLogs.map((otherSetLog) => {
                      return otherSetLog == setLog
                        ? { ...otherSetLog, ...update }
                        : otherSetLog;
                    })
                  );
                }}
                onDismiss={() => {
                  props.setSetLogs(
                    props.setLogs.filter((otherSetLog) => {
                      return otherSetLog != setLog;
                    })
                  );
                }}
              />,
            ],
          };
        },
        { rows: [], workingNum: 0, warmupNum: 0 }
      );
      return $rows;
    }
  }
}

function ExerciseLogTableRow<T extends ExerciseType>({
  num,
  setLog,
  pastSetLog,
  updateSetLog,
  onDismiss,
}: {
  num: number;
  setLog: SetLog<T>;
  pastSetLog: SetLog<T> | null;
  updateSetLog: (partial: Partial<SetLog<T>>) => void;
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
      updateSetLog({
        done: false,
      } as Partial<SetLog<T>>);

      Animated.spring(colorValue, {
        toValue: 0,
        useNativeDriver: false,
      }).start();
    }
  }, [setLog, canFinishSet]);

  // TODO: Is there a better way to start the timer...
  // Kinda weird to be having to use the global timer like this.
  const [, setTimer] = useTimer();
  const router = useRouter();

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
          <SetIndicator
            setLog={setLog}
            num={num}
            onPress={() => {
              updateSetLog({
                ...setLog,
                warmup: !setLog.warmup,
              });
            }}
          />
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
                onChange={(time) => updateSetLog({ time } as SetLog<T>)}
              />
            </View>
          ) : null}
          {setLog.type === 'loaded' ? (
            <View style={rowStyles.data}>
              <IUINumericTextInput
                value={setLog.mass}
                onChange={(mass) => updateSetLog({ mass } as SetLog<T>)}
              />
            </View>
          ) : null}
          {setLog.type == 'loaded' || setLog.type == 'reps' ? (
            <View style={rowStyles.data}>
              <IUINumericTextInput
                value={setLog.reps}
                onChange={(reps) => updateSetLog({ reps } as SetLog<T>)}
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
              updateSetLog({
                done: isDone,
              } as Partial<SetLog<T>>);
              if (isDone) {
                setTimer({
                  ...emptyTimer(),
                  ticking: true,
                });

                Animated.timing(colorValue, {
                  toValue: 1,
                  duration: 200,
                  useNativeDriver: false,
                }).start(() => {
                  setTimeout(() => {
                    router.navigate('/timer');
                  });
                });
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

function SetIndicator({
  setLog,
  num,
  onPress,
}: {
  setLog: AnySetLog;
  num: number;
  onPress: () => void;
}) {
  return (
    <IUIButton
      type="secondary"
      feeling={setLog.warmup ? 'mild' : 'neutral'}
      onPress={onPress}
    >
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
