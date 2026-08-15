/**
 * Simple+ design tokens.
 * Derived from the marketing assets: cool clinical blues, a blue -> green brand
 * gradient lifted from the logo mark, generous white cards on a tinted canvas.
 */

export const palette = {
  // Brand
  ink: '#0B2545',
  inkSoft: '#12335C',
  blue: '#1E6FD9',
  blueDeep: '#1558B0',
  blueBright: '#3D8BF2',
  blueTint: '#E8F1FD',
  blueTintStrong: '#D3E4FA',
  green: '#2FA36B',
  greenBright: '#4FBE72',
  greenLime: '#6CBF4B',
  greenTint: '#E4F5EB',

  // Canvas
  canvas: '#EAF3FC',
  canvasSoft: '#F4F9FE',
  surface: '#FFFFFF',
  surfaceSunken: '#F2F7FD',

  // Text
  text: '#0B2545',
  textSecondary: '#54759B',
  textMuted: '#8FA9C6',
  textOnBrand: '#FFFFFF',

  // Lines
  border: '#E1EDF9',
  borderStrong: '#CFE0F2',

  // Semantic
  good: '#22A06B',
  goodTint: '#E4F5EB',
  warn: '#E9963A',
  warnTint: '#FDF0E1',
  alert: '#E2604B',
  alertTint: '#FCEAE7',
  info: '#1E6FD9',
  infoTint: '#E8F1FD',

  // Metric accents
  hydration: '#2E8FE0',
  oil: '#4FB8E8',
  texture: '#7B8FE8',
  evenness: '#9B7BE8',
  sensitivity: '#57C08A',
  spots: '#E9963A',

  // Utility
  shadow: '#0B2545',
  overlay: 'rgba(11, 37, 69, 0.45)',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const gradients = {
  /** Logo mark gradient: blue at the top, lime green at the tail. */
  brand: ['#2E6FD9', '#2FA36B', '#6CBF4B'] as const,
  brandSoft: ['#3D8BF2', '#4FBE72'] as const,
  /** Primary CTA. */
  action: ['#2478E4', '#1558B0'] as const,
  /** Screen canvas wash. */
  canvas: ['#EAF3FC', '#F7FBFF'] as const,
  canvasDeep: ['#DCEAFA', '#EEF6FF'] as const,
  /** Score ring sweep. */
  score: ['#2E8FE0', '#4FBE72'] as const,
  /** Premium / upsell. */
  premium: ['#12335C', '#1E6FD9'] as const,
  scanOverlay: ['rgba(30,111,217,0.00)', 'rgba(30,111,217,0.35)'] as const,
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  giant: 56,
} as const;

export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 28,
  round: 999,
} as const;

export const fonts = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
} as const;

type TypeStyle = {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing?: number;
};

export const type: Record<
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'body'
  | 'bodyStrong'
  | 'bodySm'
  | 'label'
  | 'caption'
  | 'micro'
  | 'number',
  TypeStyle
> = {
  display: { fontFamily: fonts.extrabold, fontSize: 34, lineHeight: 40, letterSpacing: -0.8 },
  h1: { fontFamily: fonts.extrabold, fontSize: 27, lineHeight: 33, letterSpacing: -0.6 },
  h2: { fontFamily: fonts.bold, fontSize: 21, lineHeight: 27, letterSpacing: -0.35 },
  h3: { fontFamily: fonts.bold, fontSize: 17, lineHeight: 23, letterSpacing: -0.2 },
  h4: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 21, letterSpacing: -0.1 },
  body: { fontFamily: fonts.medium, fontSize: 14.5, lineHeight: 21 },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 14.5, lineHeight: 21 },
  bodySm: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 19 },
  label: { fontFamily: fonts.semibold, fontSize: 12.5, lineHeight: 17, letterSpacing: 0.1 },
  caption: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 },
  micro: { fontFamily: fonts.semibold, fontSize: 10.5, lineHeight: 14, letterSpacing: 0.5 },
  number: { fontFamily: fonts.extrabold, fontSize: 40, lineHeight: 44, letterSpacing: -1.6 },
};

export const shadow = {
  none: {},
  card: {
    shadowColor: palette.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  raised: {
    shadowColor: palette.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 14 },
    elevation: 8,
  },
  floating: {
    shadowColor: palette.blueDeep,
    shadowOpacity: 0.28,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
} as const;

/** Vertical rhythm used by every screen shell. */
export const layout = {
  screenPadding: 20,
  cardPadding: 16,
  tabBarHeight: 68,
  maxContentWidth: 480,
} as const;
