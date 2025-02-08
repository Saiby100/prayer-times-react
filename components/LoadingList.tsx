import { StyleSheet, FlatList, View } from "react-native";
import { Skeleton } from '@rneui/themed';

const LoadingList = () => {
  return (
    <View style={{ gap: 8 }}>
      <Skeleton
        animation="pulse"
        width={300}
        height={50}
        style={{ marginHorizontal: "auto" }}
      />
      <Skeleton
        animation="pulse"
        width={300}
        height={50}
        style={{ marginHorizontal: "auto" }}
      />
      <Skeleton
        animation="pulse"
        width={300}
        height={50}
        style={{ marginHorizontal: "auto" }}
      />
      <Skeleton
        animation="pulse"
        width={300}
        height={50}
        style={{ marginHorizontal: "auto" }}
      />
      <Skeleton
        animation="pulse"
        width={300}
        height={50}
        style={{ marginHorizontal: "auto" }}
      />
    </View>
  )
};

const styles = StyleSheet.create({
  listStyle: { gap: 8 }
})

export default LoadingList;
