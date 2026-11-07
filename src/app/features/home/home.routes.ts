import { Routes } from '@angular/router';
import { memberGuard } from '../../core/auth/auth.guards';

export const HOME_ROUTES: Routes = [
  {
    path: 'home',
    canMatch: [memberGuard],
    title: 'Lavrel',
    loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
  },
];
