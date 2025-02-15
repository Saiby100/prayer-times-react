import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { useRouter, useFocusEffect } from 'expo-router';
import getStorage from "../utils/localStore";
import LoadingList from "@/components/LoadingList";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeMode } from "@rneui/themed";

export default function Index() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const { setMode } = useThemeMode();

  useFocusEffect(() => {
    const storage = getStorage();
    const area = storage.getString('area');
    setMode(storage.getString('themeMode') || 'light');

    if (area) {
      router.replace('/areas');
      router.push({pathname: '/home', params: { area }});
    } else {
      router.replace('/areas');
    }

    setIsLoading(false);
  });

  return isLoading ? <SafeAreaView style={styles.container}><LoadingList /></SafeAreaView> : null;

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 30,
    padding: 10,
    justifyContent: 'center',
  },
});
