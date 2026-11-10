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
   To use the deployed backend instead, set `apiBaseUrl: 'https://lavrel.onrender.com'` in your environment file.

The backend's README (API reference section, `hectordev4/lavrel-backend`) is the source of truth for every endpoint.

When the frontend is deployed, add its origin to `CORS_ALLOWED_ORIGINS` and `FRONTEND_BASE_URL` in Render, and its
domain to Firebase → Authentication → Settings → **Authorized domains**.

On macOS older than the Dart SDK supports (e.g. Monterey), Sass fails to start: set
`export NG_BUILD_SASS_EMBEDDED=false` in your shell profile to use the JavaScript compiler.

## Tests and CI

- `npm test` runs the unit tests (Vitest) and watches for changes; `npm run test:ci` runs them once.
- Every component, service and helper gets a `*.spec.ts` next to it, written with the feature that adds it.
- Shared test setup lives in `src/testing/` (left out of the app build): `testProviders()` (HTTP testing, empty
  router, test environment), `memberUser()` / `unverifiedUser()`, `FakeAuthGateway` (no Firebase, spy methods) and
  `signInAs(user)`.
- Coverage so far: **core** (auth mapper, store, guest mode, guards, interceptor, session, API clients, tracked games,
  platform accounts, messages), **shared** (every shared component, relativeTime, gameLink), **layout** (tab
  bar, header, placeholder) and every **feature** (auth, search, game, games and library, both Homes, profile,
  Steam return page) plus the root `App`. `src/testing/fixtures.ts` builds sample games, achievements, tracked
  and library games. About 200 tests, all run by CI.
- **GitHub Actions** (`.github/workflows/ci.yml`) runs on pushes to `main`, `dev`, `feat/**`, `fix/**` and `ci/**`
  and on pull requests into `main` and `dev`: `npm ci`, environment files copied from `environment.example.ts`, a
  production build and `npm run test:ci`. A newer push cancels the run still going on the same branch.
- Protect `main` and `dev` on GitHub (Settings → Branches) so a pull request can only merge with **Build and test**
  passing.

## Structure

