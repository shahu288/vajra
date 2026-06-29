# Vajra — App Design & Build Plan

> App name: **Vajra** (Sanskrit — the thunderbolt and diamond: unbreakable, and the force that cuts through weakness). Every reference below uses "the app" interchangeably with Vajra.

This document is a complete, build-ready specification: product vision, design system, screen-by-screen UI specs, data models, core algorithms, and technical integration notes. It is written to be handed directly to a development agent to start scaffolding the app.

---

## 1. Product Vision

A self-mastery mobile app that fuses gamification, social accountability, behavior tracking, and AI mentorship. Not a habit tracker. Not a meditation app. A **self-mastery operating system** where discipline becomes a social identity — the same way fitness became one through Strava and language-learning became one through Duolingo.

**Target user**: Gen Z / young adults who feel distracted, dopamine-addicted, and inconsistent, and want a visible, competitive, social way to rebuild discipline.

**Core differentiators**:
- A single composite score (Mind Strength Score) that quantifies discipline
- Verified behavior tracking via free OS-level APIs (not honor system)
- A Reddit-style proof-based community feed, not an Instagram-style highlight reel
- A living flame visual metaphor instead of generic progress bars
- Small-squad (4-person) accountability instead of broadcast-only social media

---

## 2. Design System

### 2.1 Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--color-primary` (amber/gold) | `#C8963C` | Mind Strength Score, fire, primary CTAs, digital discipline behaviors |
| `--color-secondary` (teal) | `#5DCAA5` | Sleep, recovery, calm states, positive verdicts |
| `--color-tertiary` (blue) | `#378ADD` | Physical behaviors, hydration, focus sessions |
| `--color-accent` (purple) | `#7F77DD` | AI mentor, XP/levels, night mode, spiritual/identity layer |
| `--color-danger` (red) | `#E24B4A` | Missed behaviors, relapse states, urgent alerts |
| `--bg-primary` | `#080808` | App background (dark mode primary) |
| `--bg-surface` | `#111111` / `#0E0E0E` | Cards, panels |
| `--bg-surface-alt` | `#1A1A1A` | Track bars, inputs |
| `--text-primary` | `#F0ECE4` (warm off-white) | Primary text on dark |
| `--text-tertiary` | `#555555` → `#2A2A2A` | Captions, metadata, disabled states |

**Design rule**: every behavior category keeps the same color everywhere in the app (cards, charts, badges, notifications) so users learn the color language within their first session and never need to re-read a label.

### 2.2 Typography

- Two weights only: 400 (regular) and 500 (medium). No bold, no light — keeps the UI calm and premium rather than shouty.
- Numerals (scores, timers, countdowns) use a monospace font for stability — numbers shouldn't visually jitter as digits change width.
- Headlines are small by SaaS standards (15–22px) — the product leans toward quiet confidence, not loud marketing typography.

### 2.3 Core Visual Metaphor — The Living Flame

The home screen centers on an animated flame rendered behind/around the Mind Strength Score number, replacing a generic circular progress ring.

- **Flame height & brightness** scale with current MSS (0–1000)
- **Flame particle count and motion speed** increase with active streak length
- Implementation: lightweight canvas/SVG particle system, 6–10 soft bezier "tongues" with radial gradient glow behind, animated via `requestAnimationFrame`. Must run at native frame rate without battery drain — cap to ~30fps if needed on lower-end devices.
- This is the single most important piece of brand visual identity. It encodes the "subtle spiritual foundation, globally appealing, not religious" brief — fire as a universal symbol of discipline and transformation, with zero explicit religious iconography.

### 2.4 Component Language

- Rounded corners throughout: 8–12px for cards, 20px (pill) for tags/badges/buttons
- Borders are hairline (0.5px) and low-contrast — structure comes from subtle separation, not heavy outlines
- Behavior progress = thin horizontal bars (3–4px), color-coded, with a numeric value right-aligned
- Status communicated via small colored dots (5–8px) more often than icons, for scan-ability in dense lists (squad pulse, feed)

---

## 3. Information Architecture

