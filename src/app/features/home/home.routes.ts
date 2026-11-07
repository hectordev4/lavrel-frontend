import { Routes } from '@angular/router';
import { guestGuard, memberGuard } from '../../core/auth/auth.guards';

export const HOME_ROUTES: Routes = [
  {
    path: 'home',
    canMatch: [memberGuard],
    title: 'Lavrel',
    loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'home',
    canMatch: [guestGuard],
    title: 'Discover · Lavrel',
    loadComponent: () => import('./pages/guest-home/guest-home.page').then((m) => m.GuestHomePage),
  },
];
