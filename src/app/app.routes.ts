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
    path: '',
    loadComponent: () => import('./layout/app-shell/app-shell').then((m) => m.AppShell),
    children: [
      { path: '', loadChildren: () => import('./features/home/home.routes').then((m) => m.HOME_ROUTES) },
      {
        path: 'games',
        canMatch: [memberGuard],
        title: 'Games · Lavrel',
        data: { heading: 'Games', branch: 'feat/tracking' },
        loadComponent: () => import('./layout/placeholder-page/placeholder-page').then((m) => m.PlaceholderPage),
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
        path: 'games/:game',
        canMatch: [browseGuard],
        title: 'Game · Lavrel',
        data: { heading: 'Game page', branch: 'feat/game-page' },
        loadComponent: () => import('./layout/placeholder-page/placeholder-page').then((m) => m.PlaceholderPage),
      },
      {
        path: 'search',
        canMatch: [browseGuard],
        title: 'Search · Lavrel',
        data: { heading: 'Search', branch: 'feat/search' },
        loadComponent: () => import('./layout/placeholder-page/placeholder-page').then((m) => m.PlaceholderPage),
      },
      {
        path: 'profile',
        canMatch: [memberGuard],
        title: 'Profile · Lavrel',
        data: { heading: 'Profile', branch: 'feat/profile' },
        loadComponent: () => import('./layout/placeholder-page/placeholder-page').then((m) => m.PlaceholderPage),
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
