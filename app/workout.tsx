import IUIButton from '@/components/iui/IUIButton';
import IUICheckbox from '@/components/iui/IUICheckbox';
import IUIModal from '@/components/iui/IUIModal';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';

export default function WorkoutLog() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const workoutName = 'HI C&S';
  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: 'space-between',
      }}
    >
      <View style={{ padding: 10 }}>
        <WOHeader title={workoutName} onFinish={() => setShowModal(true)} />
        <ScrollView>
          <WOExercise name={'Bench Press'} type="loaded" />
          <WOExercise name={'Sprints'} type="time" />
          <WOExercise name={'Hip Key'} type="reps" />
        </ScrollView>
      </View>
      <WOFinishModal
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      />
    </SafeAreaView>
  );
}

type Exercise = {
  name: string;
  type: 'loaded' | 'reps' | 'time';
};

type ExerciseSet =
  | {
      type: 'loaded';
      id: 'w' | number;
      done: boolean;
      previous?: {
        mass: number;
        reps: number;
      };
      mass: number | null;
      reps: number | null;
    }
  | {
      type: 'reps';
      id: 'w' | number;
      done: boolean;
      previous?: {
        reps: number;
      };
      reps: number | null;
    }
  | {
      type: 'time';
      id: 'w' | number;
      done: boolean;
      previous?: {
        time: number;
      };
      time: number | null;
    };

function WOExercise({ name, type }: Exercise) {
  const $title = (
    <View style={{ marginBottom: 10 }}>
      <Text style={{ fontWeight: 'bold', color: 'rgba(0, 128, 255, 0.9)' }}>
        {name}
      </Text>
    </View>
  );

  const $header = (
    <View style={{ flexDirection: 'row', marginBottom: 10 }}>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={{ fontWeight: 'bold' }}>Set</Text>
      </View>
      <View style={{ flex: 6, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontWeight: 'bold' }}>Previous</Text>
      </View>
      {type == 'time' && (
        <View
          style={{ flex: 4, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ fontWeight: 'bold' }}>Time</Text>
        </View>
      )}
      {type == 'loaded' && (
        <View
          style={{
            flex: 4,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontWeight: 'bold' }}>Mass</Text>
        </View>
      )}
      {(type == 'loaded' || type == 'reps') && (
        <View
          style={{ flex: 4, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ fontWeight: 'bold' }}>Reps</Text>
        </View>
      )}
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
        }}
      >
        <IUICheckbox checked={false} setChecked={(checked) => {}}></IUICheckbox>
      </View>
    </View>
  );

  const [sets, setSets] = useState<ReadonlyArray<ExerciseSet>>(
    type == 'time'
      ? [
          {
            type: 'time',
            time: null,
            previous: undefined,
            done: false,
            id: 'w',
          },
        ]
      : type == 'loaded'
      ? [
          {
            type: 'loaded',
            mass: null,
            reps: null,
            previous: undefined,
            done: false,
            id: 'w',
          },
        ]
      : [
          {
            type: 'reps',
            reps: null,
            previous: undefined,
            done: false,
            id: 'w',
          },
        ]
  );

  function pushSet() {
    if (type == 'time') {
      setSets([
        ...sets,
        {
          type: 'time',
          time: null,
          previous: undefined,
          done: false,
          id: 'w',
        },
      ]);
      return;
    }

    if (type == 'loaded') {
      setSets([
        ...sets,
        {
          type: 'loaded',
          mass: null,
          reps: null,
          previous: undefined,
          done: false,
          id: 'w',
        },
      ]);
      return;
    }

    if (type == 'reps') {
      setSets([
        ...sets,
        {
          type: 'reps',
          reps: null,
          previous: undefined,
          done: false,
          id: 'w',
        },
      ]);
    }
  }

  function updateSet(i: number, newSet: Partial<ExerciseSet>) {
    setSets(
      sets.map((oldSet, j) => {
        if (i == j) {
          return Object.assign({}, oldSet, newSet);
        }
        return oldSet;
      })
    );
  }

  const $rows = sets.map((set, i) => {
    return (
      <WOExerciseSet
        key={i}
        set={set}
        updateSet={(partial) => updateSet(i, partial)}
      />
    );
  });

  const $addSet = (
    <IUIButton
      onPress={() => {
        pushSet();
      }}
    >
      + Add Set
    </IUIButton>
  );

  return (
    <View style={{ marginBottom: 30 }}>
      {$title}
      {$header}
      {$rows}
      {$addSet}
    </View>
  );
}

