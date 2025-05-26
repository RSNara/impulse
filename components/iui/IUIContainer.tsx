import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native';

export default function Container({ children }: { children: React.ReactNode }) {
  const tabBarHeight = useBottomTabBarHeight();
  console.log(tabBarHeight);
  return (
    <SafeAreaView style={{ flex: 1, marginBottom: tabBarHeight }}>
      {children}
    </SafeAreaView>
  );
}
