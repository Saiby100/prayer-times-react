import { Dimensions, StyleSheet, View } from 'react-native';
import { Text, useTheme } from '@rneui/themed';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { SharedValue } from 'react-native-reanimated';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

type QiblaCompassProps = {
  /** Qibla bearing in degrees from true north. */
  qiblaBearing: number;
  /** Animated shared value for dial rotation in degrees. */
  dialRotation: SharedValue<number>;
  /** Formatted bearing label (e.g., "24° NE"). */
  bearingLabel: string;
};

const COMPASS_SIZE = Dimensions.get('window').width * 0.8;
const COMPASS_RADIUS = COMPASS_SIZE / 2;
const TICK_COUNT = 72;
const CARDINAL_DIRECTIONS = [
  { label: 'N', angle: 0 },
  { label: 'E', angle: 90 },
  { label: 'S', angle: 180 },
  { label: 'W', angle: 270 },
];

const QiblaCompass = ({ qiblaBearing, dialRotation, bearingLabel }: QiblaCompassProps) => {
  const { theme } = useTheme();

  const dialStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${dialRotation.value}deg` }],
  }));

  const qiblaLineStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${dialRotation.value + qiblaBearing}deg` }],
  }));

  return (
    <View style={styles.container}>
      <View style={[styles.scrim, { backgroundColor: theme.colors.background + 'CC' }]}>
        <View style={[styles.compassWrapper, { width: COMPASS_SIZE, height: COMPASS_SIZE }]}>
          <Animated.View
            style={[
              styles.dial,
              {
                width: COMPASS_SIZE,
                height: COMPASS_SIZE,
                borderColor: theme.colors.text + '35',
              },
              dialStyle,
            ]}
          >
            {CARDINAL_DIRECTIONS.map(({ label, angle }) => (
              <View
                key={label}
                style={[
                  styles.cardinalContainer,
                  {
                    transform: [{ rotate: `${angle}deg` }, { translateY: -(COMPASS_RADIUS - 24) }],
                  },
                ]}
              >
                <Text
                  style={[
                    styles.cardinalLabel,
                    {
                      color: label === 'N' ? theme.colors.primary : theme.colors.text,
                      transform: [{ rotate: `${-angle}deg` }],
                    },
                  ]}
                >
                  {label}
                </Text>
              </View>
            ))}

            {Array.from({ length: TICK_COUNT }).map((_, i) => {
              const angle = (360 / TICK_COUNT) * i;
              const isMajor = angle % 90 === 0;
              const isMinor = angle % 30 === 0;
              if (isMajor) return null;
              return (
                <View
                  key={i}
                  style={[
                    styles.tick,
                    {
                      height: isMinor ? 10 : 5,
                      backgroundColor: theme.colors.text + (isMinor ? '50' : '20'),
                      transform: [
                        { rotate: `${angle}deg` },
                        { translateY: -(COMPASS_RADIUS - (isMinor ? 8 : 5)) },
                      ],
                    },
                  ]}
                />
              );
            })}
          </Animated.View>

          <Animated.View style={[styles.qiblaIndicator, qiblaLineStyle]}>
            <View style={[styles.arrowTip, { borderBottomColor: theme.colors.primary }]} />
            <View style={[styles.arrowNeck, { backgroundColor: theme.colors.primary }]} />
            <View style={[styles.arrowKaabaRing, { backgroundColor: theme.colors.primary }]}>
              <FontAwesome6 name="kaaba" size={16} color={theme.colors.background} />
            </View>
          </Animated.View>

          <View style={[styles.directionArrow, { borderBottomColor: theme.colors.primary }]} />
        </View>

        <Text style={[styles.bearingText, { color: theme.colors.text }]}>{bearingLabel}</Text>
        <Text style={[styles.subText, { color: theme.colors.text + '80' }]}>
          Direction to Qibla
        </Text>
      </View>
    </View>
  );
};

export default QiblaCompass;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  scrim: {
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 28,
  },
  compassWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dial: {
    borderRadius: COMPASS_RADIUS,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardinalContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardinalLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  tick: {
    position: 'absolute',
    width: 1.5,
  },
  qiblaIndicator: {
    position: 'absolute',
    alignItems: 'center',
    height: COMPASS_SIZE,
  },
  arrowTip: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 18,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  arrowNeck: {
    width: 3,
    height: COMPASS_RADIUS - 56,
    borderRadius: 1.5,
  },
  arrowKaabaRing: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  directionArrow: {
    position: 'absolute',
    top: 8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 14,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  bearingText: {
    fontSize: 28,
    fontFamily: 'Inter-Medium',
    marginTop: 32,
  },
  subText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginTop: 4,
  },
});
