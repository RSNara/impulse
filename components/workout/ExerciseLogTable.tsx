import type {
  AnySetLog,
  ExerciseLog,
  ExerciseType,
  SetLog,
} from '@/data/store';
import { createSetLog, emptyTimer, useTimer } from '@/data/store';
import assertNever from '@/utils/assertNever';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  useAnimatedValue,
} from 'react-native';
import IUIButton from '../iui/IUIButton';
import IUISwipeToDismiss from '../iui/IUISwipeToDismiss';
import { IUINumericTextInput } from '../iui/IUITextInput';

export default function ExerciseLogTable<T extends ExerciseType>(
  props: {
    weights: {
      type: 'weights';
      name: string;
      log: ExerciseLog<'weights'>;
      pastLog: ExerciseLog<'weights'> | null;
      setSetLogs: (sets: ReadonlyArray<SetLog<'weights'>>) => void;
      onRemove: () => void;
    };
    reps: {
      type: 'reps';
      name: string;
      log: ExerciseLog<'reps'>;
      pastLog: ExerciseLog<'reps'> | null;
      setSetLogs: (sets: ReadonlyArray<SetLog<'reps'>>) => void;
      onRemove: () => void;
    };
    time: {
      type: 'time';
      name: string;
      log: ExerciseLog<'time'>;
      pastLog: ExerciseLog<'time'> | null;
      setSetLogs: (sets: ReadonlyArray<SetLog<'time'>>) => void;
      onRemove: () => void;
    };
  }[T]
) {
  let $rows = null;
  switch (props.type) {
    case 'weights':
      $rows = (
        <ExerciseLogTableRows<'weights'>
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
    default:
      assertNever(props);
  }

  return (
    <IUISwipeToDismiss
      style={{ marginBottom: 20 }}
      onDismiss={props.onRemove}
      towards="left"
    >
      <View style={[styles.row, { justifyContent: 'space-between' }]}>
        <Text style={{ fontWeight: 'bold', color: 'rgba(0, 128, 255, 1)' }}>
          {props.name}
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
                break;
              case 'weights':
                props.setSetLogs(
                  props.log.setLogs.concat(createSetLog(props.type, false))
                );
                break;
              case 'time':
                props.setSetLogs(
                  props.log.setLogs.concat(createSetLog(props.type, false))
                );
                break;
              default:
                assertNever(props);
            }
          }}
        >
          + Add Set
        </IUIButton>
      </View>
    </IUISwipeToDismiss>
  );
}

