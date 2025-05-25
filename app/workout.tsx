import IUIButton from '@/components/iui/IUIButton';
import IUICheckbox from '@/components/iui/IUICheckbox';
import IUIModal from '@/components/iui/IUIModal';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, Text, TextInput, View } from 'react-native';

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
        <WorkoutHeader
          title={workoutName}
          onFinish={() => setShowModal(true)}
        />
        <WorkoutExercise name={'Bench Press'} type="loaded" />
      </View>
      <WorkoutFinishModal
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      />
    </SafeAreaView>
  );
}

type Exercise = {
  name: string;
  type: 'loaded';
};

function WorkoutExercise({ name, type }: Exercise) {
  const title = (
    <View>
      <Text style={{ fontWeight: 'bold', color: 'rgba(0, 128, 255, 0.9)' }}>
        {name}
      </Text>
    </View>
  );

  const header = (
    <View style={{ flexDirection: 'row', marginTop: 10 }}>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={{ fontWeight: 'bold' }}>Set</Text>
      </View>
      <View style={{ flex: 6, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontWeight: 'bold' }}>Previous</Text>
      </View>
      <View style={{ flex: 4, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontWeight: 'bold' }}>Mass</Text>
      </View>
      <View style={{ flex: 4, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontWeight: 'bold' }}>Reps</Text>
      </View>
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

  const [mass, setMass] = useState(0);
  const [reps, setReps] = useState(0);
  const [done, setDone] = useState(false);

  const row = (
    <View style={{ flexDirection: 'row', marginTop: 10 }}>
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
          <Text style={{ fontWeight: 'bold' }}>W</Text>
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
          <Text style={{ fontWeight: 'bold' }}> 45 x 8 (W)</Text>
        </View>
      </View>
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
          value={mass ? String(mass) : ''}
          inputMode="numeric"
          textAlign="center"
          onChangeText={(change) => {
            setMass(Number(change));
          }}
        />
      </View>
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
          value={reps ? String(reps) : ''}
          inputMode="numeric"
          textAlign="center"
          onChangeText={(change) => {
            setReps(Number(change));
          }}
        />
      </View>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
        }}
      >
        <IUICheckbox
          checked={done}
          setChecked={(checked) => {
            setDone(checked);
          }}
        ></IUICheckbox>
      </View>
    </View>
  );

  return (
    <View>
      {title}
      {header}
      {row}
    </View>
  );
}

function WorkoutHeader({
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

function WorkoutFinishModal({
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
