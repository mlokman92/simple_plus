import type { DermScript } from '@/types';

/**
 * Canned "Digital Dermatologist" responses. `matchScript` does keyword matching
 * so free-typed questions still land on something sensible during a demo.
 */
export const DERM_SCRIPTS: DermScript[] = [
  {
    id: 'd-breakout',
    prompt: 'Why did I break out this week?',
    keywords: ['break', 'breakout', 'pimple', 'spot', 'acne', 'jerawat'],
    reply:
      'Three signals line up. Your last two scans show oil balance dropping on days humidity passed 85%, you logged 5–6 hours of sleep four nights running, and the chin cluster sits exactly where a mask line would rest.\n\nThis is congestion, not a barrier flare — your sensitivity score actually improved. Keep the spot treatment on the chin only, and do not add a second active.',
    productIds: ['p-treatment-spot'],
    suggestions: ['How long until it clears?', 'Should I stop the exfoliant?'],
  },
  {
    id: 'd-clears',
    prompt: 'How long until it clears?',
    keywords: ['how long', 'clear', 'heal', 'faster', 'berapa lama'],
    reply:
      'Based on your last three healing cycles, spots in that area settled in 5–7 days. You are on day 3.\n\nOne thing that measurably shortens it for you: do not touch or pick. Your scan on 27 July showed a mark that lingered 3 weeks longer than the others in the same cluster.',
    suggestions: ['What about the dark marks left behind?'],
  },
  {
    id: 'd-marks',
    prompt: 'What about the dark marks left behind?',
    keywords: ['mark', 'dark', 'scar', 'pigment', 'hyperpigment', 'parut'],
    reply:
      'Those are post-inflammatory hyperpigmentation, not scars — they sit in the pigment layer and will fade. Your evenness score has already climbed from 60 to 76 over 12 weeks.\n\nTwo levers: the niacinamide serum you already use, and sunscreen. UV is what keeps these marks dark. On days you logged SPF, your evenness improved roughly twice as fast.',
    productIds: ['p-serum-calming', 'p-sunscreen-daily'],
    suggestions: ['Is vitamin C worth adding?'],
  },
  {
    id: 'd-vitc',
    prompt: 'Is vitamin C worth adding?',
    keywords: ['vitamin c', 'vit c', 'brighten', 'ascorb'],
    reply:
      'Yes — but not yet. It is queued for week 6 in your plan.\n\nYour sensitivity score only crossed into the calm band two weeks ago. Adding a 12% vitamin C now risks undoing that, and a barrier flare would cost you more evenness than the vitamin C would gain. Two more stable weeks and I will unlock it.',
    productIds: ['p-serum-vitc'],
    suggestions: ['What can I add right now instead?'],
  },
  {
    id: 'd-exfoliant',
    prompt: 'Should I stop the exfoliant?',
    keywords: ['exfoliat', 'peel', 'aha', 'bha', 'pha', 'scrub'],
    reply:
      'No — but keep it at twice a week. When you went to four times in week 9, your sensitivity dropped 7 points and your score stalled for two weeks.\n\nPHA is the gentlest of the acid families, which is why it is the one in your routine. Tuesday and Saturday, after cleansing, before serum.',
    productIds: ['p-exfoliant-pha'],
    suggestions: ['Why PHA and not AHA?'],
  },
  {
    id: 'd-routine',
    prompt: 'Can you simplify my routine?',
    keywords: ['simplify', 'simple', 'shorter', 'less', 'minimal', 'time', 'ringkas'],
    reply:
      'I can get your morning down to three steps in about 90 seconds: cleanse, serum, sunscreen. The toner is the one to drop first — it contributes the least to your score.\n\nDo not cut the sunscreen. Modelled against your history, dropping SPF costs you about 9 points over eight weeks. It is the single highest-leverage step you have.',
    suggestions: ['Show me the 3-step version'],
  },
  {
    id: 'd-sunscreen',
    prompt: 'How much sunscreen do I actually need?',
    keywords: ['sunscreen', 'spf', 'sun', 'uv', 'reapply', 'pelindung'],
    reply:
      'Two finger-lengths for the face and neck — most people apply about a quarter of that and get a fraction of the labelled protection.\n\nIn Kuala Lumpur, UV sits at 10–12 between 11 AM and 3 PM most of the year. Reapply once around 1 PM. That is the whole habit.',
    productIds: ['p-sunscreen-daily'],
    suggestions: ['Will it break me out?'],
  },
  {
    id: 'd-humidity',
    prompt: 'My skin is oily by noon — help?',
    keywords: ['oily', 'oil', 'shine', 'greasy', 'sebum', 'berminyak'],
    reply:
      'That is the humidity, not your skin failing. At 82% humidity, sweat does not evaporate, so sebum sits on the surface.\n\nBlot — do not re-cleanse. Washing at midday strips the barrier and your skin compensates with more oil by 4 PM. Your own data shows it: on the three days you logged a midday wash, evening oil scores were the worst of the week.',
    productIds: ['p-moisturizer-hydra'],
    suggestions: ['Should I switch to a mattifying moisturiser?'],
  },
  {
    id: 'd-halal',
    prompt: 'Are my products halal certified?',
    keywords: ['halal', 'jakim', 'certif', 'ingredient', 'alcohol'],
    reply:
      'Seven of the nine products in your routine carry JAKIM halal certification. The two that do not are the overnight spot treatment and the queued vitamin C serum.\n\nI can swap both for certified alternatives with a match score within 4 points. Want me to filter your whole shelf to halal-certified only?',
    suggestions: ['Yes, filter to halal only'],
  },
  {
    id: 'd-derm',
    prompt: 'Should I see a real dermatologist?',
    keywords: ['dermatologist', 'doctor', 'clinic', 'real', 'referral', 'doktor'],
    reply:
      'Nothing in your scans is urgent — your trend is up and there are no flags I would escalate.\n\nTo be clear about what I am: I am a tracking and coaching tool, not a medical diagnosis. If you see a mole changing shape, a rash that spreads, or a spot that does not heal in a month, that needs a real clinician. Simple+ Premium includes a video consult with a licensed dermatologist within 24 hours.',
    suggestions: ['Tell me about Premium'],
  },
];

