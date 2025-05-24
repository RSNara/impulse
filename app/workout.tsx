import IUIButton from '@/components/IUIButton';
import IUIModal from '@/components/IUIModal';
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
      <IUIModal visible={showModal} onRequestClose={() => setShowModal(false)}>
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