```
src/app
├── core/                     app-wide, no UI
│   ├── auth/                 AuthGateway (port), FirebaseAuthGateway + mapper (adapter),
│   │   │                     AuthStore, AuthSession (sign-out), GuestMode, guards, interceptor, AuthError
│   │   └── models/           AuthUser, AuthProvider, AuthErrorCode, AuthStatus, AuthPlace
│   ├── api/                  CurrentUserApi → GET /api/currentuser, GameCatalogApi → GET /api/games,
│   │   │                     TrackingApi → /api/currentuser/tracked (list, status, pins),
│   │                     AccountsApi → /api/currentuser/accounts (list, link, sync),
│   │                     LibraryApi → GET /api/currentuser/games
│   │   └── models/           CurrentUser, GameCard, GamePage, GameSearchParams, GameSort, GameSystem,
│   │                         TrackedGame, TrackingStatus, NextAchievement, Platform, PlatformAccount, SyncResult,
│   │                         LibraryGame, LibraryPage, LibraryParams, LibrarySort
│   ├── tracking/             TrackedGames (shared store of the member's tracked games), status labels, messages
│   ├── platforms/            PlatformAccounts (linked accounts, link, sync with pending rounds), messages
│   ├── profile/              MyAvatar (avatar, seed and initial for the header and Profile), shelf types and names
│   ├── config/               AppEnv model, APP_ENV token
│   └── boot.ts               splash → welcome hand-off
├── layout/                   the frame around in-app pages
│   ├── app-shell/            header + page + tab bar
│   ├── app-header/           static wordmark, avatar (members) or Sign in (guests)
│   ├── tab-bar/              Home, Search, AI, Games (Profile: the avatar at the top right)
│   └── placeholder-page/     stands in for tabs whose branch hasn't landed
├── shared/ui/                dumb, reusable components
│   ├── cube-logo/            animated cube L (+ geometry, models/)
│   ├── wordmark/             cube L + AVREL
│   ├── cta-card/             call to action with the animated big L
│   ├── chip/                 toggle or removable pill button
│   ├── progress-bar/         tiered progress bar (+ progressTier, progressPercent)
│   ├── perfect-diamond/      hue-shifting diamond for 100% games
│   ├── track-control/        Track / status select / Stop tracking / pin (presentational)
│   ├── modal/                bottom sheet on the native <dialog>
│   ├── switch/               on/off setting (role="switch")
│   ├── avatar/               animated round avatar (upload, gallery or generated Pixelbot)
├── shared/utils/             relativeTime ("2 hours ago"), gameLink (/games/{slug}), avatar-art (Pixelbot drawing)
│   ├── game-cover/           cover image with an initials fallback
│   ├── game-row/, game-tile/ a game in a list / in a sideways row
│   └── loading-screen/       full-screen loading page
└── features/                 one folder per feature, each owns its routes
    ├── auth/
    │   ├── pages/            welcome, email-auth (sign-in + register), verify-email, sign-in-gate
    │   ├── ui/               google-button
    │   ├── data-access/      AuthFlow facade, error messages
    │   └── models/           AuthTask, EmailAuthMode
    ├── assistant/            the AI tab and achievement guides
    │   ├── pages/            assistant (/assistant), guide (/assistant/guide/:gameId/:achievementId),
    │   │                     chat (/assistant/chat/:gameId)
    │   ├── ui/               guide-answer
    │   ├── data-access/      AssistantApi (guide, questions, chat, usage), GuideConversation, GameChat,
    │   │                     ChatGamePicker, markdown, system-language,
    │   │                     messages
    │   └── models/           GuideAnswer, GuideSource, GuideMessage, GuideStatus, AssistantUsage, ChatTurn
    ├── platforms/
    │   └── pages/            steam-linked (where Steam's login returns)
    ├── players/              public profiles
    │   ├── pages/            player (/players/:publicId), players (/players, search)
    │   ├── ui/               shelf, player-row
    │   ├── data-access/      PlayersApi → GET /api/users/{publicId}, GET /api/users?q=, PlayerSearch, shelf labels
    │   └── models/           PublicProfile, Shelf and its items, PlayerPageState
    ├── profile/
    │   ├── pages/            profile (the Profile tab), picker, picker-games, picker-achievements
    │   ├── ui/               privacy-section, platforms-section, avatar-picker, shelves-section
    │   ├── data-access/      AccountApi (name, country, countries, delete), MyAccount, PrivacyApi, messages
    │   └── models/           Country, AccountState, ProfileSettings
    ├── games/                the Games tab for members
    │   ├── pages/            games (tracking list), library (/library)
    │   ├── ui/               tracked-card, library-card
    │   ├── data-access/      tracked-list (filter and sort), MyLibrary (paging), CollectionsApi, MyCollections,
    │   │                     library labels, messages
    │   └── models/           StatusFilter, TrackedSort, LibraryQuery, LibraryState, Collection
    ├── game/
    │   ├── pages/            game (/games/:slug)
    │   ├── ui/               progress-card, achievement-item
    │   ├── data-access/      GameDetailsApi → GET /api/games/{id}, GameAchievementsApi → …/achievements,
    │   │                     GamePage, GameAchievementsStore (filter, show all, reveal), game-facts, messages
    │   └── models/           GameDetails, GamePageState, Achievement, GameAchievements, AchievementFilter,
    │                         AchievementsState
    ├── home/
    │   ├── pages/            home (members), guest-home (discover)
    │   ├── ui/               pinned-row, almost-tile, stats-row, recent-unlock
    │   ├── data-access/      HomeProfile (loads the current user), Discover (popular, newest), AlmostThere,
    │   │                     MemberOverviewApi → /api/currentuser/stats, …/achievements/recent, MemberOverview, messages
    │   └── models/           HomeState, DiscoverSection, AlmostThereState, MemberStats, RecentUnlock
    └── search/
        ├── pages/            search (box + suggestions), results, filters (full screen)
        ├── ui/               suggestion-list, result-card, typeahead-field
        ├── data-access/      QuickSearchApi → GET /api/search, FilterOptionsApi → GET /api/tags, /api/creators,
        │                     SearchSuggestions and OptionSearch (debounced), SearchResults (paging),
        │                     search-query (address ↔ filters ↔ API), labels, messages
        └── models/           QuickResults, TagOption, CreatorOption, CreatorRole, FilterOption, SuggestionsState,
                              SearchFilters, NamedFilter, PlayerMode, ResultsState
```

