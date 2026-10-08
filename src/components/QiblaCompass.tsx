import { StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';
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
  /** Whether the Qibla is currently aligned with the pointer arrow. */
  isAligned: boolean;
  /** Called when the user taps the help link. */
  onHelpPress: () => void;
};

const TICK_COUNT = 72;
const CARDINAL_DIRECTIONS = [
  { label: 'N', angle: 0 },
  { label: 'E', angle: 90 },
  { label: 'S', angle: 180 },
  { label: 'W', angle: 270 },
];

const QiblaCompass = ({
  qiblaBearing,
  dialRotation,
  bearingLabel,
  isAligned,
  onHelpPress,
}: QiblaCompassProps) => {
  const { theme } = useTheme();
  const { width, height } = useWindowDimensions();
  // Android 16 ignores portrait lock on large screens, so cap by height to fit landscape
  const compassSize = Math.min(width * 0.8, height * 0.5);
  const compassRadius = compassSize / 2;
  const arrowColor = isAligned ? theme.colors.aligned : theme.colors.secondary;
  const pointerColor = isAligned ? theme.colors.aligned : theme.colors.primary;

  const dialStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${dialRotation.value}deg` }],
  }));

  const qiblaLineStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${dialRotation.value + qiblaBearing}deg` }],
  }));

  return (
    <View style={styles.container}>
      <View style={[styles.scrim, { backgroundColor: theme.colors.background + 'CC' }]}>
        <View style={[styles.compassWrapper, { width: compassSize, height: compassSize }]}>
          <Animated.View
            style={[
              styles.dial,
              {
                width: compassSize,
                height: compassSize,
                borderRadius: compassRadius,
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
                    transform: [{ rotate: `${angle}deg` }, { translateY: -(compassRadius - 24) }],
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
                        { translateY: -(compassRadius - (isMinor ? 8 : 5)) },
                      ],
                    },
                  ]}
                />
              );
            })}
          </Animated.View>

          <Animated.View style={[styles.qiblaIndicator, { height: compassSize }, qiblaLineStyle]}>
            <View style={[styles.arrowTip, { borderBottomColor: arrowColor }]} />
            <View
              style={[
                styles.arrowNeck,
                { height: compassRadius - 56, backgroundColor: arrowColor },
              ]}
            />
            <View style={[styles.arrowKaabaRing, { backgroundColor: arrowColor }]}>
              <FontAwesome6 name="kaaba" size={16} color={theme.colors.background} />
            </View>
          </Animated.View>

          <View style={[styles.directionArrow, { borderBottomColor: pointerColor }]} />
        </View>

        <Text style={[styles.bearingText, { color: theme.colors.text }]}>{bearingLabel}</Text>
        <Text style={[styles.subText, { color: theme.colors.text + '80' }]}>
          Direction to Qibla
        </Text>
        <TouchableOpacity onPress={onHelpPress} hitSlop={8} style={styles.helpLink}>
          <Text style={[styles.helpText, { color: theme.colors.primary }]}>Need help?</Text>
        </TouchableOpacity>
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
  helpLink: {
    marginTop: 16,
  },
  helpText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    textDecorationLine: 'underline',
  },
});
