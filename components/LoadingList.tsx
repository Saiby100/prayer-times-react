import { StyleSheet, View } from 'react-native';
import { Skeleton } from '@rneui/themed';
import { useTheme } from '@rneui/themed';

const LoadingList = () => {
  const { theme } = useTheme();
  const skeletonStyle = { backgroundColor: theme.colors.secondary };
  return (
    <View style={{ gap: 8 }}>
      <Skeleton
        animation="pulse"
        width={300}
        height={50}
        skeletonStyle={skeletonStyle}
        style={{ marginHorizontal: 'auto' }}
      />
      <Skeleton
        animation="pulse"
        width={300}
        height={50}
        skeletonStyle={skeletonStyle}
        style={{ marginHorizontal: 'auto' }}
      />
      <Skeleton
        animation="pulse"
        width={300}
        height={50}
        skeletonStyle={skeletonStyle}
        style={{ marginHorizontal: 'auto' }}
      />
      <Skeleton
        animation="pulse"
        width={300}
        height={50}
        skeletonStyle={skeletonStyle}
        style={{ marginHorizontal: 'auto' }}
      />
      <Skeleton
        animation="pulse"
        width={300}
        height={50}
        skeletonStyle={skeletonStyle}
        style={{ marginHorizontal: 'auto' }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  listStyle: { gap: 8 },
});

export default LoadingList;
