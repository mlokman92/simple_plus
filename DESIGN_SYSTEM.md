# Simple+ — build contract

Read this before touching any screen. Everything below already exists. **Do not create new
tokens, colours, font sizes, or duplicate components** — compose what is here.

## Product

Simple+ is an AI-powered skincare companion. Tagline: *Skin. Predictive. Personalised.*
Pillars: **AI Skin Analysis · Personalised Routine · Progress Tracking · Digital Dermatologist**.
Demo persona: Sarah, 25–34, Kuala Lumpur, combination skin, skin score **82/100** (+6 this week).

Aesthetic: cool clinical blues, white cards on a tinted canvas, a blue→green brand gradient,
soft shadows, generous rounding (radius 18–28), lots of air. Calm and premium — not playful.

Market context matters (pitched to Cradle Fund, Malaysia): prices in **RM**, JAKIM **halal**
badges, Kuala Lumpur UV/humidity, EN + Bahasa Melayu.

## Imports — always use path aliases

```ts
import { Screen, AppHeader, SectionHeader, Card, GradientCard, Button, IconButton,
         Chip, Badge, DeltaPill, Txt, Tap, Row, Divider, Spacer,
         ProgressBar, StepDots } from '@/components/ui';
import { ScoreRing, LineChart, Sparkline, MetricRow, MetricTile, SkinRadar, WeekBars }
  from '@/components/charts';
import { LogoMark, LogoLockup } from '@/components/brand/Logo';
import { ProductArt, ProductTile } from '@/components/brand/ProductArt';
import { FaceGuide } from '@/components/brand/FaceGuide';
import { palette, gradients, spacing, radius, shadow, type, layout } from '@/theme';
import { useApp } from '@/store/AppStore';
import { useInsets, useFramed } from '@/lib/frame';
import { myr, signed, shortDate, clamp } from '@/lib/format';
import * as haptics from '@/lib/haptics';
```

## Components

| Component | Key props |
|---|---|
| `Screen` | `scroll?=true`, `padBottom?=40`, `gutter?=20`, `edgeToEdge?`, `background?`, `header?`, `scrollProps?`, `contentStyle?` |
| `AppHeader` | `title?`, `subtitle?`, `right?`, `onBack?`, `showBack?=true`, `transparent?=true` — pass via `Screen header={...}` |
| `SectionHeader` | `title`, `action?`, `onAction?` |
| `Card` | `padding?=16`, `tone?='plain'\|'sunken'\|'tinted'\|'outline'`, `elevation?='card'\|'raised'\|'floating'\|'none'`, `onPress?` |
| `GradientCard` | `colors` (use `gradients.*`), `padding?`, `onPress?`, `start?`, `end?` |
| `Button` | `label`, `onPress`, `variant?='primary'\|'secondary'\|'ghost'\|'dark'\|'danger'`, `size?='sm'\|'md'\|'lg'`, `icon?`, `iconRight?`, `loading?`, `disabled?`, `full?=true` |
| `IconButton` | `icon` (Ionicons name), `onPress`, `size?=40`, `tone?='surface'\|'tint'\|'ghost'\|'brand'`, `badge?` |
| `Chip` | `label`, `selected?`, `onPress?`, `icon?`, `emoji?`, `tone?='default'\|'brand'` |
| `Badge` | `label`, `tone?='neutral'\|'good'\|'warn'\|'alert'\|'brand'\|'premium'\|'halal'`, `icon?` (label auto-uppercases) |
| `DeltaPill` | `value` (number, signs itself), `suffix?` |
| `Txt` | `variant?` (see scale), `tone?='default'\|'secondary'\|'muted'\|'brand'\|'onBrand'\|'good'\|'warn'\|'alert'`, `color?`, `center?` |
| `Tap` | Pressable + spring scale + haptic. `scaleTo?=0.97`, `haptic?=true` |
| `Row` | `gap?`, `align?`, `justify?`, `wrap?` |
| `ProgressBar` | `value` 0–1, `height?=8`, `color?`, `track?`, `animate?=true` |
| `StepDots` | `total`, `index` |
| `ScoreRing` | `score` 0–100, `size?=132`, `strokeWidth?=11`, `colors?`, `children?`, **`gradientId` must be unique per instance**, `label?='/100'` |
| `LineChart` | `data:number[]`, `labels?`, `width` (**required**), `height?=160`, `color?`, `area?`, `grid?`, `domain?`, `markLast?`, `gradientId` unique, `showLabels?` |
| `Sparkline` | `data`, `width?=64`, `height?=24`, `color?` |
| `MetricRow` | `metricKey`, `value`, `delta?`, `readout?` |
| `MetricTile` | `metricKey`, `value`, `width?` (flexes by default) |
| `SkinRadar` | `values: Record<MetricKey,number>`, `compare?`, `size?=220`, `keys: MetricKey[]` |
| `WeekBars` | `values: number[]` (7 entries, 0–1), `height?`, `color?` |
| `FaceGuide` | `width`, `height`, `findings?`, `guide?`, `mesh?`, `activeIndex?`, `cornerRadius?`, `onSelect?` — real photo from the marketing asset with SVG overlays |
| `ProductArt` / `ProductTile` | `category`, `tint` (from the product), `size?`, `id?` (unique gradient suffix) |

