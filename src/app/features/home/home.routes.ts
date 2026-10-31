import { Routes } from '@angular/router';
import { verifiedGuard } from '../../core/auth/auth.guards';

export const HOME_ROUTES: Routes = [
  {
    path: 'home',
    canMatch: [verifiedGuard],
    title: 'Lavrel',
    loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
  },
];
