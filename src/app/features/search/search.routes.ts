import { Routes } from '@angular/router';

/** Inside the app shell. The filters screen is full-screen, so it is routed in app.routes.ts. */
export const SEARCH_ROUTES: Routes = [
  {
    path: '',
    title: 'Search · Lavrel',
    loadComponent: () => import('./pages/search/search.page').then((m) => m.SearchPage),
  },
  {
    path: 'results',
    title: 'Results · Lavrel',
    loadComponent: () => import('./pages/results/results.page').then((m) => m.ResultsPage),
  },
];