export const QUICK_PROMPTS = [
  'Why did I break out this week?',
  'Can you simplify my routine?',
  'My skin is oily by noon — help?',
  'Are my products halal certified?',
  'Is vitamin C worth adding?',
  'Should I see a real dermatologist?',
];

const FALLBACK: DermScript = {
  id: 'd-fallback',
  prompt: '',
  keywords: [],
  reply:
    'Good question. Reading your last 12 scans: your score is 82 and climbing, hydration is your strongest gain, and oil balance is the metric most worth your attention this month.\n\nThe short version — stay on the current routine, do not add a new active before week 6, and keep sunscreen non-negotiable. Ask me anything more specific and I will pull the exact numbers.',
  suggestions: QUICK_PROMPTS.slice(0, 3),
};

/** Keyword-match a free-typed question against the scripted replies. */
export function matchScript(input: string): DermScript {
  const q = input.toLowerCase().trim();
  if (!q) return FALLBACK;

  const exact = DERM_SCRIPTS.find((s) => s.prompt.toLowerCase() === q);
  if (exact) return exact;

  let best: { script: DermScript; hits: number } | null = null;
  for (const script of DERM_SCRIPTS) {
    const hits = script.keywords.reduce((n, k) => (q.includes(k) ? n + 1 : n), 0);
    if (hits > 0 && (!best || hits > best.hits)) best = { script, hits };
  }
  return best ? best.script : FALLBACK;
}

export const DERM_GREETING =
  'Hi Sarah 👋 I have read all 12 of your scans. Your score is 82, up 6 this week. Ask me anything — I will answer with your own data, not generic advice.';
