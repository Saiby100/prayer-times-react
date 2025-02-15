import { Stack } from "expo-router";
import { createTheme, ThemeProvider } from "@rneui/themed";
import globalStyles from "@/utils/globalStyles";

declare module '@rneui/themed' {
  export interface Colors {
    text: string;
  }
}

export default function RootLayout() {
  const themeConfig = createTheme({
    lightColors: {
      primary: '#2089DC',
      text: '#2089DC',
      secondary: '#ffffff',
      background: '#ffffff'
    },
    darkColors: {
      primary: '#6E61FF',
      text: '#ffffff',
      secondary: '#898EA1',
      background: '#303446'
    },
  })


  return (
  <ThemeProvider theme={themeConfig}>
    <Stack>
      <Stack.Screen name="index" options={{headerShown: false}}/>
      <Stack.Screen name="areas" options={{title: 'Select Area', headerTitleStyle: globalStyles.text}}/>
      <Stack.Screen name="home" options={({route}) => ({title: route?.params?.area , headerTitleStyle: globalStyles.text})}/>
    </Stack>
  </ThemeProvider>
  );
}
