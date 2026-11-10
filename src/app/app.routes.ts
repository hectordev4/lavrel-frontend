import { Routes } from '@angular/router';
import { browseGuard, entryGuard, guestGuard, memberGuard } from './core/auth/auth.guards';

/**
 * Auth screens stand alone; everything else sits inside the app shell (header + tab bar).
 * Each feature owns its routes and is loaded lazily.
 */
export const routes: Routes = [
  // Never matches: entryGuard sends each visitor to welcome, verify-email or home.
  { path: '', pathMatch: 'full', canMatch: [entryGuard], children: [] },
  { path: '', loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES) },
  {
    // Full-screen, without header and tab bar.
    path: 'search/filters',
    canMatch: [browseGuard],
    title: 'Filters · Lavrel',
    loadComponent: () => import('./features/search/pages/filters/filters.page').then((m) => m.FiltersPage),
  },
  {
    path: '',
    loadComponent: () => import('./layout/app-shell/app-shell').then((m) => m.AppShell),
    children: [
      { path: '', loadChildren: () => import('./features/home/home.routes').then((m) => m.HOME_ROUTES) },
      {
        path: 'games',
        canMatch: [memberGuard],
        loadChildren: () => import('./features/games/games.routes').then((m) => m.GAMES_ROUTES),
      },
      {
        path: 'games',
        canMatch: [guestGuard],
        title: 'Games · Lavrel',
        data: {
          heading: 'Your games live here',
          text: 'Sign in to track games, connect Steam and keep your library and collections.',
        },
        loadComponent: () => import('./features/auth/pages/sign-in-gate/sign-in-gate.page').then((m) => m.SignInGatePage),
      },
      {
        path: 'library',
        canMatch: [memberGuard],
        title: 'My library · Lavrel',
        loadComponent: () => import('./features/games/pages/library/library.page').then((m) => m.LibraryPage),
      },
      {
        path: 'library',
        canMatch: [guestGuard],
        title: 'My library · Lavrel',
        data: {
          heading: 'Your games live here',
          text: 'Sign in to track games, connect Steam and keep your library and collections.',
        },
        loadComponent: () => import('./features/auth/pages/sign-in-gate/sign-in-gate.page').then((m) => m.SignInGatePage),
      },
      {
        path: 'games/:slug',
        canMatch: [browseGuard],
        title: 'Game · Lavrel',
        loadComponent: () => import('./features/game/pages/game/game.page').then((m) => m.GamePage),
      },
      {
        // Steam's login sends the browser back here after linking.
        path: 'steam/linked',
        canMatch: [memberGuard],
        title: 'Steam · Lavrel',
        loadComponent: () =>
          import('./features/platforms/pages/steam-linked/steam-linked.page').then((m) => m.SteamLinkedPage),
      },
      {
        path: 'players',
        canMatch: [browseGuard],
        title: 'Find players · Lavrel',
        loadComponent: () => import('./features/players/pages/players/players.page').then((m) => m.PlayersPage),
      },
      {
        path: 'players/:publicId',
        canMatch: [browseGuard],
        title: 'Player · Lavrel',
        loadComponent: () => import('./features/players/pages/player/player.page').then((m) => m.PlayerPage),
      },
      {
        path: 'assistant/chat/:gameId',
        canMatch: [memberGuard],
        title: 'AI chat · Lavrel',
        loadComponent: () => import('./features/assistant/pages/chat/chat.page').then((m) => m.ChatPage),
      },
      {
        path: 'assistant/guide/:gameId/:achievementId',
        canMatch: [memberGuard],
        title: 'AI guide · Lavrel',
        loadComponent: () => import('./features/assistant/pages/guide/guide.page').then((m) => m.GuidePage),
      },
      {
        path: 'assistant',
        canMatch: [memberGuard],
        title: 'AI guide · Lavrel',
        loadComponent: () => import('./features/assistant/pages/assistant/assistant.page').then((m) => m.AssistantPage),
      },
      {
        path: 'assistant',
        canMatch: [guestGuard],
        title: 'AI guide · Lavrel',
        data: {
          heading: 'Guides for every achievement',
          text: 'Sign in to ask the AI how to get an achievement, with or without spoilers.',
        },
        loadComponent: () => import('./features/auth/pages/sign-in-gate/sign-in-gate.page').then((m) => m.SignInGatePage),
      },
      {
        path: 'search',
        canMatch: [browseGuard],
        loadChildren: () => import('./features/search/search.routes').then((m) => m.SEARCH_ROUTES),
      },
      {
        path: 'profile/shelves/:shelfId/achievements',
        canMatch: [memberGuard],
        title: 'Pick achievements · Lavrel',
        loadComponent: () => import('./features/profile/pages/picker/picker.page').then((m) => m.PickerPage),
        canDeactivate: [(page: { canLeave(): boolean }) => page.canLeave()],
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/profile/pages/picker-games/picker-games.page').then((m) => m.PickerGamesPage),
          },
          {
            path: ':gameId',
            loadComponent: () =>
              import('./features/profile/pages/picker-achievements/picker-achievements.page').then(
                (m) => m.PickerAchievementsPage,
              ),
          },
        ],
      },
      {
        path: 'profile',
        canMatch: [memberGuard],
        title: 'Profile · Lavrel',
        loadComponent: () => import('./features/profile/pages/profile/profile.page').then((m) => m.ProfilePage),
      },
      {
        path: 'profile',
        canMatch: [guestGuard],
        title: 'Profile · Lavrel',
        data: {
          heading: 'Your profile lives here',
          text: 'Sign in to connect Steam, see your achievements and share a public profile if you want one.',
        },
        loadComponent: () => import('./features/auth/pages/sign-in-gate/sign-in-gate.page').then((m) => m.SignInGatePage),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
