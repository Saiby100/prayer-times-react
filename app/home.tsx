import { Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function Home() {
  const params = useLocalSearchParams();
  const { area } = params;
  return <Text>You chose { area }</Text>;
}
