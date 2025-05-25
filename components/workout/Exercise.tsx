import { StyleSheet, Text, View } from 'react-native';
import IUIButton from '../iui/IUIButton';
import IUICheckbox from '../iui/IUICheckbox';
import { IUINumericTextInput } from '../iui/IUITextInput';

type SetUnion = LoadedSet | RepsSet | TimeSet;

type LoadedSet = {
  type: 'loaded';
  indicator: 'w' | number;
  done: boolean;
  previous?: {
    mass: number;
    reps: number;
  };
  mass: number | null;
  reps: number | null;
};

type RepsSet = {
  type: 'reps';
  indicator: 'w' | number;
  done: boolean;
  previous?: {
    reps: number;
  };
  reps: number | null;
};

type TimeSet = {
  type: 'time';
  indicator: 'w' | number;
  done: boolean;
  previous?: {
    time: number;
  };
  time: number | null;
};

export type Set<T extends ExerciseType> = {
  loaded: LoadedSet;
  reps: RepsSet;
  time: TimeSet;
}[T];

function createSet<T extends ExerciseType>(type: T): Set<T> {
  if (type == 'time') {
    return {
      type: 'time',
      time: null,
      previous: undefined,
      done: false,
      indicator: 'w',
    } as Set<T>;
  }

  if (type == 'loaded') {
    return {
      type: 'loaded',
      mass: null,
      reps: null,
      previous: undefined,
      done: false,
      indicator: 'w',
    } as Set<T>;
  }

  return {
    type: 'reps',
    reps: null,
    previous: undefined,
    done: false,
    indicator: 'w',
  } as Set<T>;
}

type ExerciseType = 'loaded' | 'reps' | 'time';

type LoadedExercise = {
  name: string;
  type: 'loaded';
  sets: ReadonlyArray<Set<'loaded'>>;
};

type RepsExercise = {
  name: string;
  type: 'reps';
  sets: ReadonlyArray<Set<'reps'>>;
};

type TimeExercise = {
  name: string;
  type: 'time';
  sets: ReadonlyArray<Set<'time'>>;
};

export type Exercise<T extends ExerciseType> = {
  loaded: LoadedExercise;
  reps: RepsExercise;
  time: TimeExercise;
}[T];

export type ExerciseTableProps<T extends ExerciseType> = {
  name: string;
  type: T;
  sets: ReadonlyArray<Set<T>>;
  setSets: (sets: ReadonlyArray<Set<T>>) => void;
};

export default function ExerciseTable<T extends ExerciseType>(
  props: ExerciseTableProps<T>
) {
  function updateSet(set: Set<T>, update: Partial<Set<T>>) {
    props.setSets(
      props.sets.map((otherSet) => {
        return set == otherSet ? { ...set, ...update } : otherSet;
      })
    );
  }

  return (
    <View style={{ marginBottom: 30 }}>
      <View style={styles.row}>
        <Text style={{ fontWeight: 'bold', color: 'rgba(0, 128, 255, 0.9)' }}>
          {props.name}
        </Text>
      </View>
      <ExerciseTableHeader type={props.type} />
      {props.sets.map((set, i) => (
        <ExerciseTableRow
          key={i}
          set={set}
          updateSet={(partial) => updateSet(set, partial)}
        />
      ))}
      <IUIButton
        onPress={() => {
          props.setSets(props.sets.concat(createSet(props.type)));
        }}
      >
        + Add Set
      </IUIButton>
    </View>
  );
}

function ExerciseTableHeader({ type }: { type: ExerciseType }) {
  return (
    <View style={styles.row}>
      <View style={headingStyles.setNum}>
        <Title>Set</Title>
      </View>
      <View style={headingStyles.previous}>
        <Title>Previous</Title>
      </View>
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
      <View style={{ flex: 1 }}>
        <IUICheckbox checked={false} setChecked={(checked) => {}}></IUICheckbox>
      </View>
    </View>
  );

  function Title({ children }: { children: string }) {
    return <Text style={{ fontWeight: 'bold' }}>{children}</Text>;
  }
}

function ExerciseTableRow<T extends ExerciseType>({
  set,
  updateSet,
}: {
  set: Set<T>;
  updateSet: (partial: Partial<Set<T>>) => void;
}) {
  return (
    <View style={styles.row}>
      <View style={rowStyles.setNum}>
        <SetIndicator indicator={set.indicator} />
      </View>
      <View style={rowStyles.previous}>
        <SetPreviousPerformance set={set} />
      </View>
      {set.type === 'time' ? (
        <View style={rowStyles.data}>
          <IUINumericTextInput
            value={set.time}
            onChange={(time) => updateSet({ time } as Set<T>)}
          />
        </View>
      ) : null}
      {set.type === 'loaded' ? (
        <View style={rowStyles.data}>
          <IUINumericTextInput
            value={set.mass}
            onChange={(mass) => updateSet({ mass } as Set<T>)}
          />
        </View>
      ) : null}
      {set.type == 'loaded' || set.type == 'reps' ? (
        <View style={rowStyles.data}>
          <IUINumericTextInput
            value={set.reps}
            onChange={(reps) => updateSet({ reps } as Set<T>)}
          />
        </View>
      ) : null}
      <View style={rowStyles.done}>
        <IUICheckbox
          checked={set.done}
          setChecked={(checked) => {
            updateSet({ done: checked } as Partial<Set<T>>);
          }}
        ></IUICheckbox>
      </View>
    </View>
  );
}

function SetIndicator({ indicator }: { indicator: SetUnion['indicator'] }) {
  return (
    <View
      style={{
        alignItems: 'center',
        borderRadius: 5,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        padding: 5,
      }}
    >
      <Text style={{ fontWeight: 'bold' }}>{indicator}</Text>
    </View>
  );
}

function SetPreviousPerformance({ set }: { set: SetUnion }) {
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
  row: { flexDirection: 'row', marginBottom: 10 },
});

const headingStyles = StyleSheet.create({
  setNum: { flex: 1, justifyContent: 'center' },
  previous: {
    flex: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  data: {
    flex: 4,
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
    flex: 6,
    justifyContent: 'center',
  },
  data: {
    flex: 4,
    justifyContent: 'center',
  },
  done: {
    flex: 1,
    justifyContent: 'center',
  },
});
