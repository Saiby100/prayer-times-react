import React, { useEffect, useState } from "react";
import { Text, Button } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router } from 'expo-router';
import PTApi from "../utils/PTApi";
import getStorage from "../utils/localStore";
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import TextButton  from '../components/TextButton';

const Stack = createNativeStackNavigator();

export default function Index() {
  const [areas, setAreas] = useState<string[]>([]);
  const api = new PTApi();

  const navigateAreas = () => {
    router.replace('/areas');
  }
  const navigateHome = () => {
    router.replace('/home');
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "center",
      }}
    >
      <Text style={{ marginBottom: 20 }}>Choose Your Area</Text>
      <Link replace href="/areas">
        <Button
          onPress={navigateAreas}
          color="#841584"
          accessibilityLabel="Learn more about this purple button"
          title="Choose"
        />
      </Link>
    </SafeAreaView>
  );
}