`LogoMark` takes `size?` and `plate?` (light chip for dark surfaces). `LogoLockup` takes
`size?`, `tone?='dark'|'light'`, `tagline?`. Neither takes a `gradientId` — the mark is the
real brand PNG from `assets/brand/`, not a redraw.

**Never put `onPress` on a react-native-svg node** — it forwards RN responder props to the DOM
on web and React warns. Overlay a `Pressable` instead (see `FaceGuide`).

**Text rule:** never use bare `<Text>` — always `Txt`.
**Type scale:** `display, h1, h2, h3, h4, body, bodyStrong, bodySm, label, caption, micro, number`.
**Spacing:** `xxs 2, xs 4, sm 8, md 12, lg 16, xl 20, xxl 24, xxxl 32, huge 40, giant 56`.
**Radius:** `xs 6, sm 10, md 14, lg 18, xl 24, xxl 28, round 999`.

### Chart widths
`LineChart` needs an explicit pixel width. Measure the parent with `onLayout`, or compute from
`useWindowDimensions()` — but inside the web phone frame the window is the *browser*, so prefer
`onLayout`:

```tsx
const [w, setW] = useState(0);
<View onLayout={(e) => setW(e.nativeEvent.layout.width)}>
  {w > 0 ? <LineChart data={…} width={w} gradientId="uniqueId" /> : null}
</View>
```

### Tab screens
The tab bar floats over the content. **Every screen under `app/(tabs)/` must pass
`padBottom={120}` to `Screen`.**

## State — `useApp()`

```ts
const {
  profile,            // UserProfile: name, initials, ageRange, city, skinType, concerns, goals, lifestyle, memberSince, isPremium
  language,           // 'en' | 'ms'
  onboardingComplete,
  completedSteps,     // string[] of routine step ids ticked today
  score, previousScore, scoreDelta,
  metrics, previousMetrics,          // Record<MetricKey, number>
  scans,              // Scan[], newest first
  scoreHistory,       // ScoreHistoryPoint[]
  dermMessages, dermTyping,
  savedProductIds, halalOnly, notificationsEnabled, scannedThisSession,
  isStepDone(id), metricDelta(key), isSaved(id), ratingFor(value), adherence,
  askDerm(text),      // pushes the user msg + scripted AI reply after ~1.1s
  dispatch,
} = useApp();
```

Dispatch actions: `toggleStep{id}`, `completeAllSteps{ids}`, `setConcerns{concerns}`,
`setSkinType{skinType}`, `setGoals{goals}`, `setLifestyle{lifestyle}`, `setName{name}`,
`completeOnboarding`, `applyScan{scan}`, `toggleSaved{id}`, `setPremium{value}`,
`setLanguage{value}`, `setHalalOnly{value}`, `setNotifications{value}`, `reset`.

## Data — `@/data/*`

- `products.ts` — `PRODUCTS`, `getProduct(id)`, `PRODUCT_BY_ID`, `CATEGORY_LABEL`, `RECOMMENDED_IDS`
- `taxonomy.ts` — `CONCERNS`, `CONCERN_BY_KEY`, `SKIN_TYPES`, `GOALS`, `METRIC_META`,
  `METRIC_ORDER`, `ratingFor`, `RATING_LABEL`, `RATING_COLOR`, `METRIC_READOUT`
- `routine.ts` — `ROUTINE`, `AM_STEPS`, `PM_STEPS`, `WEEKLY_STEPS`, `QUEUED_UPGRADES`
- `user.ts` — `DEMO_USER`, `CURRENT_METRICS`, `SCORE_HISTORY`, `METRIC_HISTORY`, `SCAN_HISTORY`,
  `LATEST_SCAN`, `PHOTO_LOG`, `ACHIEVEMENTS`, `INSIGHTS`, `ENVIRONMENT`, `ADHERENCE`
- `derm.ts` — `DERM_SCRIPTS`, `QUICK_PROMPTS`, `matchScript(input)`, `DERM_GREETING`

Types live in `@/types`.

## Rules

1. TypeScript strict. No `any`. No `@ts-ignore`.
2. Must run on **react-native-web** — no `Dimensions.get` at module scope, no native-only APIs,
   no `react-native-maps`/camera. Animations: `Animated` from `react-native` (not Reanimated
   worklets) so the web export stays reliable.
3. Every `ScoreRing` / `LineChart` / `ProductArt` on a screen needs a **unique** `gradientId`/`id`.
4. Use `Ionicons` from `@expo/vector-icons` for all icons.
5. Copy is specific and data-backed ("hydration +8 this week"), never generic filler lorem.
6. Navigate with `useRouter()` from `expo-router`; `router.push('/scan/capture')` style paths.
7. Default-export a React component from every route file.
8. No new npm dependencies.
