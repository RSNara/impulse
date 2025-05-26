import { Tabs } from 'expo-router';
import { Platform, Text } from 'react-native';

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
          tabBarIcon: ({ color }) => <Icon>💪</Icon>,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Past Logs',
          tabBarIcon: ({ color }) => <Icon>📜</Icon>,
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: 'Database',
          tabBarIcon: ({ color }) => <Icon>🏋</Icon>,
        }}
      />
    </Tabs>
  );
}

function Icon({ children }: { children: string }) {
  return <Text style={{ fontWeight: 'bold' }}>{children}</Text>;
}
