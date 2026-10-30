import { Routes } from '@angular/router';

/** Each feature owns its routes and is loaded lazily. */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'welcome' },
  { path: '', loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES) },
  { path: '**', redirectTo: 'welcome' },
];
