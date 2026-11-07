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
        path: 'search',
        canMatch: [browseGuard],
        loadChildren: () => import('./features/search/search.routes').then((m) => m.SEARCH_ROUTES),
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
