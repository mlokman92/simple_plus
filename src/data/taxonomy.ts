import { palette } from '@/theme';
import type {
  Concern,
  ConcernKey,
  Goal,
  MetricKey,
  MetricRating,
  SkinTypeOption,
} from '@/types';

export const CONCERNS: Concern[] = [
  { key: 'dryness', label: 'Dryness', blurb: 'Tight, flaky patches', emoji: '🌵' },
  { key: 'acne', label: 'Acne', blurb: 'Breakouts & congestion', emoji: '🔴' },
  { key: 'redness', label: 'Redness', blurb: 'Flushing & irritation', emoji: '🌸' },
  { key: 'unevenTone', label: 'Uneven Tone', blurb: 'Patchy, blotchy areas', emoji: '🎨' },
  { key: 'oiliness', label: 'Oiliness', blurb: 'Shine through the day', emoji: '💧' },
  { key: 'sensitivity', label: 'Sensitivity', blurb: 'Reacts to new products', emoji: '🍃' },
  { key: 'darkSpots', label: 'Dark Spots', blurb: 'Post-acne marks, melasma', emoji: '🟤' },
  { key: 'fineLines', label: 'Fine Lines', blurb: 'Early signs of ageing', emoji: '〰️' },
  { key: 'largePores', label: 'Large Pores', blurb: 'Visible on nose & cheeks', emoji: '🔍' },
  { key: 'dullness', label: 'Dullness', blurb: 'Lacking glow', emoji: '☁️' },
];

export const CONCERN_BY_KEY: Record<ConcernKey, Concern> = Object.fromEntries(
  CONCERNS.map((c) => [c.key, c]),
) as Record<ConcernKey, Concern>;

export const SKIN_TYPES: SkinTypeOption[] = [
  { key: 'normal', label: 'Normal', blurb: 'Balanced, rarely reacts', emoji: '😊' },
  { key: 'dry', label: 'Dry', blurb: 'Tight after cleansing', emoji: '🏜️' },
  { key: 'oily', label: 'Oily', blurb: 'Shiny within a few hours', emoji: '✨' },
  { key: 'combination', label: 'Combination', blurb: 'Oily T-zone, dry cheeks', emoji: '🌗' },
  { key: 'sensitive', label: 'Sensitive', blurb: 'Stings, flushes easily', emoji: '🌡️' },
];

export const GOALS: Goal[] = [
  { key: 'clearAcne', label: 'Clear breakouts', blurb: 'Fewer spots, calmer skin', emoji: '🎯' },
  { key: 'evenTone', label: 'Even my tone', blurb: 'Fade marks & patches', emoji: '🌤️' },
  { key: 'hydrate', label: 'Deep hydration', blurb: 'Plump, bouncy skin', emoji: '💦' },
  { key: 'antiAging', label: 'Slow ageing', blurb: 'Soften fine lines', emoji: '⏳' },
  { key: 'glow', label: 'Get my glow', blurb: 'Bright, healthy finish', emoji: '🌟' },
  { key: 'calmRedness', label: 'Calm redness', blurb: 'Less flushing', emoji: '🧊' },
  { key: 'oilControl', label: 'Control shine', blurb: 'Matte through the day', emoji: '🪞' },
  { key: 'minimalRoutine', label: 'Keep it simple', blurb: 'Under 5 minutes', emoji: '⚡' },
];

export const METRIC_META: Record<
  MetricKey,
  { label: string; color: string; short: string; unit: string }
> = {
  hydration: { label: 'Hydration', color: palette.hydration, short: 'Hydra', unit: 'moisture' },
  oil: { label: 'Oil Balance', color: palette.oil, short: 'Oil', unit: 'sebum' },
  texture: { label: 'Texture', color: palette.texture, short: 'Text', unit: 'smoothness' },
  evenness: { label: 'Evenness', color: palette.evenness, short: 'Even', unit: 'tone' },
  sensitivity: { label: 'Sensitivity', color: palette.sensitivity, short: 'Sens', unit: 'calm' },
  spots: { label: 'Blemishes', color: palette.spots, short: 'Spots', unit: 'clarity' },
};

export const METRIC_ORDER: MetricKey[] = [
  'hydration',
  'oil',
  'texture',
  'evenness',
  'sensitivity',
  'spots',
];

export function ratingFor(value: number): MetricRating {
  if (value >= 85) return 'excellent';
  if (value >= 72) return 'good';
  if (value >= 58) return 'fair';
  return 'watch';
}

export const RATING_LABEL: Record<MetricRating, string> = {
  excellent: 'Excellent',
  good: 'Good',
  fair: 'Fair',
  watch: 'Watch',
};

export const RATING_COLOR: Record<MetricRating, string> = {
  excellent: palette.good,
  good: palette.good,
  fair: palette.warn,
  watch: palette.alert,
};

/** Plain-language readouts keyed by metric + rating band. */
export const METRIC_READOUT: Record<MetricKey, Record<MetricRating, string>> = {
  hydration: {
    excellent: 'Moisture levels are strong all day',
    good: 'Well hydrated, small dip by evening',
    fair: 'Dips in the afternoon — add a mist',
    watch: 'Running dry, barrier is working hard',
  },
  oil: {
    excellent: 'Sebum is beautifully balanced',
    good: 'Light shine in the T-zone only',
    fair: 'T-zone gets oily by midday',
    watch: 'Excess oil is clogging pores',
  },
  texture: {
    excellent: 'Smooth and refined throughout',
    good: 'Mostly smooth, slight roughness on the chin',
    fair: 'Some congestion around the nose',
    watch: 'Noticeable bumps and unevenness',
  },
  evenness: {
    excellent: 'Tone is remarkably uniform',
    good: 'Even overall, faint marks on the cheeks',
    fair: 'Patchiness across the cheeks',
    watch: 'Visible discolouration and marks',
  },
  sensitivity: {
    excellent: 'Barrier is calm and resilient',
    good: 'Low reactivity — keep it gentle',
    fair: 'Mild flushing detected',
    watch: 'Barrier is compromised, pause actives',
  },
  spots: {
    excellent: 'Clear — no active blemishes',
    good: 'A couple of healing spots',
    fair: 'Small cluster on the chin',
    watch: 'Active breakout in progress',
  },
};
