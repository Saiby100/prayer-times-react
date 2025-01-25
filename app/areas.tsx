import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, StyleSheet } from "react-native";
import TextButton  from '../components/TextButton';
import { useEffect, useState } from "react";
import PTApi from "../utils/PTApi";

export default function Areas() {
  const api = new PTApi();
  const [areas, setAreas]  = useState([]);

  const fetchAreas = async () => {
    const fetchedAreas = await api.fetchAreas();
    setAreas(fetchedAreas)
  }

  useEffect(() => {
    fetchAreas();
  }, [])

  return (
    <SafeAreaView>
      <ScrollView>
        {areas.map((area: string, index: number) => (
          <TextButton key={index} title={area} onPress={() => { console.log('area', area); }} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  default: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 8
  },
  shadow: {
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
  },
  pressed: {
    opacity: 0.7
  }
});