function ExerciseLogTableRows<T extends ExerciseType>(
  props: {
    weights: {
      type: 'weights';
      setLogs: ReadonlyArray<SetLog<'weights'>>;
      pastSetLogs: ReadonlyArray<SetLog<'weights'>> | null;
      setSetLogs: (setLogs: ReadonlyArray<SetLog<'weights'>>) => void;
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

  let $rows = null;
  switch (props.type) {
    case 'weights':
      ({ rows: $rows } = props.setLogs.reduce(
        (acc: RowAccumulator, setLog: SetLog<'weights'>) => {
          const warmupNum = setLog.warmup ? acc.warmupNum + 1 : acc.warmupNum;
          const workingNum = !setLog.warmup
            ? acc.workingNum + 1
            : acc.workingNum;
          const pastSetLogs = props.pastSetLogs || [];
          const pastSetLog: SetLog<'weights'> | null = setLog.warmup
            ? pastSetLogs.filter((setLog) => setLog.warmup)[warmupNum - 1]
            : pastSetLogs.filter((setLog) => !setLog.warmup)[workingNum - 1];
          return {
            workingNum,
            warmupNum,
            rows: [
              ...acc.rows,
              <ExerciseLogTableRow<'weights'>
                key={setLog.id}
                setLog={setLog}
                type={props.type}
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
      ));
      break;

    case 'reps':
      ({ rows: $rows } = props.setLogs.reduce(
        (acc: RowAccumulator, setLog: SetLog<'reps'>) => {
          const warmupNum = setLog.warmup ? acc.warmupNum + 1 : acc.warmupNum;
          const workingNum = !setLog.warmup
            ? acc.workingNum + 1
            : acc.workingNum;
          const pastSetLogs = props.pastSetLogs || [];
          const pastSetLog: SetLog<'reps'> | null = setLog.warmup
            ? pastSetLogs.filter((setLog) => setLog.warmup)[warmupNum - 1]
            : pastSetLogs.filter((setLog) => !setLog.warmup)[workingNum - 1];
          return {
            workingNum,
            warmupNum,
            rows: [
              ...acc.rows,
              <ExerciseLogTableRow<'reps'>
                key={setLog.id}
                type={props.type}
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
      ));
      break;

    case 'time':
      ({ rows: $rows } = props.setLogs.reduce(
        (acc: RowAccumulator, setLog: SetLog<'time'>) => {
          const warmupNum = setLog.warmup ? acc.warmupNum + 1 : acc.warmupNum;
          const workingNum = !setLog.warmup
            ? acc.workingNum + 1
            : acc.workingNum;
          const pastSetLogs = props.pastSetLogs || [];
          const pastSetLog: SetLog<'time'> | null = setLog.warmup
            ? pastSetLogs.filter((setLog) => setLog.warmup)[warmupNum - 1]
            : pastSetLogs.filter((setLog) => !setLog.warmup)[workingNum - 1];
          return {
            workingNum,
            warmupNum,
            rows: [
              ...acc.rows,
              <ExerciseLogTableRow<'time'>
                key={setLog.id}
                type={props.type}
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
      ));
      break;
    default:
      assertNever(props);
  }

  return $rows;
}

function ExerciseLogTableRow<T extends ExerciseType>(
  props: {
    weights: {
      type: 'weights';
      num: number;
      setLog: SetLog<'weights'>;
      pastSetLog: SetLog<'weights'> | null;
      updateSetLog: (partial: Partial<SetLog<'weights'>>) => void;
      onDismiss: () => void;
    };
    reps: {
      type: 'reps';
      num: number;
      setLog: SetLog<'reps'>;
      pastSetLog: SetLog<'reps'> | null;
      updateSetLog: (partial: Partial<SetLog<'reps'>>) => void;
      onDismiss: () => void;
    };
    time: {
      num: number;
      type: 'time';
      setLog: SetLog<'time'>;
      pastSetLog: SetLog<'time'> | null;
      updateSetLog: (partial: Partial<SetLog<'time'>>) => void;
      onDismiss: () => void;
    };
  }[T]
) {
  const colorValue = useAnimatedValue(props.setLog.done ? 1 : 0);
  const backgroundColor = colorValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(0, 255, 0, 0)', 'rgba(0, 255, 0, 0.125)'],
    extrapolate: 'clamp',
  });

  const canFinishSet = !(
    (props.setLog.type === 'time' && props.setLog.time == null) ||
    (props.setLog.type == 'weights' &&
      (props.setLog.reps == null || props.setLog.mass == null)) ||
    (props.setLog.type == 'reps' && props.setLog.reps == null)
  );

  useEffect(() => {
    if (!canFinishSet && props.setLog.done) {
      props.updateSetLog({
        done: false,
      });

      Animated.spring(colorValue, {
        toValue: 0,
        useNativeDriver: false,
      }).start();
    }
  }, [props.setLog, canFinishSet]);

  // TODO: Is there a better way to start the timer...
  // Kinda weird to be having to use the global timer like this.
  const [, setTimer] = useTimer();
  const router = useRouter();

  return (
    <IUISwipeToDismiss onDismiss={props.onDismiss} towards="right">
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
            warmup={props.setLog.warmup}
            num={props.num}
            onPress={() => {
              props.updateSetLog({
                warmup: !props.setLog.warmup,
              });
            }}
          />
        </View>
        <View style={rowStyles.previous}>
          <SetPreviousPerf pastSetLog={props.pastSetLog} />
        </View>
        <View style={rowStyles.dataContainer}>
          {(props.type == 'time' || props.type == 'reps') && (
            <View style={rowStyles.data} />
          )}
          {props.type === 'time' ? (
            <View style={rowStyles.data}>
              <IUINumericTextInput
                value={props.setLog.time}
                onChange={(time) => {
                  props.updateSetLog({ time });
                }}
              />
            </View>
          ) : null}
          {props.type === 'weights' ? (
            <View style={rowStyles.data}>
              <IUINumericTextInput
                value={props.setLog.mass}
                onChange={(mass) => props.updateSetLog({ mass })}
              />
            </View>
          ) : null}
          {props.type == 'weights' || props.type == 'reps' ? (
            <View style={rowStyles.data}>
              <IUINumericTextInput
                value={props.setLog.reps}
                onChange={(reps) => props.updateSetLog({ reps })}
              />
            </View>
          ) : null}
        </View>
        <View style={rowStyles.done}>
          <IUIButton
            disabled={!canFinishSet}
            type={props.setLog.done ? 'primary' : 'secondary'}
            feeling={props.setLog.done ? 'done' : 'neutral'}
            onPress={() => {
              const isDone = !props.setLog.done;
              props.updateSetLog({
                done: isDone,
              });
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
    </IUISwipeToDismiss>
  );
}

function SetIndicator(props: {
  warmup: boolean;
  num: number;
  onPress: () => void;
}) {
  return (
    <IUIButton
      type="secondary"
      feeling={props.warmup ? 'mild' : 'neutral'}
      onPress={props.onPress}
    >
      {props.warmup ? 'w' : String(props.num)}
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
        {pastSetLog && pastSetLog.type == 'weights'
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
        {type == 'weights' && (
          <View style={headingStyles.data}>
            <Title>Mass</Title>
          </View>
        )}
        {(type == 'weights' || type == 'reps') && (
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
