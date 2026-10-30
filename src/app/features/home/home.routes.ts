import { Routes } from '@angular/router';
import { verifiedGuard } from '../../core/auth/auth.guards';

export const HOME_ROUTES: Routes = [
  {
    path: 'home',
    canMatch: [verifiedGuard],
    title: 'Lavrel',
    loadComponent: () => import('./home.page').then((m) => m.HomePage),
  },
];
