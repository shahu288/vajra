# Vajra — MVP Product Plan

> Vajra (Sanskrit — thunderbolt and diamond: unbreakable, and the force that cuts through weakness). This plan replaces the earlier API-heavy design. No paid integrations, no native background tracking, no AI mentor in V1. The goal is to validate the core loop — Vows, Discipline Score, Squad accountability — as cheaply and fast as possible.

---

## 1. Product Positioning

**Vajra is not a habit tracker. It is a self-mastery operating system.**

A habit tracker logs behavior. Vajra builds identity. The distinction isn't cosmetic — it changes every design decision in this document.

The core unit of the product is not a "habit" but a **Vow** — a deliberate, named commitment a user makes to themselves and declares to their squad. A habit is something you do. A vow is something you keep. That single word swap changes the emotional weight of every interaction: missing a habit is a lapse; breaking a vow is a failure of character. Vajra is built to make users feel the second thing, because that's what actually produces behavior change.

**What V1 deliberately is not**: an AI-powered app, a quantified-self platform, or a wellness app that depends on device permissions and OS integrations to function. V1 proves the loop works with nothing but user intent and social accountability. APIs and AI can be added later, once the core mechanic is validated — they should never be load-bearing for the MVP.

---

## 2. User Psychology — Why This Works

**Vows over habits.** A habit is a private, low-stakes behavior. A vow, by definition, is declared — to oneself and ideally to others. The psychological research on identity-based habit change is consistent: people sustain behavior longer when it's framed as "I am someone who keeps their word" rather than "I am tracking whether I did X." Vajra's entire vocabulary (Vows, not tasks; Squad, not followers; Discipline, not productivity) is chosen to reinforce identity over checklist mechanics.

**Social accountability over algorithmic verification.** The previous design leaned on Screen Time APIs and OS-level detection to "catch" users lying. That's expensive to build and, more importantly, psychologically weaker than the alternative: people lie to apps far more easily than they lie to people who know them. A 4-person squad that sees your daily vow log creates more honest behavior than any API ever could, at zero infrastructure cost. The trust model is explicit: **you are accountable to your squad, not to an algorithm.**

**Identity paths over generic onboarding.** Asking "what habits do you want to build?" produces shallow, droppable answers. Asking "who are you becoming?" — Warrior, Scholar, Monk, Creator — produces a chosen identity the user wants to defend. Starter vows are then suggested *because they fit the identity*, not as a generic checklist. This taps the same psychology as roleplaying and character progression in games, applied to real behavior.

**Difficulty-weighted scoring rewards ambition, not just compliance.** A user who keeps 3 easy vows perfectly should not outscore a user who keeps 2 hard vows at 80%. The Discipline Score formula (§4) is built so harder, more meaningful commitments are worth more — pushing users toward vows that actually matter rather than the easiest ones to pad a score.

---

## 3. Vow Architecture

### 3.1 Discipline Categories (onboarding entry point)

Users start broad, then personalize. Eight categories, each with example pre-built vows and room for custom ones:

| Category | Example pre-built vows |
|---|---|
| **Physical Discipline** | Wake before 6 AM · Run 2km/5km/10km · Workout 45 min · Cold shower |
| **Digital Discipline** | No social media before noon · Phone-free first hour · No social media (full day) |
| **Sleep Discipline** | Asleep by 11 PM · 8 hours minimum · No phone in bed |
| **Nutrition Discipline** | No sugar · Drink 2L/3L/4L water · No outside food · Intermittent fasting window |
| **Learning Discipline** | Read 10/20/30 pages · Study 30 min/1hr/2hr · Learn a language 15 min |
| **Productivity Discipline** | Deep work block (1hr/2hr) · Plan tomorrow tonight · No meetings before 10 AM |
| **Mental Discipline** | Meditate 10 min · Journal daily · Porn-free day · No complaining |
| **Character Discipline** | No lying · Keep a promise made · Cold call / hard conversation · Gratitude practice |

### 3.2 Vow Personalization Flow

After selecting a category, the user personalizes a specific vow:

```
Category: Physical Discipline
  → Vow type: Running
    → Target: 2km / 5km / 10km / Custom distance
  → Vow type: Workout
    → Target: 30 min / 45 min / 60 min / Custom duration
  → Vow type: Wake time
    → Target: 5 AM / 5:30 AM / 6 AM / Custom time
```

This pattern (category → vow type → target) repeats across all eight categories, so the onboarding UI is a single reusable 3-step component, not eight bespoke flows.

### 3.3 Custom Vows

