import { TextInput } from 'react-native';

export function IUINumericTextInput({
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
        if (change == '') {
          onChange(null);
        } else {
          const parsed = Number(change);
          if (!Number.isNaN(parsed)) {
            onChange(parsed);
          }
        }
      }}
    />
  );
}

export function IUIStringTextInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <TextInput
      style={{
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: 5,
        padding: 5,
        // fontWeight: 'bold',
      }}
      value={value != null ? String(value) : ''}
      inputMode="text"
      textAlign="left"
      onChangeText={onChange}
    />
  );
}
