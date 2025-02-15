import { Stack } from "expo-router";

export default function RootLayout() {
  return (
  <Stack>
    <Stack.Screen name="index" options={{headerShown: false}}/>
    <Stack.Screen name="areas" options={{title: 'Select Area'}}/>
    <Stack.Screen name="home" options={({route}) => ({title: route?.params?.area})}/>
  </Stack>
  );
}
