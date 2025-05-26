import { Pressable, Text, View, ViewStyle } from 'react-native';

export default function Checkbox({
  checked,
  setChecked,
  disabled = false,
  style = {},
}: {
  checked: boolean;
  disabled?: boolean;
  setChecked: (checked: boolean) => void;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      onPress={() => {
        if (disabled) {
          return;
        }
        setChecked(!checked);
      }}
    >
      <View
        style={{
          borderRadius: 5,
          padding: 5,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: disabled
            ? 'rgba(0, 0, 0, 0.025)'
            : checked
            ? 'green'
            : 'rgba(0, 0, 0, 0.1)',
          ...style,
        }}
      >
        <Text
          style={{
            fontWeight: 'bold',
            color: disabled
              ? 'rgba(0, 0, 0, 0.25)'
              : checked
              ? 'white'
              : 'black',
          }}
        >
          {'✓'}
        </Text>
      </View>
    </Pressable>
  );
}
