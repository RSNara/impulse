import IUIIcon from '@/components/iui/IUIIcon';
import { useTimer } from '@/data/store';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import CircularProgress from 'react-native-circular-progress-indicator';

export default function TabLayout() {
  const [timer] = useTimer();
  const timeLeft = Math.max(timer.duration - timer.elapsed, 0);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
        animation: 'shift',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Workout',
          tabBarIcon: ({ color }) => <IUIIcon>💪</IUIIcon>,
        }}
      />
      <Tabs.Screen
        name="timer"
        options={{
          title: 'Timer',
          tabBarIcon: ({ color }) => (
            <CircularProgress
              value={Math.floor((timeLeft / timer.duration) * 100)}
              radius={10}
              activeStrokeColor={'rgba(0, 127, 255, 1)'}
              inActiveStrokeColor={'rgba(0, 0, 0, 0.1)'}
              showProgressValue={false}
              subtitleFontSize={50}
            ></CircularProgress>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Past Logs',
          tabBarIcon: ({ color }) => <IUIIcon>📜</IUIIcon>,
        }}
      />
    </Tabs>
  );
}