Any user can create a fully custom vow with:
- **Name** (free text, e.g. "Call my mother")
- **Target** (free text or numeric, e.g. "Once" or "20 minutes")
- **Difficulty**: Easy / Medium / Hard (user self-rates; squad can flag if a difficulty rating seems gamed)
- **Frequency**: Daily or Weekly

### 3.4 Vow Limits

- New users select **3 vows** at onboarding (mirrors the proven "don't overwhelm a new habit system" principle)
- A 4th vow slot unlocks at Day 14 of consistent check-ins
- Maximum 6 active vows at any time (more than that and accountability quality drops — better to keep fewer vows sacred than many vows shallow)

---

## 4. Discipline Score System

**Replaces MSS. Range: 0–100. Designed to be explainable in one sentence: "It's how consistently you've kept your vows over the last 30 days, weighted by how hard they are."**

### 4.1 Formula

```
Base Score = [ Σ (vow_completion_rate_30d × difficulty_weight) / Σ(difficulty_weight) ] × 100

difficulty_weight: Easy = 1.0, Medium = 1.5, Hard = 2.0

vow_completion_rate_30d = days_kept / days_eligible
  (days_eligible = days since vow created, capped at 30;
   for Weekly-frequency vows, use weeks_kept / weeks_eligible over the same window)

Streak Bonus = min(10, floor(longest_active_streak_days / 3))

Discipline Score = min(100, round(Base Score + Streak Bonus))
```

### 4.2 Worked Example

A user has 3 vows:
- "No social media" (Hard, ×2.0) — kept 24 of last 30 days → 0.80 completion
- "Wake before 6 AM" (Medium, ×1.5) — kept 18 of last 30 days → 0.60 completion
- "Read 20 pages" (Easy, ×1.0) — kept 27 of last 30 days → 0.90 completion

```
Weighted sum = (0.80×2.0) + (0.60×1.5) + (0.90×1.0) = 1.60 + 0.90 + 0.90 = 3.40
Weight total = 2.0 + 1.5 + 1.0 = 4.5
Base Score = (3.40 / 4.5) × 100 = 75.6 → 76

Longest active streak = 12 days → Streak Bonus = min(10, floor(12/3)) = 4

Discipline Score = min(100, 76 + 4) = 80
```

### 4.3 Score Tiers

| Score | Tier |
|---|---|
| 0–20 | Dormant |
| 21–40 | Awakening |
| 41–60 | Building |
| 61–80 | Disciplined |
| 81–95 | Forged |
| 96–100 | Unbreakable |

"Unbreakable" deliberately echoes the Vajra name — the highest tier is the brand promise made literal.

### 4.4 Why This Formula Works for an Honor-System MVP

Because there's no API to "catch" false logs, the score must be resilient to honest human imperfection rather than punitive. The 30-day rolling window means one bad week doesn't permanently tank a score the way an all-time average would. The streak bonus is capped at 10 points specifically so a long streak can't fully mask broad inconsistency elsewhere — a user can't coast on one easy daily vow streak while ignoring two harder ones.

---

## 5. Squad Accountability System

### 5.1 Core Mechanic

Every user joins or is matched into a **4-person squad**. Squad members see each other's:
- Daily vow check-ins (completed / missed, with optional one-line reason)
- Current streaks per vow
- Discipline Score trend (not necessarily the exact number, configurable in settings)

### 5.2 Manual Verification (No APIs)

- Check-ins are **self-reported, tap-based** — no automated detection of any kind in V1
- Any squad member can **flag** a check-in they believe is dishonest, within 24 hours of it being logged
- 2 flags on the same log = that day's score contribution is frozen pending the user's response in the squad chat
- This is intentionally lightweight — the deterrent isn't the flagging mechanic itself, it's the social discomfort of your squad being able to flag you at all

### 5.3 Optional Proof Uploads (Phase 2, not MVP-blocking)

- For vows where a photo adds real credibility (workout, cold shower, reading), users can optionally attach a quick photo to their check-in
- Entirely optional in V1 — never required to log a vow as complete
- Squad members can react to proof photos, which becomes a content layer for the community feed

### 5.4 Why Squad-Based Trust Is the Right MVP Bet

Building Screen Time API integration, native iOS/Android permission flows, and App Store review processes for background tracking adds months to launch and real monthly cost. Squad accountability needs none of that — it's pure product/social design, buildable with standard CRUD operations and push notifications. It also tests the actual hypothesis that matters most: **do people change behavior when their peer group can see them?** If that core loop doesn't retain users, no amount of API verification would have saved the product anyway. Validate the cheap mechanic first.

---

## 6. Identity-Based Growth

### 6.1 Identity Paths

