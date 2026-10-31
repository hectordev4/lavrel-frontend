# Lavrel — web

Mobile-first Angular 22 frontend for Lavrel. Standalone components, signals, zoneless, lazy feature routes.

## Run it

1. Node **22.22.3+ or 24.15+** (Angular 22 refuses older 22.x).
2. Create your environment files from the template and fill in the Firebase web config
   (Firebase console → Project settings → Your apps → Web app; same project as the backend):
   ```
   cp src/environments/environment.example.ts src/environments/environment.ts
   cp src/environments/environment.example.ts src/environments/environment.development.ts
   ```
   Both copies are git-ignored.
3. Firebase console → Authentication → Sign-in method: enable **Email/Password** and **Google**.
4. `npm install` then `npm start` → http://localhost:4200
5. Start the Spring Boot API on :8080. `/api/**` is proxied there by `proxy.conf.json`, so no CORS change is needed in dev.

On macOS older than the Dart SDK supports (e.g. Monterey), Sass fails to start: set
`export NG_BUILD_SASS_EMBEDDED=false` in your shell profile to use the JavaScript compiler.

## Structure

```
src/app
├── core/                     app-wide, no UI
│   ├── auth/                 AuthGateway (port), FirebaseAuthGateway + mapper (adapter),
│   │   │                     AuthStore, AuthSession (sign-out), guards, interceptor, AuthError
│   │   └── models/           AuthUser, AuthProvider, AuthErrorCode, AuthStatus, AuthPlace
│   ├── api/                  CurrentUserApi → GET /api/currentuser
│   │   └── models/           CurrentUser
│   ├── config/               AppEnv model, APP_ENV token
│   └── boot.ts               splash → welcome hand-off
├── shared/ui/                dumb, reusable components
│   ├── cube-logo/            animated cube L (+ geometry, models/)
│   ├── wordmark/             cube L + AVREL
│   └── loading-screen/       full-screen loading page
└── features/                 one folder per feature, each owns its routes
    ├── auth/
    │   ├── pages/            welcome, email-auth (sign-in + register), verify-email
    │   ├── ui/               google-button
    │   ├── data-access/      AuthFlow facade, error messages
    │   └── models/           AuthTask, EmailAuthMode
    └── home/
        ├── pages/            home (placeholder)
        ├── data-access/      HomeProfile (loads the current user), messages
        └── models/           HomeState
```

### Conventions

- **One responsibility per file.** Types and interfaces go in `*.model.ts` files under a `models/` folder;
  components keep their template in `.html` and styles in `.scss`, never inline.
- **Feature folders:** `pages/` (routed screens), `ui/` (presentational pieces), `data-access/`
  (services, facades, messages), `models/`.
- **Imports go one way:** features → core and shared; shared never imports features; features never
  import each other. Only `firebase-auth.gateway.ts` and `firebase-auth.mapper.ts` import Firebase.
- A data client used by one feature lives in that feature's `data-access/`; it moves to `core/api/`
  once a second feature needs it.

## Flow

Splash (logo builds, then a light chases through it) → **/welcome** → Google popup (redirect fallback on
browsers that block popups) or **/sign-in** / **/register** with e-mail. New e-mail accounts get a
verification e-mail and land on **/verify-email** until they confirm; then the ID token is refreshed so the
backend sees `email_verified=true`. Verified users land on **/home**.

## Logo modes (`<app-cube-logo mode="…">`)

`still`, `intro` (cubes drop in one by one with a gold unlock flash, then idle), `idle` (a shake wave runs
through the cubes every 7 s), `loading` (light chase), `boot` (intro + chase). Reduced motion is respected.
