import type { ViewStyle } from 'react-native';
import { Pressable, Text, View } from 'react-native';

export default function IUIButton({
  children,
  type = 'neutral',
  onPress,
  style,
}: {
  children: string;
  type?: 'neutral' | 'positive' | 'done' | 'negative';
  onPress: () => void;
  style?: ViewStyle;
}) {
  const { color, backgroundColor } = getColors();

  return (
    <Pressable onPress={onPress}>
      <View
        style={{
          backgroundColor,
          borderRadius: 5,
          padding: 5,
          justifyContent: 'center',
          alignItems: 'center',
          ...style,
        }}
      >
        <Text style={{ color, fontWeight: 'bold' }}>{children}</Text>
      </View>
    </Pressable>
  );

  function getColors() {
    if (type == 'positive') {
      return {
        color: 'white',
        backgroundColor: 'green',
      };
    } else if (type == 'negative') {
      return {
        color: 'red',
        backgroundColor: 'rgba(255, 0, 0, 0.15)',
      };
    } else {
      return {
        color: 'black',
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
      };
    }
  }
}
