import { TextInput } from 'react-native';

export function IUINumericTextInput<T>({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  return (
    <TextInput
      style={{
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: 5,
        padding: 5,
        marginEnd: 5,
      }}
      value={value != null ? String(value) : ''}
      inputMode="numeric"
      textAlign="center"
      onChangeText={(change) => {
        onChange(change == '' ? null : Number(change));
      }}
    />
  );
}
