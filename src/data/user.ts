import type {
  Achievement,
  EnvironmentSnapshot,
  Insight,
  MetricKey,
  PhotoLogEntry,
  Scan,
  ScoreHistoryPoint,
  UserProfile,
} from '@/types';

/** The demo persona. Named to match the marketing assets. */
export const DEMO_USER: UserProfile = {
  name: 'Sarah',
  initials: 'SA',
  ageRange: '25–34',
  city: 'Kuala Lumpur',
  skinType: 'combination',
  concerns: ['acne', 'unevenTone', 'oiliness', 'sensitivity'],
  goals: ['clearAcne', 'evenTone', 'glow'],
  lifestyle: {
    sleepHours: 6,
    waterGlasses: 5,
    stress: 'medium',
    sunExposure: 'high',
  },
  memberSince: 'Jan 2026',
  isPremium: false,
};

export const CURRENT_METRICS: Record<MetricKey, number> = {
  hydration: 79,
  oil: 74,
  texture: 81,
  evenness: 76,
  sensitivity: 88,
  spots: 84,
};

export const PREVIOUS_METRICS: Record<MetricKey, number> = {
  hydration: 71,
  oil: 70,
  texture: 78,
  evenness: 73,
  sensitivity: 82,
  spots: 79,
};

export const CURRENT_SCORE = 82;
export const PREVIOUS_SCORE = 76;

/** Twelve weeks of history — the trend the pitch leans on. */
export const SCORE_HISTORY: ScoreHistoryPoint[] = [
  { label: 'W1', score: 61, date: '2026-05-25' },
  { label: 'W2', score: 63, date: '2026-06-01' },
  { label: 'W3', score: 62, date: '2026-06-08' },
  { label: 'W4', score: 66, date: '2026-06-15' },
  { label: 'W5', score: 69, date: '2026-06-22' },
  { label: 'W6', score: 68, date: '2026-06-29' },
  { label: 'W7', score: 72, date: '2026-07-06' },
  { label: 'W8', score: 74, date: '2026-07-13' },
  { label: 'W9', score: 73, date: '2026-07-20' },
  { label: 'W10', score: 76, date: '2026-07-27' },
  { label: 'W11', score: 79, date: '2026-08-03' },
  { label: 'W12', score: 82, date: '2026-08-10' },
];

/** Per-metric 6-point series for the Insights detail charts. */
export const METRIC_HISTORY: Record<MetricKey, number[]> = {
  hydration: [58, 62, 65, 69, 71, 79],
  oil: [55, 58, 63, 66, 70, 74],
  texture: [64, 66, 70, 74, 78, 81],
  evenness: [60, 62, 64, 68, 73, 76],
  sensitivity: [70, 72, 76, 79, 82, 88],
  spots: [52, 58, 66, 71, 79, 84],
};

export const SCAN_HISTORY: Scan[] = [
  {
    id: 'scan-12',
    date: '2026-08-10',
    score: 82,
    metrics: CURRENT_METRICS,
    headline: 'Your best week yet',
    summary:
      'Hydration jumped 8 points after you added the essence toner. The chin cluster has almost fully cleared.',
    conditions: 'UV 11 · Humidity 82% · KL',
    findings: [
      { x: 0.47, y: 0.79, label: 'Chin', severity: 'low', note: '2 healing spots, down from 6' },
      { x: 0.33, y: 0.58, label: 'Left cheek', severity: 'medium', note: 'Post-acne marks fading' },
      { x: 0.5, y: 0.54, label: 'Nose', severity: 'low', note: 'Pores slightly congested' },
      { x: 0.42, y: 0.26, label: 'Forehead', severity: 'low', note: 'Clear, mild shine' },
    ],
  },
  {
    id: 'scan-11',
    date: '2026-08-03',
    score: 79,
    metrics: { hydration: 74, oil: 72, texture: 79, evenness: 74, sensitivity: 85, spots: 81 },
    headline: 'Steady progress',
    summary: 'Barrier holding well through a humid week. Oil balance improving.',
    conditions: 'UV 9 · Humidity 88% · KL',
    findings: [
      { x: 0.47, y: 0.79, label: 'Chin', severity: 'medium', note: '4 active spots' },
      { x: 0.33, y: 0.58, label: 'Left cheek', severity: 'medium', note: 'Marks visible' },
    ],
  },
  {
    id: 'scan-10',
    date: '2026-07-27',
    score: 76,
    metrics: PREVIOUS_METRICS,
    headline: 'Barrier recovering',
    summary: 'Pausing the exfoliant for a week paid off — sensitivity is down.',
    conditions: 'UV 10 · Humidity 79% · KL',
    findings: [
      { x: 0.47, y: 0.79, label: 'Chin', severity: 'high', note: '6 active spots' },
      { x: 0.64, y: 0.53, label: 'Right cheek', severity: 'low', note: 'Slight dryness' },
    ],
  },
];