At onboarding, after the Hook screen, users choose an identity path before they choose individual vows. This reframes the entire onboarding from "what do you want to track" to "who are you becoming."

| Path | Focus | Starter vow suggestions |
|---|---|---|
| **Warrior** | Physical Discipline | Wake before 6 AM · Workout 45 min · Cold shower |
| **Scholar** | Learning + Productivity | Study 1 hour · Read 20 pages · No social media before noon |
| **Monk** | Mental + Character Discipline | Meditate 10 min · Porn-free day · Journal daily |
| **Creator** | Productivity + Digital Discipline | Deep work 2hr block · No social media (full day) · Ship something daily |
| **Custom Path** | User-defined | Build entirely from the category list, no suggested defaults |

### 6.2 How Identity Reinforces Retention

- The user's chosen path appears as a badge/title on their profile and next to their name in the feed and squad ("Aditya · Warrior · Lv6")
- Level-up moments are framed in path language where possible (e.g. a Warrior's streak milestone copy differs slightly in tone from a Scholar's) — same XP system underneath, different narrative skin
- Switching paths is allowed but costs a small one-time XP penalty — not punitive, just enough friction that path choice feels meaningful rather than disposable
- This is a **narrative layer over the same mechanical system** (vows, score, XP) — it costs almost nothing extra to build but meaningfully changes how the product feels

---

## 7. MVP Feature Set

### Keep (build in V1)
- Onboarding (Hook → Identity Path → Vow categories → Vow personalization → Squad match/skip → Account)
- Vow creation (pre-built + fully custom)
- Discipline Score (per §4)
- Daily check-ins (manual, tap-based)
- Streaks (per-vow and longest-active)
- Living Flame visualization (driven entirely by Discipline Score + streak, no OS data needed)
- Squad system (4-person, manual flagging, squad chat/encouragement)
- Community feed (Win / Struggle / Ask the tribe / Raw thought post types)
- XP & Levels (named tiers, never decreases)
- Badges (behavior milestones + community + hidden)
- Monk Mode (time-boxed stricter vow set + score multiplier)
- Journal (Three Good Things + One Line, private)
- Sharecards (Day 7 / 30 / 60 / 90 milestone cards)

### Explicitly removed from V1
- AI Mentor (Claude-powered insights / ask-mentor field)
- Screen Time API / Digital Wellbeing integration
- Apple HealthKit / Google Fit / wearable sync
- Temptation Interrupt overlay (requires the Screen Time API to trigger)
- Any native background tracking or OS-level activity monitoring
- Sleep/wake auto-verification (becomes a manually-logged vow like any other, e.g. "Asleep by 11 PM" checked by the user, not detected by the OS)

### What changes mechanically because of the removals
- **Verification tiers collapse from 4 to 2**: Honor system + squad challenge (default), and optional photo proof (user-attached, not OS-attached). No "Verified ×1.0 vs Self-reported ×0.8" multiplier in V1 — all check-ins are weighted equally since there's no automated verification to differentiate them. This can be reintroduced in Phase 2 once APIs are added.
- **The Temptation Interrupt and Night Mode auto-activation are removed** — both depended entirely on OS-level screen detection. A simpler "wind-down reminder" push notification (time-based, not detection-based) can ship in V1 instead: a daily scheduled notification at the user's stated sleep target asking them to log their sleep vow.
- **The Living Flame still works perfectly** — it was always driven by Discipline Score and streak data, never by OS APIs, so it ships unchanged.

---

## 8. Database Structure (MVP-simplified)

```
User
 ├─ id, displayName, identityPath (warrior/scholar/monk/creator/custom)
 ├─ disciplineScore (computed, cached daily), xp, level
 ├─ squadId, tribeId
 └─ createdAt

Vow
 ├─ id, userId, name, category
 ├─ target (string or numeric, free-form)
 ├─ difficulty (easy/medium/hard)
 ├─ frequency (daily/weekly)
 ├─ isCustom (bool)
 ├─ status (active/paused/archived)
 └─ createdAt

DailyCheckIn
 ├─ id, userId, vowId, date
 ├─ completed (bool)
 ├─ reason (string, optional — shown to squad if completed = false)
 ├─ proofPhotoUrl (optional, nullable)
 └─ flaggedBy[] (squad member ids who flagged this entry)

Streak
 ├─ vowId, userId
 ├─ currentStreak, longestStreak
 └─ lastCheckInDate

Squad
 ├─ id, memberIds[4]
 └─ createdAt

SquadChallenge
 ├─ id, checkInId, raisedByUserId
 ├─ status (open/resolved)
 └─ resolutionNote

Tribe
 ├─ id, name, memberCount
 └─ leaderboard (derived, sorted by disciplineScore)

Post (Feed)
 ├─ id, userId, type (win/struggle/ask/raw)
 ├─ relatedVowId (nullable — ties "win" posts to a real streak)
 ├─ body
 ├─ requiresActiveStreak (bool, enforced for "win" type)
 ├─ upvotes, feltThisCount, commentCount
 └─ comments[]: { userId, body, upvotes, pinned }

Badge
 ├─ id, name, tier (behavior/community/hidden)
 └─ unlockCriteria

MonkModeSession
 ├─ id, userId, durationDays, startDate
 ├─ extendedVows[]
 └─ status (active/completed/broken)

JournalEntry
 ├─ id, userId, date
 ├─ threeGoodThings[3], oneLine
 └─ private (always true)

Sharecard
 ├─ id, userId, milestoneDay (7/30/60/90)
 └─ generatedAt
```