```
Onboarding
 ├─ Hook screen (pre-auth, social proof)
 ├─ Struggle selector (mirror exercise)
 ├─ Behavior setup (pick 3)
 ├─ Sleep/wake schedule setup
 └─ Account creation + squad match/skip

Main App (tab bar)
 ├─ Home (flame, MSS, behavior bars, stats, "Log today" CTA)
 ├─ Check-in (daily yes/no per behavior + water + mood)
 ├─ Feed (tribe community — Win/Struggle/Ask/Raw posts)
 ├─ Squad (4-person pulse, challenges, battles)
 └─ Profile (XP/level, badges, scorecard, inner log, settings)

Modals / Secondary Flows
 ├─ Temptation interrupt (system-triggered overlay)
 ├─ Night mode (auto-activated full-screen state)
 ├─ Monk mode setup & active dashboard
 ├─ 1v1 battle detail
 ├─ Focus session timer
 ├─ AI mentor chat/insights
 ├─ Sharecard generator
 └─ Settings (notifications, API connections, sleep schedule, account)
```

---

## 4. Screen-by-Screen Specification

### 4.1 Hook Screen (pre-authentication)
- **Goal**: convert pain ("I'm losing hours to my phone") into install/signup before pitching any feature
- **Content**: headline mirroring a known pain point (e.g. screen time stat), 3–4 pill badges showing real aggregate user achievements (e.g. "Woke 5AM × 23 days"), single CTA ("Start your streak →")
- **No signup fields on this screen.** Value before friction.

