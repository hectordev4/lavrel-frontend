import { Routes } from '@angular/router';
import { signedOutGuard, unverifiedGuard } from '../../core/auth/auth.guards';

export const AUTH_ROUTES: Routes = [
  {
    path: 'welcome',
    canMatch: [signedOutGuard],
    title: 'Lavrel',
    loadComponent: () => import('./pages/welcome/welcome.page').then((m) => m.WelcomePage),
  },
  {
    path: 'sign-in',
    canMatch: [signedOutGuard],
    title: 'Sign in · Lavrel',
    data: { mode: 'sign-in' },
    loadComponent: () => import('./pages/email-auth/email-auth.page').then((m) => m.EmailAuthPage),
  },
  {
    path: 'register',
    canMatch: [signedOutGuard],
    title: 'Create account · Lavrel',
    data: { mode: 'register' },
    loadComponent: () => import('./pages/email-auth/email-auth.page').then((m) => m.EmailAuthPage),
  },
  {
    path: 'verify-email',
    canMatch: [unverifiedGuard],
    title: 'Check your inbox · Lavrel',
    loadComponent: () => import('./pages/verify-email/verify-email.page').then((m) => m.VerifyEmailPage),
  },
];
