import { useRouter } from 'expo-router';
import { Button, SafeAreaView } from 'react-native';

export default function Index() {
  const router = useRouter();
  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Button
        onPress={() => {
          router.push('/workout');
        }}
        title="Workout"
      />
    </SafeAreaView>
  );
}
