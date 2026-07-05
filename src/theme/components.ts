import { Colors, Theme } from '@rneui/themed';

const font = { fontSize: 18, fontFamily: 'Inter-Medium' };

const components = {
  Button: (props: Record<string, unknown>, theme: Theme & { colors: Colors }) => {
    const icon = props.icon as Record<string, unknown> | undefined;
    return {
      color: theme.colors.bgLight,
      ...props,
      // Default button titles to the primary color. Merge the caller's
      // titleStyle over it so a custom titleStyle (e.g. just fontSize) keeps
      // the color instead of falling back to RNEUI's white default (which is
      // invisible on our light bgLight buttons). Buttons with a colored
      // background (e.g. Qibla's primary button) override this explicitly.
      titleStyle: { ...font, color: theme.colors.primary, ...(props.titleStyle as object) },
      ...(icon ? { icon: { color: theme.colors.primary, ...icon } } : {}),
    };
  },

  Icon: (props: Record<string, unknown>, theme: Theme & { colors: Colors }) => ({
    color: theme.colors.primary,
    ...props,
  }),

  Text: (props: Record<string, unknown>, theme: Theme & { colors: Colors }) => ({
    style: { ...font, color: theme.colors.text },
    ...props,
  }),

  Skeleton: (props: Record<string, unknown>, theme: Theme & { colors: Colors }) => ({
    animation: 'pulse' as const,
    skeletonStyle: { backgroundColor: theme.colors.secondary },
    ...props,
  }),

  ListItemTitle: (props: Record<string, unknown>, theme: Theme & { colors: Colors }) => ({
    style: { color: theme.colors.text, textAlign: 'center' as const },
    ...props,
  }),

  Slider: (props: Record<string, unknown>, theme: Theme & { colors: Colors }) => ({
    thumbStyle: { backgroundColor: theme.colors.primary, width: 24, height: 24, borderRadius: 12 },
    minimumTrackTintColor: theme.colors.primary,
    maximumTrackTintColor: theme.colors.sliderTrack,
    ...props,
  }),
};

export default components;
