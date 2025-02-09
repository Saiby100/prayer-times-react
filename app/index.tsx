import React, {  useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { useRouter, useFocusEffect } from 'expo-router';
import PTApi from "../utils/PTApi";
import getStorage from "../utils/localStore";
import Areas from "./areas";
import LoadingList from "@/components/LoadingList";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const [areas, setAreas] = useState<string[]>([]);
  const api = new PTApi();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useFocusEffect(() => {
    const area = 'Cape Town'; // getStorage('area');

    if (area) {
      router.replace('/areas');
      router.push({pathname: '/home', params: { area }});
    } else {
      router.replace('/areas');
    }

    setIsLoading(false);
  });

  return isLoading ? <SafeAreaView style={styles.container}><LoadingList /></SafeAreaView> : <Areas />;

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 30,
    padding: 10,
    justifyContent: 'center',
  },
});