### Conventions

- **One responsibility per file.** Types and interfaces go in `*.model.ts` files under a `models/` folder;
  components keep their template in `.html` and styles in `.scss`, never inline.
- **Feature folders:** `pages/` (routed screens), `ui/` (presentational pieces), `data-access/`
  (services, facades, messages), `models/`.
- **Imports go one way:** features and layout → core and shared; shared never imports features; features never
  import each other. Only `firebase-auth.gateway.ts` and `firebase-auth.mapper.ts` import Firebase.
- A data client used by one feature lives in that feature's `data-access/`; it moves to `core/api/`
  once a second feature needs it.

## Flow

Splash (logo builds, then a light chases through it) → **/welcome** → Google popup (redirect fallback on
browsers that block popups) or **/sign-in** / **/register** with e-mail. New e-mail accounts get a
verification e-mail and land on **/verify-email** until they confirm; then the ID token is refreshed so the
backend sees `email_verified=true`. Verified users land on **/home**.

**Skip for now** on the welcome page opens the app without an account and is remembered in this browser
(signing in or out forgets it). Guests can use Home (discover), Search and game pages; the Games and Profile
tabs show a sign-in screen.

| Route | Signed out | Unverified | Member |
|---|---|---|---|
| `/` | welcome, or home after *Skip for now* | verify-email | home |
| `/welcome`, `/sign-in`, `/register` | ✓ | verify-email | home |
| `/home` | discover home | verify-email | member home |
| `/search`, `/search/results`, `/search/filters`, `/games/:slug`, `/players`, `/players/:publicId` | ✓ | verify-email | ✓ |
| `/games`, `/library`, `/assistant`, `/profile` | sign-in screen | verify-email | ✓ |

## Search

Typing in the Search tab suggests up to 5 games, 5 tags and 3 franchises after a 250 ms pause (2 characters
minimum). Enter or *See all results* opens `/search/results`.

Every filter lives in the address, so results can be reloaded and shared:

| Parameter | Example | Notes |
|---|---|---|
| `q` | `q=witcher` | typo tolerant, 2+ characters |
| `tag` | `tag=1716:Roguelike` | repeat for more, up to 5, all must apply |
| `franchise`, `developer`, `publisher` | `franchise=55:Monster Hunter` | one each |
| `mode` | `mode=co-op` | `single-player`, `co-op`, `multiplayer`; repeat, all must apply |
| `system` | `system=PC` | `PC`, `XBOX`, `PLAYSTATION` |
| `sort` | `sort=rating` | `relevance` (default with `q`), `popular` (default without), `rating`, `newest`, `name` |

Named filters travel as `id:name` so chips show the name without another request; only the id goes to the
API. Results load 20 at a time; *Show more* appears while the backend reports `hasMore`.

The **Filters** button opens `/search/filters`, a full-screen sheet (no header or tab bar). Tags and creators
are picked from type-aheads (`GET /api/tags`, `GET /api/creators?role=`), showing each option's game count.
Changes stay in a draft until *Show results*; *Clear all* keeps the typed query.

## Game page

`/games/{slug}`, loaded with `GET /api/games/slug/{slug}`; the returned id is used for the achievements, tracking
and guides. Slugs are unique and never change (a repeated title gets `-2`, `-3`…). Every link to a game goes
through `gameLink(slug)` in `shared/utils`. **Nothing else lives under `/games/`** besides the Games tab itself:
any other page (My library, stats…) gets its own top-level path, so no slug can clash with it. Public. The release date shows once,
under the title; Details lists developer, publisher, franchise, price (free or paid), systems, player modes,
controller and accessibility, taken from the game's grouped store features. Tapping a tag opens search
filtered by it. Systems come from the backend's `availableOn`, or PC when Steam lists a desktop platform.