function WOExerciseSet({
  set,
  updateSet,
}: {
  set: ExerciseSet;
  updateSet: (partial: Partial<ExerciseSet>) => void;
}) {
  return (
    <View style={{ flexDirection: 'row', marginBottom: 10 }}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            alignItems: 'center',
            borderRadius: 5,
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            padding: 5,
          }}
        >
          <Text style={{ fontWeight: 'bold' }}>{set.id}</Text>
        </View>
      </View>
      <View
        style={{
          flex: 6,
          justifyContent: 'center',
        }}
      >
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
            {set.previous && set.type == 'time'
              ? `${set.previous.time}s`
              : null}
          </Text>
        </View>
      </View>
      {set.type === 'time' ? (
        <View
          style={{
            flex: 4,
            justifyContent: 'center',
          }}
        >
          <TextInput
            style={{
              backgroundColor: 'rgba(0,0,0,0.1)',
              borderRadius: 5,
              padding: 5,
              marginEnd: 5,
            }}
            value={set.time ? String(set.time) : ''}
            inputMode="numeric"
            textAlign="center"
            onChangeText={(change) => {
              updateSet({ time: change == '' ? null : Number(change) });
            }}
          />
        </View>
      ) : null}
      {set.type === 'loaded' ? (
        <View
          style={{
            flex: 4,
            justifyContent: 'center',
          }}
        >
          <TextInput
            style={{
              backgroundColor: 'rgba(0,0,0,0.1)',
              borderRadius: 5,
              padding: 5,
              marginEnd: 5,
            }}
            value={set.mass ? String(set.mass) : ''}
            inputMode="numeric"
            textAlign="center"
            onChangeText={(change) => {
              updateSet({ mass: change == '' ? null : Number(change) });
            }}
          />
        </View>
      ) : null}
      {set.type == 'loaded' || set.type == 'reps' ? (
        <View
          style={{
            flex: 4,
            justifyContent: 'center',
          }}
        >
          <TextInput
            style={{
              backgroundColor: 'rgba(0,0,0,0.1)',
              borderRadius: 5,
              padding: 5,
              marginEnd: 5,
            }}
            value={set.reps ? String(set.reps) : ''}
            inputMode="numeric"
            textAlign="center"
            onChangeText={(change) => {
              updateSet({ reps: change == '' ? null : Number(change) });
            }}
          />
        </View>
      ) : null}
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
        }}
      >
        <IUICheckbox
          checked={set.done}
          setChecked={(checked) => {
            updateSet({ done: checked });
          }}
        ></IUICheckbox>
      </View>
    </View>
  );
}

function WOHeader({
  title,
  onFinish,
}: {
  title: string;
  onFinish: () => void;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
      }}
    >
      <View>
        <Text style={{ fontWeight: 'bold' }}>{title}</Text>
      </View>
      <IUIButton type="positive" onPress={onFinish}>
        Finish
      </IUIButton>
    </View>
  );
}

function WOFinishModal({
  visible,
  onRequestClose,
}: {
  visible: boolean;
  onRequestClose: () => void;
}) {
  const router = useRouter();
  return (
    <IUIModal visible={visible} onRequestClose={onRequestClose}>
      <View style={{ alignItems: 'center', padding: 20 }}>
        <Text style={{ fontWeight: 'bold' }}>🙌</Text>
      </View>
      <View style={{ alignItems: 'center', paddingBottom: 20 }}>
        <Text style={{ fontWeight: 'bold' }}>Finished Workout?</Text>
      </View>
      <IUIButton
        type="positive"
        onPress={() => {
          router.back();
        }}
        style={{ marginBottom: 10 }}
      >
        Finish Workout
      </IUIButton>
      <IUIButton
        type="negative"
        onPress={() => {
          router.back();
        }}
        style={{ marginBottom: 10 }}
      >
        Cancel Workout
      </IUIButton>
    </IUIModal>
  );
}
