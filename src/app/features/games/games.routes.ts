import { Routes } from '@angular/router';

/** The Games tab for members. Game pages (/games/:id-slug) are routed in app.routes.ts. */
export const GAMES_ROUTES: Routes = [
  {
    path: '',
    title: 'Games · Lavrel',
    loadComponent: () => import('./pages/games/games.page').then((m) => m.GamesPage),
  },
  {
    path: 'library',
    title: 'My library · Lavrel',
    data: { heading: 'My library', branch: 'feat/library' },
    loadComponent: () => import('../../layout/placeholder-page/placeholder-page').then((m) => m.PlaceholderPage),
  },
];
