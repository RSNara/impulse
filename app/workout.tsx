import IUIButton from '@/components/iui/IUIButton';
import IUIModal from '@/components/iui/IUIModal';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, Text, View } from 'react-native';

function Workout() {
  return (
    <View>
      <Text>Workout view</Text>
    </View>
  );
}

export default function WorkoutLayout() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: 'space-between',
      }}
    >
      <Workout />
      <WorkoutExitModal
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      />

      <IUIButton
        type="positive"
        onPress={() => {
          setShowModal(true);
        }}
      >
        Finish
      </IUIButton>
    </SafeAreaView>
  );
}

function WorkoutExitModal({
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