export const LATEST_SCAN = SCAN_HISTORY[0];

export const PHOTO_LOG: PhotoLogEntry[] = [
  { id: 'ph-1', label: 'Baseline', date: '25 May 2026', score: 61, tint: ['#F3D9CE', '#DBB49F'] },
  { id: 'ph-2', label: 'Week 4', date: '15 Jun 2026', score: 66, tint: ['#F5DDD1', '#DFBCA6'] },
  { id: 'ph-3', label: 'Week 8', date: '13 Jul 2026', score: 74, tint: ['#F8E3D8', '#E5C6B1'] },
  { id: 'ph-4', label: 'Today', date: '10 Aug 2026', score: 82, tint: ['#FBEBE1', '#EDD3BF'] },
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'a-streak',
    title: '14-day streak',
    blurb: 'Two weeks without missing your PM routine',
    emoji: '🔥',
    unlocked: true,
  },
  {
    id: 'a-spf',
    title: 'SPF Devotee',
    blurb: 'Sunscreen logged 30 days running',
    emoji: '☀️',
    unlocked: true,
  },
  {
    id: 'a-scan',
    title: 'Consistent Scanner',
    blurb: '12 weekly scans in a row',
    emoji: '📸',
    unlocked: true,
  },
  {
    id: 'a-80',
    title: 'Score 80+',
    blurb: 'Reach a skin score of 80',
    emoji: '🏆',
    unlocked: true,
  },
  {
    id: 'a-90',
    title: 'Score 90 Club',
    blurb: 'Reach a skin score of 90',
    emoji: '💎',
    unlocked: false,
    progress: 82,
    target: 90,
  },
  {
    id: 'a-100days',
    title: '100 Days of Care',
    blurb: 'Complete 100 days of routine',
    emoji: '🌿',
    unlocked: false,
    progress: 78,
    target: 100,
  },
];

export const INSIGHTS: Insight[] = [
  {
    id: 'i-1',
    kind: 'win',
    emoji: '📈',
    title: 'Hydration is your biggest win',
    body: '+8 points in 7 days. The essence toner you added on 3 Aug is doing the heavy lifting — keep it in.',
  },
  {
    id: 'i-2',
    kind: 'prediction',
    emoji: '🔮',
    title: 'On track to hit 87 by mid-September',
    body: 'At your current adherence (91%), Simple+ projects a score of 87 ± 3 in five weeks. Missing PM steps is the main risk.',
  },
  {
    id: 'i-3',
    kind: 'watch',
    emoji: '👀',
    title: 'Oil balance dips on high-humidity days',
    body: 'Across 12 weeks, your oil score drops an average of 6 points when humidity passes 85%. Blot, do not re-cleanse.',
  },
  {
    id: 'i-4',
    kind: 'tip',
    emoji: '😴',
    title: 'Sleep is moving your score',
    body: 'Weeks where you logged 7+ hours averaged 4.2 points higher than weeks at 6 hours or less.',
  },
];

export const ENVIRONMENT: EnvironmentSnapshot = {
  city: 'Kuala Lumpur',
  uvIndex: 11,
  uvLabel: 'Extreme',
  humidity: 82,
  temperature: 33,
  airQuality: 68,
  airQualityLabel: 'Moderate',
  advisory:
    'UV peaks at 1:00 PM today. Reapply SPF before you head out for lunch — that single habit protects most of your evenness gains.',
};

/** Weekly adherence used on Home + Insights. */
export const ADHERENCE = {
  weekPercent: 91,
  streakDays: 14,
  /** Mon..Sun, 0-1 completion. */
  week: [1, 1, 1, 0.5, 1, 1, 0.5],
  amCompletedToday: 2,
  amTotalToday: 4,
  pmCompletedToday: 0,
  pmTotalToday: 4,
};
