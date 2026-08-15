/** Domain model for the Simple+ prototype. All data is mocked in `src/data`. */

export type MetricKey =
  | 'hydration'
  | 'oil'
  | 'texture'
  | 'evenness'
  | 'sensitivity'
  | 'spots';

export type MetricRating = 'excellent' | 'good' | 'fair' | 'watch';

export interface Metric {
  key: MetricKey;
  label: string;
  /** 0-100, higher is always better. */
  value: number;
  /** Change vs. the previous scan, in points. */
  delta: number;
  rating: MetricRating;
  /** One-line plain-language readout shown under the metric. */
  readout: string;
  color: string;
}

export type ConcernKey =
  | 'dryness'
  | 'acne'
  | 'redness'
  | 'unevenTone'
  | 'oiliness'
  | 'sensitivity'
  | 'darkSpots'
  | 'fineLines'
  | 'largePores'
  | 'dullness';

export interface Concern {
  key: ConcernKey;
  label: string;
  blurb: string;
  emoji: string;
}

export type SkinType = 'normal' | 'dry' | 'oily' | 'combination' | 'sensitive';

export interface SkinTypeOption {
  key: SkinType;
  label: string;
  blurb: string;
  emoji: string;
}

export type GoalKey =
  | 'clearAcne'
  | 'evenTone'
  | 'hydrate'
  | 'antiAging'
  | 'glow'
  | 'calmRedness'
  | 'oilControl'
  | 'minimalRoutine';

export interface Goal {
  key: GoalKey;
  label: string;
  blurb: string;
  emoji: string;
}

export type ProductCategory =
  | 'cleanser'
  | 'toner'
  | 'serum'
  | 'moisturizer'
  | 'sunscreen'
  | 'treatment'
  | 'mask'
  | 'exfoliant';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  /** Price in MYR. */
  price: number;
  size: string;
  /** 0-100 AI match against the user's skin profile. */
  matchScore: number;
  halalCertified: boolean;
  dermTested: boolean;
  fragranceFree: boolean;
  keyIngredients: string[];
  /** Why the AI picked it, in the user's language. */
  whyPicked: string;
  targets: ConcernKey[];
  benefits: string[];
  /** Illustration tint pair for the generated bottle artwork. */
  tint: [string, string];
  rating: number;
  reviewCount: number;
  /** Local availability line — Cradle pitch cares about the MY supply chain. */
  availableAt: string;
}

export type TimeOfDay = 'am' | 'pm' | 'weekly';

export interface RoutineStep {
  id: string;
  productId: string;
  /** 1-based position within its time-of-day block. */
  order: number;
  timeOfDay: TimeOfDay;
  /** Display time, e.g. "8:00 AM". */
  scheduledAt: string;
  /** Coaching note from the AI. */
  coachNote: string;
  durationSec: number;
  /** Weekly cadence label, only for `weekly` steps. */
  cadence?: string;
}

export interface ScanZoneFinding {
  /** Normalised 0-1 coordinates over the face illustration. */
  x: number;
  y: number;
  label: string;
  severity: 'low' | 'medium' | 'high';
  note: string;
}

export interface Scan {
  id: string;
  /** ISO date. */
  date: string;
  score: number;
  metrics: Record<MetricKey, number>;
  findings: ScanZoneFinding[];
  headline: string;
  summary: string;
  /** Environment snapshot at scan time. */
  conditions: string;
}

export interface ScoreHistoryPoint {
  /** Short label for the x-axis, e.g. "W1" or "Mar". */
  label: string;
  score: number;
  date: string;
}

export interface Achievement {
  id: string;
  title: string;
  blurb: string;
  emoji: string;
  unlocked: boolean;
  progress?: number;
  target?: number;
}

export interface Insight {
  id: string;
  title: string;
  body: string;
  kind: 'win' | 'watch' | 'tip' | 'prediction';
  emoji: string;
}

export interface DermMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  /** Optional product suggestions rendered under an AI message. */
  productIds?: string[];
  /** Optional follow-up chips. */
  suggestions?: string[];
  timestamp: string;
}

export interface DermScript {
  id: string;
  /** Chip label the user taps. */
  prompt: string;
  /** Keywords for matching free-typed input. */
  keywords: string[];
  reply: string;
  productIds?: string[];
  suggestions?: string[];
}

export interface EnvironmentSnapshot {
  city: string;
  uvIndex: number;
  uvLabel: string;
  humidity: number;
  temperature: number;
  airQuality: number;
  airQualityLabel: string;
  /** AI advisory generated from the above. */
  advisory: string;
}

export interface UserProfile {
  name: string;
  initials: string;
  ageRange: string;
  city: string;
  skinType: SkinType;
  concerns: ConcernKey[];
  goals: GoalKey[];
  /** Onboarding lifestyle answers. */
  lifestyle: {
    sleepHours: number;
    waterGlasses: number;
    stress: 'low' | 'medium' | 'high';
    sunExposure: 'low' | 'medium' | 'high';
  };
  memberSince: string;
  isPremium: boolean;
}

export interface PhotoLogEntry {
  id: string;
  label: string;
  date: string;
  score: number;
  /** Placeholder swatch used instead of a real photo in the prototype. */
  tint: [string, string];
}

export type Language = 'en' | 'ms';
