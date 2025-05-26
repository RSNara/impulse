import IUIIcon from '@/components/iui/IUIIcon';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

export default function TabLayout() {
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
        name="history"
        options={{
          title: 'Past Logs',
          tabBarIcon: ({ color }) => <IUIIcon>📜</IUIIcon>,
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: 'Database',
          tabBarIcon: ({ color }) => <IUIIcon>🏋</IUIIcon>,
        }}
      />
    </Tabs>
  );
}
