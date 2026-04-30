# Habit Tracker PWA

A mobile-first Progressive Web App for tracking daily habits, built with Next.js 14, React, TypeScript, and Tailwind CSS.

## Live Demo
[Add your deployed URL here]

---

## Setup

```bash
npm install
npm run dev        # http://localhost:3000
```

### Build
```bash
npm run build && npm start
```

---

## Running Tests

```bash
# Unit tests + coverage report
npm run test:unit

# Integration / component tests
npm run test:integration

# E2E (install browser first)
npx playwright install chromium
npm run test:e2e

# All tests
npm test
```

---

## Project Structure

```
src/
  app/
    layout.tsx             Root layout, PWA meta, SW registration
    page.tsx               / — Splash screen + session redirect
    login/page.tsx         /login
    signup/page.tsx        /signup
    dashboard/page.tsx     /dashboard (protected)
  components/
    auth/
      LoginForm.tsx        testids: auth-login-email/password/submit
      SignupForm.tsx        testids: auth-signup-email/password/submit
    dashboard/
      DashboardClient.tsx  testids: dashboard-page, empty-state, create-habit-button, auth-logout-button
      HabitCard.tsx        testids: habit-card-{slug}, habit-streak-{slug}, habit-complete-{slug}, etc.
      HabitForm.tsx        testids: habit-form, habit-name-input, habit-description-input, etc.
    shared/
      SplashScreen.tsx     testid: splash-screen
      ServiceWorkerRegistrar.tsx
  lib/
    slug.ts                getHabitSlug()
    validators.ts          validateHabitName()
    streaks.ts             calculateCurrentStreak()
    habits.ts              toggleHabitCompletion()
    storage.ts             localStorage helpers
    auth.ts                signUp(), logIn(), logOut()
  types/
    auth.ts                User, Session
    habit.ts               Habit

tests/
  setup.ts
  unit/
    slug.test.ts
    validators.test.ts
    streaks.test.ts
    habits.test.ts
  integration/
    auth-flow.test.tsx
    habit-form.test.tsx
  e2e/
    app.spec.ts

public/
  manifest.json
  sw.js
  icons/
    icon-192.png
    icon-512.png
```

---

## Local Persistence Structure

Three localStorage keys:

| Key | Type | Description |
|-----|------|-------------|
| `habit-tracker-users` | `User[]` | All registered users |
| `habit-tracker-session` | `Session\|null` | Active session |
| `habit-tracker-habits` | `Habit[]` | All habits across all users |

Completions are stored as `YYYY-MM-DD` strings inside each habit. Streak is computed client-side from those dates.

---

## PWA Support

- `public/manifest.json` — name, icons, display, theme colour
- `public/sw.js` — cache-first strategy caches app shell on install
- Service worker registered in `ServiceWorkerRegistrar` client component
- Offline: after first load, app shell renders without network

---

## Test File Map

| File | What it verifies |
|------|-----------------|
| `tests/unit/slug.test.ts` | `getHabitSlug` lowercases, trims, hyphenates, removes special chars |
| `tests/unit/validators.test.ts` | `validateHabitName` rejects empty/long, returns trimmed value |
| `tests/unit/streaks.test.ts` | `calculateCurrentStreak` handles all edge cases |
| `tests/unit/habits.test.ts` | `toggleHabitCompletion` immutable add/remove, no duplicates |
| `tests/integration/auth-flow.test.tsx` | Signup, duplicate rejection, login, invalid credentials |
| `tests/integration/habit-form.test.tsx` | Validation, create, edit, delete confirmation, streak toggle |
| `tests/e2e/app.spec.ts` | Full flows: splash, auth, CRUD, persistence, logout, offline |

---

## Trade-offs

- Passwords stored in plain text in localStorage — by spec (no backend, front-end only)
- Data is per-device (localStorage doesn't sync)
- Daily frequency only — spec requires only `'daily'` for Stage 3
- Offline test relies on service worker caching; first load must be online
