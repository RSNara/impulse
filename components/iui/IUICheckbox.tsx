import { Pressable, Text, View } from 'react-native';

export default function Checkbox({
  checked,
  setChecked,
}: {
  checked: boolean;
  setChecked: (checked: boolean) => void;
}) {
  return (
    <Pressable
      onPress={() => {
        setChecked(!checked);
      }}
    >
      <View
        style={{
          borderRadius: 5,
          padding: 5,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: checked ? 'green' : 'rgba(0, 0, 0, 0.1)',
        }}
      >
        <Text
          style={{
            color: checked ? 'white' : 'black',
          }}
        >
          {'✓'}
        </Text>
      </View>
    </Pressable>
  );
}
