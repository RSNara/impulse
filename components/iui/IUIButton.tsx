import * as React from 'react';
import { Pressable, Text, View } from 'react-native';

export default function IUIButton2({
  children,
  type = 'primary',
  feeling = 'neutral',
  disabled = false,
  onPress = () => {},
}: {
  children: string;
  type: 'primary' | 'secondary' | 'tertiary';
  feeling: 'neutral' | 'positive' | 'done' | 'negative' | 'mild';
  disabled?: boolean;
  onPress?: () => void;
}) {
  const { color, backgroundColor } = getProps();

  return (
    <Pressable
      onPress={() => {
        if (!disabled) {
          onPress();
        }
      }}
    >
      <View
        style={{
          backgroundColor,
          borderRadius: 5,
          padding: 5,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={[{ color, fontWeight: 'bold' }]}>{children}</Text>
      </View>
    </Pressable>
  );

  function getColor(): [number, number, number] {
    switch (feeling) {
      case 'done':
        return [0, 127, 0];
      case 'positive':
        return [0, 127, 255];
      case 'negative':
        return [255, 32, 64];
      case 'neutral':
        return [0, 0, 0];
      case 'mild':
        return [255, 127, 63];
    }
  }

  function getProps(): { color: string; backgroundColor: string } {
    const [r, g, b] = getColor();
    const alphaScale = disabled ? 0.25 : 1;

    switch (type) {
      case 'primary':
        return {
          color: `rgba(255, 255, 255, 1)`,
          backgroundColor: `rgba(${r}, ${g}, ${b}, ${alphaScale})`,
        };
      case 'secondary':
        return {
          color: `rgba(${r}, ${g}, ${b}, ${alphaScale})`,
          backgroundColor: `rgba(${r}, ${g}, ${b}, ${0.1 * alphaScale})`,
        };
      case 'tertiary':
        return {
          color: `rgba(${r}, ${g}, ${b}, ${alphaScale})`,
          backgroundColor: `transparent`,
        };
    }
  }
}
