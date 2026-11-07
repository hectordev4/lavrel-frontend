import { Routes } from '@angular/router';

/**
 * The Games tab for members. Only game pages may live under /games/ besides this list (/games/{slug},
 * routed in app.routes.ts), so any other page (My library, stats…) gets its own top-level path.
 */
export const GAMES_ROUTES: Routes = [
  {
    path: '',
    title: 'Games · Lavrel',
    loadComponent: () => import('./pages/games/games.page').then((m) => m.GamesPage),
  },
];
