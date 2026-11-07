import { Routes } from '@angular/router';
import { entryGuard } from './core/auth/auth.guards';

/**
 * Each feature owns its routes and is loaded lazily.
 * Coming next: features/onboarding (username suggested by the backend + country).
 */
export const routes: Routes = [
  // Never matches: entryGuard sends each visitor to welcome, verify-email or home.
  { path: '', pathMatch: 'full', canMatch: [entryGuard], children: [] },
  { path: '', loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES) },
  { path: '', loadChildren: () => import('./features/home/home.routes').then((m) => m.HOME_ROUTES) },
  { path: '**', redirectTo: '' },
];
