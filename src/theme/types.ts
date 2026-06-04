export {};

declare module '@rneui/themed' {
  export interface Colors {
    /** Primary text color. */
    text: string;
    /** Light surface background used for cards and inputs. */
    bgLight: string;
    /** Color for slider tracks and subtle dividers. */
    sliderTrack: string;
    /** Color used to highlight the Qibla arrow when it aligns with the pointer. */
    aligned: string;
  }
}