### 4.2 Struggle Selector
- Single-tap multi-select grid of pain points (phone addiction, no discipline, oversleeping, can't focus, overthinking, low energy, anger, procrastination)
- No text input. Completion target: under 60 seconds.
- Selections drive default behavior suggestions on the next screen and personalize the first AI mantra.

### 4.3 Behavior Setup
- User picks exactly **3 behaviors** from a list (see §6.1 for full behavior catalog with weights)
- Each option shows its difficulty weight (Hard ×2.0 / Medium ×1.5 / Easy ×1.0) inline — this gamifies the selection itself
- 4th behavior slot unlocks automatically at Day 30 as a milestone reward

### 4.4 Sleep/Wake Schedule Setup
- Two time pickers: Sleep target, Wake target (±15/±30 min adjustment controls)
- Toggles: wind-down alerts, night-mode auto-activate, verified wake detection, weekend sleep-in buffer (+1hr)
- Live summary card showing computed sleep window duration

### 4.5 Home
- Flame visualization with MSS number centered (see §2.3)
- 4 behavior progress bars, color-coded per §2.1
- Stat tiles: current streak / live tribe rank / level
- XP progress bar to next level (separate system from MSS — see §6.2)
- Primary CTA: "Log today"

### 4.6 Daily Check-in
- One yes/no toggle per tracked behavior, target: under 30 seconds total
- Auto-verified behaviors (Screen Time API) pre-fill and are visually marked "Verified" with a shield icon
- Self-reported behaviors show their score multiplier (×0.8) as a quiet label
- Water intake: tappable glass row (8–12 glasses × 250ml), fill/unfill on tap, live liters total
- Mood: 4-state single-tap selector (Struggling / Neutral / Focused / On fire)
- If a behavior is marked "No": optional one-line reason field, flagged as visible to squad

### 4.7 Feed (Community)
- Reddit-style structure, 4 post types: **Win** (requires a live verified streak to post), **Struggle**, **Ask the tribe**, **Raw thought**
- Each post: avatar, username, MSS, post-type flair, topic flair (Digital detox/Sleep/Focus/Physical/Water), body text, two reaction types (Upvote, "Felt this"), comment count
- Sort controls: Hot / New / Struggles / Wins / Questions
- Topic filter chips
- High-MSS users ("Tribe Elders") can pin a reply
- "Honest miss" posts get distinct visual styling (not punitive — just visually marked as transparent failure)

### 4.8 Squad Panel
- 4-person group, live pulse list (logged / pending status, color-coded dot)
- Challenge mechanic: any squad member can flag a suspicious self-reported log within 24h; 2 flags freezes that day's score pending response
- 1v1 battle entry point and active battle dashboard (day-by-day score table, live running total, "send taunt" 1/day, loser posts a public commitment on completion)

### 4.9 Profile
- XP bar + named level (Dormant → Awakening → Building → Rising → Forged → Sovereign)
- Badge grid: behavior badges, community badges, hidden badges (locked/unlabeled until earned)
- Inner Log: "Three Good Things" + "One line today" — fully private, never shown to feed/squad
- Day 1 vs Day 30 vs Day 90 journal reveal at milestones
- Sharecard generator (see §4.12)
- Settings: notification preferences, connected APIs (Screen Time, Health/Fit), sleep schedule, account

### 4.10 Temptation Interrupt (system-triggered overlay)
- Fires when Screen Time API detects a tracked distracting app opening
- Full-screen pause: shows streak at stake, exact score-point cost, squad visibility warning, a context-aware mantra line
- Two actions only: "Close it. Stay strong." / "Log the relapse honestly"
- **The app never blocks the other app.** This is a conscious-choice interrupt, not a parental control. That distinction is core to user trust.

### 4.11 Night Mode (system-triggered full state)
- Auto-activates after the final evening alert (default: 45 min past sleep target) or manually
- Hides leaderboard, score, feed — everything stimulating
- Shows only: live clock, one context line, a quiet generated quote
- Optional "Can't sleep — log a note" → private journal prompt

### 4.12 Sharecard
- Auto-generated at Day 7 / 30 / 60 / 90, each visually more premium than the last
- Contents: MSS number, tier name, streak length, top 3 behavior sub-scores, average water, subtle app URL
- Native share sheet targets: WhatsApp, Instagram Stories, copy link

### 4.13 Monk Mode
- Opt-in time-boxed challenge: 7 / 14 / 30 days
- Locks in a stricter behavior set (adds cold shower, no junk food, no alcohol, bed/wake discipline) with a ×2.1 score multiplier active for the duration
- Daily checklist view with per-item verification tier shown
- Breaking it early triggers a score penalty + mandatory public commitment post; completing it awards an exclusive badge + bonus XP + special sharecard

### 4.14 Focus Session
- Pomodoro-style timer (default 25/5, adjustable)
- Starting a session auto-activates device Do Not Disturb
- Completion: +50 XP, contributes to Focus behavior score
- 4 sessions/day unlocks a bonus badge
- Squad pulse shows live "in session" status for squad members

### 4.15 AI Mentor
- Weekly insights generated from the user's own data, three types:
  1. **Pattern** — anomaly detection across logs (e.g. recurring weekday dip)
  2. **Streak insight** — context on which neurological/habit-formation stage the user is in
  3. **Correlation** — cross-behavior insight (e.g. water intake vs logged mood)
- Open "Ask your mentor" text field, grounded in the user's full behavior/mood/journal history — answers must reference actual user data, not generic advice

---

## 5. User Flows

### 5.1 First-Time User (Onboarding → First Log)
Hook screen → Struggle selector → Behavior setup (pick 3) → Sleep/wake schedule → Account creation → Optional squad match → Home screen (empty state, Day 0) → First check-in prompt

### 5.2 Daily Core Loop
Morning anchor notification → Open app → Home (see flame/score) → Check-in (log behaviors, water, mood) → Score updates live → Optional: browse feed / squad pulse → Evening: wind-down alerts if screen active near sleep target → Night mode auto-activates if still active past final alert → OS detects screen-off → sleep logged → OS detects first unlock next day → wake logged automatically

### 5.3 Temptation Moment
User opens a tracked distracting app → OS-level detection fires → Temptation interrupt overlay renders inside the app (not a push notification) → User chooses to back out (streak preserved) or proceed (relapse logged, squad notified, mantra shown) → Score recalculates

### 5.4 Social Loop
User hits a milestone (Day 7/30/60/90) → Sharecard auto-generates → User shares to WhatsApp/Instagram → External viewer asks about it → New user installs via Hook screen → Loop repeats

---

## 6. Core Algorithms & Data Logic

### 6.1 Behavior Catalog (seed data)

| Behavior | Difficulty | Weight | Verification method |
|---|---|---|---|
| No social media | Hard | ×2.0 | Screen Time API |
| Screen time under 2hr | Hard | ×2.0 | Screen Time API |
| Wake by target time | Medium | ×1.5 | OS first-unlock timestamp |
| Sleep by target time | Medium | ×1.5 | OS screen-off detection |
| 30 min workout | Medium | ×1.5 | Photo proof / wearable sync |
| Water intake (goal-based) | Medium | ×1.5 | In-app glass tracker |
| 8hr sleep duration | Medium | ×1.5 | Wearable sync / self-report |
| Read 20 minutes | Easy | ×1.0 | Self-report |
| No junk food | Hard | ×2.0 | Self-report + squad challenge |
| Cold shower | Hard | ×2.0 | Photo proof |
| No alcohol | Hard | ×2.0 | Self-report + squad challenge |
| Focus sessions (4/day) | Medium | ×1.5 | In-app timer (auto-logged) |

### 6.2 Mind Strength Score (MSS)

```
MSS = Σ (behavior_score × difficulty_weight) × streak_multiplier

behavior_score      = (days_completed / days_total) × 100
difficulty_weight    = Hard 2.0 | Medium 1.5 | Easy 1.0
streak_multiplier    = 1.0 + (current_streak_days × 0.015)   // cap appropriately
verification_factor  = Verified 1.0 | Self-reported 0.8

Final score capped at 1000, floored at 0.
```

**Tiers**: 0–199 Dormant · 200–399 Awakening · 400–599 Building · 600–749 Rising · 750–949 Forged · 950–1000 Elite

### 6.3 XP & Level System (separate, never decreases)

| Source | XP |
|---|---|
| Daily log completed | +30 |
| Verified behavior (API-confirmed) | +20 |
| Focus session completed | +50 |
| Battle won | +200 |
| Streak milestone (7/14/30/60/90) | +100 |
| Helpful community reply (50+ upvotes) | +15 |

Levels are named identities, not just numbers (Level 1 "Dormant" → Level 10 "Sovereign"). XP is cumulative and intentionally never resets — it anchors user identity to total effort even after a bad week tanks the MSS.

### 6.4 Sleep/Wake Scoring

**Sleep (screen-off vs target time)**
- On/before target → 100 pts (verified ×1.0)
- Within 30-min grace → 80 pts (×0.8)
- 30+ min late → 0 pts
- DND activated proactively before target → 110 pts (×1.1 bonus)

**Wake (first unlock vs target time)**
- On time/early → 100 pts (×1.0)
- 1–15 min late → 80 pts (×0.8)
- 16–60 min late → 40 pts (×0.4)
- 60+ min late → 0 pts
- Both sleep AND wake verified same cycle → 220 pts combo bonus (teaches the causal link explicitly)

### 6.5 Verification Tier System

1. **Honor + squad challenge** (MVP, zero infra cost) — self-report; any squad member can flag within 24h; 2 flags freeze the score pending response
2. **Screen Time API** (high impact, free) — auto-reads per-app usage; pre-fills check-in; verified multiplier applies
3. **Photo proof** (BeReal-style) — for behaviors no API can confirm (workouts, cold shower); squad reacts to the proof
4. **Wearable sync** (premium tier) — Apple Health / Google Fit / Fitbit; passive logging of sleep & activity

---

## 7. Data Model (entities)

```
User
 ├─ id, displayName, struggleProfile[], createdAt
 ├─ mss (computed, cached), xp, level
 ├─ activeBehaviors[3-4] → Behavior
 ├─ sleepTarget, wakeTarget, weekendBufferEnabled
 ├─ squadId, tribeId
 └─ connectedAPIs: { screenTime: bool, healthKit: bool, googleFit: bool }

Behavior
 ├─ id, name, difficulty (hard/medium/easy), weight
 └─ verificationMethod (api/photo/wearable/honor)

DailyLog
 ├─ id, userId, date
 ├─ behaviorResults[]: { behaviorId, completed: bool, verified: bool, reason?: string }
 ├─ waterMl, mood (enum)
 ├─ sleepTimestamp, wakeTimestamp (nullable, OS-sourced)
 └─ scoreContribution (computed)

Squad
 ├─ id, memberIds[4], createdAt
 └─ challenges[]: { logId, raisedBy, status }

Tribe
 ├─ id, name, memberCount
 └─ leaderboard (derived view, sorted by mss)

Post (Feed)
 ├─ id, userId, type (win/struggle/ask/raw), topicFlair
 ├─ body, requiresVerifiedStreak (bool, enforced for "win")
 ├─ upvotes, feltThisCount, commentCount
 └─ comments[]: { userId, body, upvotes, pinned: bool }

Battle (1v1)
 ├─ id, challengerId, opponentId, status (pending/active/complete)
 ├─ startDate, endDate
 ├─ dailyScores: { userId: [day1Score, day2Score, ...] }
 └─ winnerId, loserCommitmentPostId

MonkModeSession
 ├─ id, userId, durationDays, startDate
 ├─ extendedBehaviors[]
 └─ status (active/completed/broken)

Badge
 ├─ id, name, tier (behavior/community/hidden)
 └─ unlockCriteria

JournalEntry
 ├─ id, userId, date
 ├─ threeGoodThings[3], oneLine, moodAtEntry
 └─ private (always true)
```

---

## 8. Technical Integration Notes

All required platform APIs are **free, native, and require no third-party permissions** beyond the Screen Time / Digital Wellbeing consent the user already grants for tracking itself.

| Capability | iOS | Android |
|---|---|---|
| Per-app screen time | `DeviceActivityReport` + `FamilyControls` framework (iOS 16+) | `UsageStatsManager` |
| Sleep detection (screen active at night) | `DeviceActivitySchedule` + `DeviceActivityMonitor` callback | `BroadcastReceiver` on `ACTION_SCREEN_ON` / `ACTION_SCREEN_OFF` |
| Wake detection (first unlock) | Earliest per-app timestamp after 4 AM from `DeviceActivityReport` | `ACTION_USER_PRESENT` broadcast (fires exactly at unlock past lock screen) |
| DND status check | `INFocusStatusCenter` | `NotificationManager.getCurrentInterruptionFilter()` |
| Wearable sync (premium) | Apple HealthKit | Google Fit / Health Connect |

**Privacy note to surface in onboarding copy**: the app reads *that* the screen was on/off and *when* it was first unlocked — never *what* the user was doing, never message content, never browsing history.

### Suggested Stack (for a cross-platform build)
- **App**: React Native (or Flutter) for shared iOS/Android codebase given the heavy reliance on native screen-time/activity APIs — both frameworks have mature bridges/plugins for `DeviceActivity` and `UsageStatsManager`; native modules will still be needed for the OS-level hooks above
- **Backend**: Node.js/Express or Supabase/Firebase for rapid MVP — needs real-time score/leaderboard updates (consider Firestore listeners or a WebSocket layer for live tribe rank movement)
- **AI mentor**: Anthropic API (Claude) for insight generation, with structured prompts that inject the user's behavior/mood/journal data as context
- **Push notifications**: Firebase Cloud Messaging (cross-platform) for the smart notification stack
- **Image storage**: for photo-proof verification (S3-compatible bucket)

---

## 9. Build Phases

### Phase 1 — MVP
- Behavior setup (3 behaviors), manual check-in, MSS calculation, streak tracking
- Squad (4-person) with honor-system + challenge mechanic
- Community feed (4 post types, sort/filter)
- Tribe leaderboard
- Sleep/wake schedule setup + evening alert chain (OS screen detection)
- Water tracker, mood selector
- Sharecard (Day 7 + Day 30)
- Onboarding flow end-to-end

### Phase 2 — Verified & Intelligent
- Screen Time API integration (verified scoring, auto-fill check-in)
- Wake detection (first-unlock timestamp)
- Temptation interrupt overlay
- AI mentor weekly insights + ask-mentor field
- Inner log (gratitude + one-line journal)
- Focus session timer
- 1v1 battles
- XP + level system, badge system (behavior + community tiers)

### Phase 3 — Scale & Depth
- Monk mode
- Wearable sync (Apple Health / Google Fit)
- Hidden badges
- Day 1 / 30 / 90 journal reveal
- Squad-vs-squad battles
- Night mode (full implementation)
- Enterprise/B2B dashboard for corporate wellness programs

---

## 10. Monetization

- **Free**: 3 behaviors, squad, feed, basic MSS, manual check-in
- **Premium (~$5/mo)**: Screen Time API verified tracking, wearable sync, AI mentor, monk mode, 1v1 battles, inner log reveals, up to 8 behaviors, ad-free
- **Enterprise (Phase 3+)**: team leaderboard, manager dashboard, custom company tribe

---

*This document encodes every feature, screen, algorithm, and integration discussed in design — intended as a complete handoff brief for scaffolding the build.*
