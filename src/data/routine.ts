import type { RoutineStep } from '@/types';

/** The AI-generated routine for the demo persona. */
export const ROUTINE: RoutineStep[] = [
  // ---- Morning ----
  {
    id: 'r-am-1',
    productId: 'p-cleanser-soothing',
    order: 1,
    timeOfDay: 'am',
    scheduledAt: '8:00 AM',
    coachNote: 'Lukewarm water only. 30 seconds is plenty.',
    durationSec: 30,
  },
  {
    id: 'r-am-2',
    productId: 'p-toner-hydrating',
    order: 2,
    timeOfDay: 'am',
    scheduledAt: '8:02 AM',
    coachNote: 'Press in with damp palms — do not swipe with cotton.',
    durationSec: 20,
  },
  {
    id: 'r-am-3',
    productId: 'p-serum-calming',
    order: 3,
    timeOfDay: 'am',
    scheduledAt: '8:04 AM',
    coachNote: '3 drops. Focus on the cheeks where marks are fading.',
    durationSec: 25,
  },
  {
    id: 'r-am-4',
    productId: 'p-sunscreen-daily',
    order: 4,
    timeOfDay: 'am',
    scheduledAt: '8:08 AM',
    coachNote: 'Two finger-lengths. Reapply at 1 PM — UV is extreme today.',
    durationSec: 40,
  },
  // ---- Evening ----
  {
    id: 'r-pm-1',
    productId: 'p-cleanser-oil',
    order: 1,
    timeOfDay: 'pm',
    scheduledAt: '9:30 PM',
    coachNote: 'Massage onto dry skin for 45s, then emulsify with water.',
    durationSec: 45,
  },
  {
    id: 'r-pm-2',
    productId: 'p-cleanser-soothing',
    order: 2,
    timeOfDay: 'pm',
    scheduledAt: '9:32 PM',
    coachNote: 'Second cleanse. This is where SPF actually comes off.',
    durationSec: 30,
  },
  {
    id: 'r-pm-3',
    productId: 'p-treatment-spot',
    order: 3,
    timeOfDay: 'pm',
    scheduledAt: '9:36 PM',
    coachNote: 'Dab on the chin cluster only. Skip healed spots.',
    durationSec: 15,
  },
  {
    id: 'r-pm-4',
    productId: 'p-moisturizer-night',
    order: 4,
    timeOfDay: 'pm',
    scheduledAt: '9:40 PM',
    coachNote: 'Seal everything in. A pea-size amount, upward strokes.',
    durationSec: 30,
  },
  // ---- Weekly ----
  {
    id: 'r-wk-1',
    productId: 'p-exfoliant-pha',
    order: 1,
    timeOfDay: 'weekly',
    scheduledAt: 'Tue & Sat, PM',
    coachNote: 'After cleansing, before serum. Stop if you feel any sting.',
    durationSec: 60,
    cadence: '2× per week',
  },
  {
    id: 'r-wk-2',
    productId: 'p-mask-clay',
    order: 2,
    timeOfDay: 'weekly',
    scheduledAt: 'Sunday, PM',
    coachNote: 'T-zone only, 10 minutes. Rinse before it fully dries.',
    durationSec: 600,
    cadence: '1× per week',
  },
];

/** Products the AI has queued but not yet unlocked. */
export const QUEUED_UPGRADES = [
  {
    productId: 'p-serum-vitc',
    unlocksAt: 'Week 6',
    reason: 'Once your barrier holds above 80 for two straight weeks.',
  },
  {
    productId: 'p-treatment-retinal',
    unlocksAt: 'Week 10',
    reason: 'After the vitamin C is fully tolerated.',
  },
];

export const AM_STEPS = ROUTINE.filter((s) => s.timeOfDay === 'am');
export const PM_STEPS = ROUTINE.filter((s) => s.timeOfDay === 'pm');
export const WEEKLY_STEPS = ROUTINE.filter((s) => s.timeOfDay === 'weekly');

/** Steps already ticked when the demo loads — a partially-done morning reads real. */
export const INITIALLY_COMPLETED = ['r-am-1', 'r-am-2'];
