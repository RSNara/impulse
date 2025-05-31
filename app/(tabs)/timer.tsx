import IUIContainer from '@/components/iui/IUIContainer';
import { StyleSheet, View } from 'react-native';
import CircularProgress from 'react-native-circular-progress-indicator';

export default function ExercisesScreen() {
  return (
    <IUIContainer>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress
          value={0}
          radius={120}
          maxValue={10}
          initialValue={10}
          progressValueColor={'#fff'}
          activeStrokeWidth={15}
          inActiveStrokeWidth={15}
          duration={10000}
          onAnimationComplete={() => alert('time out')}
        />
      </View>
    </IUIContainer>
  );
}

const styles = StyleSheet.create({
  exercise: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
});