Achievements come from `GET /api/games/{id}/achievements`. Everyone sees the list with worldwide percentages
(first 10, then *Show all*). Signed in, the token adds a **Your progress** card (tiered bar, diamond at 100%),
unlock dates, the percentage in your country (“—” until enough players there own the game) and an
All / Unlocked / Locked filter. Hidden achievements stay blurred until tapped, unless you unlocked them.
The percentage on the bar is rounded down, so it only reads 100% when everything is unlocked.

## Tracking

Members add catalog games (owned or not) to their tracking list with a status: Playing, Backlog, Completed or
Dropped, and pin up to 20 of them to Home (quick access). `TrackedGames` in `core/tracking` loads the list once on
first use and every screen reads from it, so a change on one screen shows everywhere. It clears itself on
sign-out. Actions return an error message or null; a 21st pin is stopped before calling the backend.

The **Games tab** (`/games`) shows the list with status chips and counts, a sort (newest release first, title,
recently changed; games without a release date last) and one card per game: status select, pin (gold when
pinned), *Remove from tracking* after a confirmation, progress with the tiered bar, and the three easiest
achievements left. Filtering and sorting happen in the browser on the loaded list.

The **track control** appears on the game page (status select and pin) and, for members, on each search result
(status only). *Track* adds the game as Playing; the select changes the status or stops tracking after a
confirmation. Guests see *Sign in to track* on the game page.

## Profile

The Profile tab shows the initial avatar, display name, player id (grouped in fours, with a copy button; a green tick beside it confirms the copy for a second) and country. Rows
open sheets to change the display name (`PATCH /api/currentuser/username`; names don't need to be unique) and the
country (`GET /api/countries`, `PATCH /api/currentuser/country`, only used for country statistics). The e-mail is
shown as private. *Sign out* lives here; *Delete account* asks you to type DELETE, then calls
`DELETE /api/currentuser?confirm=true` and signs out.

**Public profile** switches (`GET` / `PATCH /api/currentuser/profile`): public, show country, show platforms, show
avatar and, once the backend sends `showLibrarySize`, show how many games you own. All off by default; the detail
switches are disabled while the profile is private. Each change saves at once and switches back if it fails.

**Platforms**: Steam connected shows a round badge (a slot for Steam's official logo from its brand assets), the
Steam display name, a green *Connected* (`--connected`, only on your own settings), when it last synced, *Sync
automatically* (`GET` / `PUT /api/currentuser/auto-sync`), *Sync now* and *Unlink Steam* after a confirmation
(`DELETE /api/currentuser/accounts/{platform}/{externalId}`). Not connected: *Connect Steam*. Xbox and PlayStation
show as coming soon.

## Avatars

Every robot is **[Pixelbot](https://www.dicebear.com/styles/pixelbot/) by DiceBear**, released under
**CC0 1.0** (public domain, no attribution required; the avatar sheet credits it anyway), drawn in the browser with
`@dicebear/core` (MIT) and `@dicebear/styles`, both pinned. Every avatar uses Pixelbot's built-in CSS animation at
the slow speed; the SVG stops moving by itself for people who ask for reduced motion. DiceBear is loaded on first
use, so it isn't part of the first download.

| Kind | What shows | Backend |
|---|---|---|
| Generated (default) | the Pixelbot seeded with the member's public id | `DELETE /api/currentuser/profile/avatar` goes back to it |
| Gallery | the Pixelbot seeded with the gallery id (`gallery-01`…) | ids from `GET /api/avatars/gallery`; `PUT …/avatar/gallery` |
| Upload | the member's picture at `imageUrl` (public `avatars` bucket) | `PUT /api/currentuser/profile/avatar` with the file as the body |

Every avatar endpoint answers `{"kind", "galleryId", "imageUrl"}`. Uploads: JPG or PNG up to 2 MB (the backend crops
them to a 256×256 square and strips hidden photo data), GIF up to 1 MB and 512×512 with animation kept. The sheet
checks type and size before uploading; the backend's `invalid_avatar` message covers the rest.

The header and the Profile tab share `MyAvatar`, so a new avatar shows everywhere at once.

## Public profiles

`/players/{publicId}` (`GET /api/users/{publicId}`, no account needed) shows the avatar, name, player id and month
joined, plus country, round platform badges and the picture only when the owner turned them on. Then each shelf in
the owner's order: games (`COLLECTION`, `RECENTLY_PLAYED`, `PLAYING`, `COMPLETED`) as a row linking by slug,
`ACHIEVEMENTS` as a list with rare ones (under 5%) in gold, and `STATS` (games owned only if `showLibrarySize` is
on). Untitled shelves use their type's name. A private profile reads *Profile not found*, exactly like an unknown
one. The Profile tab links to your own. Covers on shelves and in My library keep Steam's wide 460×215 shape.

**Managing shelves** (Profile tab, `/api/currentuser/profile/shelves`): up to 10. Drag a shelf by its six-dot
handle to reorder (Angular CDK drag and drop; the tile floats on its own layer, a gold dashed slot shows where it
lands, and the arrow keys on the handle do the same). The new order shows at once, sends the whole order, and is put
back if the save fails. Tap a shelf's name to change its title (empty: the type's name); the bin removes it after a
confirmation sheet. **Pick** on an `ACHIEVEMENTS` shelf opens the achievements picker page. *Add a shelf* only offers types you don't have yet; collections can repeat and need a
collection. **The achievements picker** (`/profile/shelves/{shelfId}/achievements`) picks up to 12 from any of your games, in two
steps on one page: your games with unlocks (`GET /api/currentuser/achievements/games`: search, Recent or Name, 24 per
page), then one game's unlocks (`GET /api/currentuser/games/{gameId}/achievements/unlocked`, rarest or newest first,
rare ones in gold). A bar at the bottom shows *N of 12 picked*, opens the picks in order to remove one, and saves them
(`PUT …/shelves/{id}/achievements`), then returns to Profile. It starts from the shelf's `achievements` (sent in full
by `GET /api/currentuser/profile/shelves`); the rest turn off at 12; leaving with unsaved picks asks first.
`CollectionsApi` and `MemberOverviewApi` live in `core/api` because Games, Home and Profile all use them.

