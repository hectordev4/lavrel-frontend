# Lavrel — web

Mobile-first Angular 22 frontend for Lavrel. Standalone components, signals, zoneless, lazy feature routes.

## Run it

1. Node **22.22.3+ or 24.15+** (Angular 22 refuses older 22.x).
2. Put your Firebase web config in `src/environments/environment.development.ts`
   (Firebase console → Project settings → Your apps → Web app). Same project as the backend.
3. Firebase console → Authentication → Sign-in method: enable **Email/Password** and **Google**.
4. `npm install` then `npm start` → http://localhost:4200
5. Start the Spring Boot API on :8080. `/api/**` is proxied there by `proxy.conf.json`, so no CORS change is needed in dev.

## Structure

```
src/app
├── core/                  app-wide, no UI
│   ├── auth/              AuthGateway (port) + FirebaseAuthGateway (adapter), AuthStore (signals),
│   │                      AuthSession (sign-out), guards, interceptor (Bearer token, 401 / 403 handling)
│   ├── api/               CurrentUserApi → GET /api/currentuser
│   ├── config/            APP_ENV token
│   └── boot.ts            splash → welcome hand-off
├── shared/ui/             dumb, reusable
│   ├── logo/              CubeLogo (animated cube L), Wordmark
│   └── loading-screen/    full-screen loading page
└── features/              one folder per feature, each owns its routes
    ├── auth/              welcome, sign-in / register, verify-email; AuthFlow facade; Google button
    └── home/              placeholder after sign-in (makes the first /api/currentuser call)
```

Rule of thumb: `features/*` may import `core` and `shared`; `shared` imports nothing from features;
features never import each other; only `firebase-auth.gateway.ts` imports Firebase.
A data client used by one feature lives in that feature's `data-access/`; it moves to `core/api/` once a second feature needs it.

## Flow

Splash (logo builds, then a light chases through it) → **/welcome** → Google popup (redirect fallback on
browsers that block popups) or **/sign-in** / **/register** with e-mail. New e-mail accounts get a
verification e-mail and land on **/verify-email** until they confirm; then the ID token is refreshed so the
backend sees `email_verified=true`. Verified users land on **/home**.

## Logo modes (`<app-cube-logo mode="…">`)

`still`, `intro` (cubes drop in one by one with a gold unlock flash, then idle), `idle` (a shake wave runs
through the cubes every 7 s), `loading` (light chase), `boot` (intro + chase). Reduced motion is respected.
