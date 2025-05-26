import { Text } from 'react-native';
export default function Icon({ children }: { children: string }) {
  return <Text style={{ fontWeight: 'bold' }}>{children}</Text>;
}
