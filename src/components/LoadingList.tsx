import { View } from 'react-native';
import { Skeleton } from '@rneui/themed';

const LoadingList = () => {
  return (
    <View style={{ gap: 8 }}>
      <Skeleton width={300} height={50} style={{ marginHorizontal: 'auto' }} />
      <Skeleton width={300} height={50} style={{ marginHorizontal: 'auto' }} />
      <Skeleton width={300} height={50} style={{ marginHorizontal: 'auto' }} />
      <Skeleton width={300} height={50} style={{ marginHorizontal: 'auto' }} />
      <Skeleton width={300} height={50} style={{ marginHorizontal: 'auto' }} />
    </View>
  );
};

export default LoadingList;