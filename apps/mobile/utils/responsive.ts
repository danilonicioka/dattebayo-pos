import { Dimensions, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');

// Guideline sizes are based on standard ~5" screen mobile device
// e.g. iPhone 11 (375x812) is a good baseline
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

// Used to scale horizontally (padding, margin, width)
const scale = (size: number) => (width / guidelineBaseWidth) * size;

// Used to scale vertically (paddingVertical, height)
const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;

// Used for fonts, and less aggressive scaling depending on a factor
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

// Specifically for font sizes to respect user system preferences (Accessibility)
const fontScale = (size: number) => size * PixelRatio.getFontScale();

export { scale, verticalScale, moderateScale, fontScale };