**Finding players** (`/players`, from *Looking for a player?* in the Search tab): `GET /api/users?q=` (answers
`{"players": [...], "page": 0}`, each with the profile header's fields) with a name
(2+ characters, after a 300 ms pause) or a player id typed with or without its spaces. Only public profiles appear.
Each result shows the avatar, name, player id and country. The Search tab stays lit on `/players` and on public
profiles.

## AI guides

Members get a **Guide** button on each achievement of a game page. It opens `/assistant/guide/{gameId}/{achievementId}`:

1. A sheet asks **Spoilers or no spoilers?**, explaining both. The choice holds for the whole conversation.
2. The guide (`GET …/guide?spoilers=&lang=`), then the fixed line *Is there anything else I can help with?* and a reply
   box for follow-ups (`POST …/guide/questions`, with the same spoiler choice).
3. Each answer: a note when `grounded` is false (couldn't be checked against a source, may be inaccurate), the text,
   and its **sources at the very bottom as rounded pills** (site name; title and license for screen readers; the
   licenses in a line under them).
4. Under the reply box: the new answers left today (`GET /api/currentuser/assistant/usage`). Saved guides don't count.

A hidden achievement keeps its name out of the title until spoilers are chosen; asked without spoilers, the backend's
`SPOILER_CONSENT_REQUIRED` shows a consent step. `lang=` is the device's language (two letters, English if unknown).
Conversations live only while the screen is open and are never stored. Answers are Markdown rendered with `marked`
(MIT, pinned): raw HTML is shown as text, only `http(s)` links are kept and open in a new tab, images are dropped, and
Angular's sanitizer cleans the result. The cheerful tone is set by the backend's prompt, which never ends with its own
question, so the app's follow-up line never appears twice.

**Open chat** (`/assistant/chat/{gameId}`, `POST /api/games/{gameId}/chat`): from the AI tab (a *Which game?* search,
plus your pinned and Playing games) or *Ask the AI about this game* on a game page. It starts with a greeting and three
starter questions. The app keeps the conversation and sends it with each question (`{"messages": [{"role", "content"}],
"lang"}`, up to 40; the backend reads the last 12); nothing is stored. The backend keeps story spoilers out of the
open chat, so it has no spoiler sheet. Answers look like guides: sources as pills when `grounded`, a **Reviewed** badge
when `curated` (written or rewritten by an admin). Admins are unlimited (`unlimited: true`): the screens then say
*No daily limit for you*.

## My library

`/library` lists the games owned on linked accounts (`GET /api/currentuser/games`), 48 at a time with
*Show more*: cover, title, tiered bar, unlocked of total, playtime and the diamond at 100%. A name filter (2+
characters, after a 300 ms pause) and five sorts: recently played (default), name, most played, most completed and
newest release. Without Steam it shows *Connect Steam*. The Games tab stays lit on /games and /library but not on game pages.

**Collections** (`/api/currentuser/collections`, owned games only, up to 50): chips above the grid switch between
*All games* and each collection with its game count; *New collection* opens a sheet for the name (up to 40
characters). Inside a collection: *Rename*, *Delete* (the games stay in the library) and, per game, *Remove from …*.
Every game's menu has *Add to collection…*, a sheet listing the collections. Sheets use the shared `Modal`.

## Home for members

In order: a greeting with the username, the Steam line (*synced 2 hours ago* and **Sync now**, which shows how many
games came in), **Playing now** (pinned games in their pin order, with the tiered bar and the diamond at 100%,
*Edit* opening Games and *Pin a game*), and **Almost there** (owned games closest to 100%, from the library sorted by
progress, reloaded after each sync). Until Steam is connected, a *Connect Steam* card replaces the Steam line and
*Popular on Lavrel* and *New releases* follow. Everything waits for the first `GET /api/currentuser`, which creates
the user on the backend.

Under the greeting, **totals** (`GET /api/currentuser/stats`): achievements unlocked, average completion (over games
with at least one unlock; "—" while there are none) and perfect games with the diamond, shown once you own games.
After Almost there, **Recent unlocks** (`GET /api/currentuser/achievements/recent`, 3 newest): icon, name, game (links
to its page), when, and the share of players who have it, in gold as *Rare* under 5%. Hidden achievements aren't
blurred here: they're your own unlocks. Both reload after each sync. An *All* link waits for a paged list.

## Linking and syncing Steam

1. *Connect Steam* calls `POST /api/currentuser/accounts/steam/link` and sends the browser to the `redirectUrl`.
2. After the Steam login, the backend redirects to `{FRONTEND_BASE_URL}/steam/linked?status=success`
   (or `status=error&reason=…`). Set `FRONTEND_BASE_URL` in the backend to this app's address
   (`http://localhost:4200` in development).
3. `/steam/linked` runs the first sync right away. A sync imports a limited number of new games per call, so
   *Sync now* calls `POST /api/currentuser/accounts/{platform}/{externalId}/sync` again while `gamesPending` is above
   0 (up to 10 calls), then reloads the accounts and the tracked games.

Errors are explained in words: a private Steam profile (set **Game details** to Public), Steam not answering, or
too many syncs.

## Logo modes (`<app-cube-logo mode="…">`)

`still`, `intro` (cubes drop in one by one with a gold unlock flash, then idle), `idle` (a shake wave runs
through the cubes every 7 s), `loading` (light chase), `boot` (intro + chase). Reduced motion is respected.

## Designs

The screens live on the **Lavrel — Main view** design canvas:
https://claude.ai/artifact/8qm291jDAfC7MbEtQwetLq (private to the owner until shared). All game names and numbers on it
are example data.

| Row | Screens |
|---|---|
| Getting in | Welcome (sign in or *Skip for now*), Home without an account, Profile without an account |
| Signed in | Home (returning player), Home (first visit), Games: tracked, Games: my library, Progress bar tiers |
| Search and game pages | Search suggestions, Search results, Filters, Game page, AI guide, AI guide spoiler check |
| Profile | Settings, Settings without Steam, Avatar picker, Public profile (full), Public profile (simple) |

### Design rules

- **Palette** (from the app icon): ink `#1c1c1c` background, raised `#262624`, cream `#f2f0ea` text and primary
  buttons, muted `#a19e95`, gold `#e8b84a` for unlocks and focus, green `#6fcf8f` only for a platform's
  *Connected* state as the owner sees it. Fonts: Manrope (UI), IBM Plex Mono (wordmark, numbers).
- **Cube L.** The small L in the header is static. Every big L (splash, welcome, call-to-action cards, loading
  screens) is animated: cubes drop in one by one with a gold flash, then a shake wave runs through them every 7 s.
- **Progress bars** by completion:

  | Progress | Bar |
  |---|---|
  | 0–19% | gray |
  | 20–49% | bronze |
  | 50–79% | silver |
  | 80–89% | gold |
  | 90–99% | gold with a steady aura |
  | 100% | hue-shifting with an aura, plus the diamond |

- **Perfect games** (100%) show a faceted diamond whose colours cycle through the hues. Reduced motion stops
  every animation.
- **Platform badges** are round with the platform's official logo inside (from the platform's brand assets).
- **Without an account** people can browse and search the catalog and open game pages. Games (tracking, library)
  and Profile show a sign-in screen instead.
- **Privacy.** Public profiles are opt-in; country, platforms, avatar and (pending in the backend) library size
  each have their own switch, off by default.
- **Game page** keeps the release date under the title only; the developer is in Details; no minimum age or
  age ratings.

## Roadmap (one `feat/*` branch each, merged into `dev`)

1. `feat/app-shell` ✓: header, tab bar, browsing without an account, call-to-action cards, discover home
2. Search, in three branches:
   - `feat/search-suggestions` ✓: search box with grouped suggestions (games, tags, franchises)
   - `feat/search-results` ✓: results with paging, sort and removable filter chips
   - `feat/search-filters` ✓: filters screen (tags, franchise, developer, publisher, modes, system)
3. Game page, in two branches:
   - `feat/game-page` ✓: cover, title, release date, rating, systems, about, tags, genres, details
   - `feat/game-achievements` ✓: your progress and the achievement list with worldwide and country percentages
4. Tracking, in three branches:
   - `feat/tracking-core` ✓: tracking API and the shared TrackedGames store
   - `feat/tracking-list` ✓: the Games tab for members (statuses, sort, pins, easiest next achievements)
   - `feat/tracking-actions` ✓: Track and pin on the game page and on search results
5. Signed-in Home, in two branches:
   - `feat/platform-accounts` ✓: linked accounts, Connect Steam, Sync now, the /steam/linked return page
   - `feat/member-home` ✓: greeting, Sync now, Playing now (pinned), Almost there
   - `feat/game-slugs` ✓: game pages at /games/{slug}, My library at /library
   - `feat/home-stats` ✓: totals and recent unlocks
6. Library, in two branches:
   - `feat/library-list` ✓: My library grid with name filter, five sorts and paging
   - `feat/collections` ✓: collections (create, rename, delete, browse, add and remove games)
7. Profile, in several branches:
   - `feat/profile-account` ✓: header, display name, country, e-mail, sign out, delete account
   - `feat/profile-privacy` ✓: public profile switches
   - `feat/profile-platforms` ✓: Steam (connected state, Sync now, automatic sync, unlink), Xbox and PlayStation soon
   - `feat/profile-avatar` ✓: animated avatars and the avatar picker (generated, gallery, upload)
8. Public profiles, in branches:
   - `feat/public-profile` ✓: the public profile page with its shelves
   - `feat/profile-shelves` ✓: adding, titling, ordering and removing your shelves; picking achievements
   - `feat/player-search` ✓: finding players by name or id
9. AI, in branches:
   - `feat/ai-nav` ✓: tab bar Home, Search, AI, Games; the AI tab
   - `feat/ai-guide` ✓: a Guide button on each achievement, spoiler choice, chat screen, sources, daily allowance
   - `feat/ai-chat` ✓: open chat about a game from the AI tab and game pages; Reviewed badge; unlimited admins

Done alongside: `ci/github-actions` ✓ (build and tests on GitHub Actions) and the `test/*` pass ✓ (`test/core`,
`test/shared`, `test/layout`, `test/features`) adding specs for every component built so far. From here on, every
feature branch brings its own specs.