No `connectedAPIs`, no OS-sourced timestamp fields, no verification-tier multiplier fields — the schema is meaningfully smaller and faster to build against than the API-dependent version.

---

## 9. Screens & User Flows

### 9.1 Screen List

```
Onboarding
 ├─ Hook screen (pre-auth, social proof)
 ├─ Identity Path selector (Warrior / Scholar / Monk / Creator / Custom)
 ├─ Vow category browser (8 categories)
 ├─ Vow personalization (category → type → target, ×3)
 ├─ Squad match or skip
 └─ Account creation

Main App (tab bar)
 ├─ Home — flame, Discipline Score, vow progress bars, streak/rank/level stats
 ├─ Check-in — daily tap-through per active vow
 ├─ Feed — tribe community posts
 ├─ Squad — pulse list, flags, squad chat
 └─ Profile — XP/level, identity badge, badges, journal, sharecards, settings

Secondary
 ├─ Vow management (add / edit / pause / archive vows)
 ├─ Monk Mode setup & active dashboard
 ├─ Journal entry screen
 └─ Sharecard generator
```

### 9.2 Onboarding Flow

Hook screen (social proof, no signup) → Identity Path selector ("Who are you becoming?") → Vow category browser, pick up to 3 vows across any categories, personalizing target/difficulty for each → Squad match (auto-paired) or skip-for-now → Account creation (gated until after vow selection, so the user is already invested) → Home screen, Day 0 empty state with first check-in prompt

### 9.3 Daily Core Loop

Morning push notification (time-based, user-configured) → Open app → Home (see flame + score) → Check-in screen, tap complete/incomplete per vow, optional reason or proof photo → Score recalculates and flame updates live → Browse feed / squad pulse optionally → Evening wind-down push reminder (time-based) prompts logging the sleep vow before bed

### 9.4 Squad Flag Flow

Squad member sees a check-in that looks off → Taps flag → Note added (optional) → If 2nd flag arrives within 24h, the check-in's score contribution freezes → Logged user sees the flag in their notifications, can respond in squad chat → Squad resolves manually (no algorithmic adjudication in V1)

### 9.5 Milestone / Social Loop

User hits Day 7 / 30 / 60 / 90 → Sharecard auto-generates → Shares to WhatsApp / Instagram Stories → External viewer asks about it → New user installs via Hook screen → Loop repeats

---

## 10. What This MVP Proves (and what it intentionally doesn't try to prove yet)

**This version is designed to validate**: do users create meaningful vows, do they check in daily, does squad visibility increase honesty and retention, does the Discipline Score feel motivating, does the feed produce genuine community engagement.

**This version intentionally does not try to validate**: whether automated verification meaningfully improves trust over squad-based honor systems, whether an AI mentor improves retention, whether wearable data adds engagement. Those are real Phase 2 questions — but they're expensive to answer and unnecessary to answer before the core loop is proven. Build the cheap version first. Let real user behavior tell you whether the expensive features are worth building at all.

---

## 11. Phase 2 (only after MVP validates retention)

- Screen Time API integration → verified vs self-reported scoring multiplier reintroduced
- Wake/sleep OS-level detection → replaces the manually-logged sleep vow
- Temptation Interrupt overlay → becomes possible once Screen Time API exists
- AI Mentor (Claude-powered weekly insights, ask-mentor field)
- Wearable sync (Apple Health / Google Fit) as a premium tier
- 1v1 battles, squad-vs-squad battles
- Optional proof-photo verification tier formalized with its own score weight

---

*This plan is intentionally smaller than the original design. Smaller is the point — it's built to launch fast, cost little, and prove the one thing that actually determines whether Vajra has a future: will people keep their vows when their squad is watching.*
