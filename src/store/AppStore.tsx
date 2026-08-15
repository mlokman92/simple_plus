import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from 'react';

import { DERM_GREETING, matchScript } from '@/data/derm';
import { INITIALLY_COMPLETED } from '@/data/routine';
import { ratingFor } from '@/data/taxonomy';
import {
  ADHERENCE,
  CURRENT_METRICS,
  CURRENT_SCORE,
  DEMO_USER,
  PREVIOUS_METRICS,
  PREVIOUS_SCORE,
  SCAN_HISTORY,
  SCORE_HISTORY,
} from '@/data/user';
import type {
  ConcernKey,
  DermMessage,
  GoalKey,
  Language,
  MetricKey,
  Scan,
  ScoreHistoryPoint,
  SkinType,
  UserProfile,
} from '@/types';

interface State {
  profile: UserProfile;
  language: Language;
  onboardingComplete: boolean;
  /** Ids of routine steps ticked today. */
  completedSteps: string[];
  score: number;
  previousScore: number;
  metrics: Record<MetricKey, number>;
  previousMetrics: Record<MetricKey, number>;
  scans: Scan[];
  scoreHistory: ScoreHistoryPoint[];
  dermMessages: DermMessage[];
  dermTyping: boolean;
  savedProductIds: string[];
  halalOnly: boolean;
  notificationsEnabled: boolean;
  /** Set once the user runs a scan in-session, so the UI can celebrate. */
  scannedThisSession: boolean;
}

type Action =
  | { type: 'toggleStep'; id: string }
  | { type: 'completeAllSteps'; ids: string[] }
  | { type: 'setConcerns'; concerns: ConcernKey[] }
  | { type: 'setSkinType'; skinType: SkinType }
  | { type: 'setGoals'; goals: GoalKey[] }
  | { type: 'setLifestyle'; lifestyle: Partial<UserProfile['lifestyle']> }
  | { type: 'setName'; name: string }
  | { type: 'completeOnboarding' }
  | { type: 'applyScan'; scan: Scan }
  | { type: 'dermSend'; text: string }
  | { type: 'dermReply'; message: DermMessage }
  | { type: 'dermTyping'; value: boolean }
  | { type: 'toggleSaved'; id: string }
  | { type: 'setPremium'; value: boolean }
  | { type: 'setLanguage'; value: Language }
  | { type: 'setHalalOnly'; value: boolean }
  | { type: 'setNotifications'; value: boolean }
  | { type: 'reset' };

function initialState(): State {
  return {
    profile: { ...DEMO_USER },
    language: 'en',
    onboardingComplete: false,
    completedSteps: [...INITIALLY_COMPLETED],
    score: CURRENT_SCORE,
    previousScore: PREVIOUS_SCORE,
    metrics: { ...CURRENT_METRICS },
    previousMetrics: { ...PREVIOUS_METRICS },
    scans: [...SCAN_HISTORY],
    scoreHistory: [...SCORE_HISTORY],
    dermMessages: [
      {
        id: 'm-0',
        role: 'ai',
        text: DERM_GREETING,
        timestamp: '9:41 AM',
        suggestions: [
          'Why did I break out this week?',
          'Can you simplify my routine?',
          'Are my products halal certified?',
        ],
      },
    ],
    dermTyping: false,
    savedProductIds: ['p-sunscreen-daily'],
    halalOnly: false,
    notificationsEnabled: true,
    scannedThisSession: false,
  };
}

let messageSeq = 100;
const nextId = () => `m-${messageSeq++}`;

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'toggleStep': {
      const has = state.completedSteps.includes(action.id);
      return {
        ...state,
        completedSteps: has
          ? state.completedSteps.filter((s) => s !== action.id)
          : [...state.completedSteps, action.id],
      };
    }
    case 'completeAllSteps':
      return {
        ...state,
        completedSteps: Array.from(new Set([...state.completedSteps, ...action.ids])),
      };
    case 'setConcerns':
      return { ...state, profile: { ...state.profile, concerns: action.concerns } };
    case 'setSkinType':
      return { ...state, profile: { ...state.profile, skinType: action.skinType } };
    case 'setGoals':
      return { ...state, profile: { ...state.profile, goals: action.goals } };
    case 'setLifestyle':
      return {
        ...state,
        profile: {
          ...state.profile,
          lifestyle: { ...state.profile.lifestyle, ...action.lifestyle },
        },
      };
    case 'setName':
      return {
        ...state,
        profile: {
          ...state.profile,
          name: action.name,
          initials: action.name.slice(0, 2).toUpperCase(),
        },
      };
    case 'completeOnboarding':
      return { ...state, onboardingComplete: true };
    case 'applyScan':
      return {
        ...state,
        scans: [action.scan, ...state.scans],
        previousScore: state.score,
        score: action.scan.score,
        previousMetrics: state.metrics,
        metrics: action.scan.metrics,
        scoreHistory: [
          ...state.scoreHistory,
          { label: 'Now', score: action.scan.score, date: action.scan.date },
        ],
        scannedThisSession: true,
      };
    case 'dermSend':
      return {
        ...state,
        dermMessages: [
          ...state.dermMessages,
          {
            id: nextId(),
            role: 'user',
            text: action.text,
            timestamp: 'Just now',
          },
        ],
      };
    case 'dermReply':
      return {
        ...state,
        dermMessages: [...state.dermMessages, action.message],
        dermTyping: false,
      };
    case 'dermTyping':
      return { ...state, dermTyping: action.value };
    case 'toggleSaved': {
      const has = state.savedProductIds.includes(action.id);
      return {
        ...state,
        savedProductIds: has
          ? state.savedProductIds.filter((p) => p !== action.id)
          : [...state.savedProductIds, action.id],
      };
    }
    case 'setPremium':
      return { ...state, profile: { ...state.profile, isPremium: action.value } };
    case 'setLanguage':
      return { ...state, language: action.value };
    case 'setHalalOnly':
      return { ...state, halalOnly: action.value };
    case 'setNotifications':
      return { ...state, notificationsEnabled: action.value };
    case 'reset':
      return initialState();
    default:
      return state;
  }
}

interface Ctx extends State {
  dispatch: React.Dispatch<Action>;
  /** Derived helpers used across screens. */
  isStepDone: (id: string) => boolean;
  metricDelta: (key: MetricKey) => number;
  scoreDelta: number;
  isSaved: (id: string) => boolean;
  /** Push a user message and schedule the scripted AI reply. */
  askDerm: (text: string) => void;
  ratingFor: typeof ratingFor;
  adherence: typeof ADHERENCE;
}

const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  const askDerm = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    dispatch({ type: 'dermSend', text: trimmed });
    dispatch({ type: 'dermTyping', value: true });
    const script = matchScript(trimmed);
    setTimeout(() => {
      dispatch({
        type: 'dermReply',
        message: {
          id: nextId(),
          role: 'ai',
          text: script.reply,
          productIds: script.productIds,
          suggestions: script.suggestions,
          timestamp: 'Just now',
        },
      });
    }, 1100);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      ...state,
      dispatch,
      isStepDone: (id: string) => state.completedSteps.includes(id),
      metricDelta: (key: MetricKey) => state.metrics[key] - state.previousMetrics[key],
      scoreDelta: state.score - state.previousScore,
      isSaved: (id: string) => state.savedProductIds.includes(id),
      askDerm,
      ratingFor,
      adherence: ADHERENCE,
    }),
    [state, askDerm],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): Ctx {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
