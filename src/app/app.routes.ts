import { Routes } from '@angular/router';

/**
 * Each feature owns its routes and is loaded lazily.
 * Coming next: features/onboarding (username suggested by the backend + country).
 */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'welcome' },
  { path: '', loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES) },
  { path: '', loadChildren: () => import('./features/home/home.routes').then((m) => m.HOME_ROUTES) },
  { path: '**', redirectTo: 'welcome' },
];
