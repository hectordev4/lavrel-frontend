import { Routes } from '@angular/router';

export const SEARCH_ROUTES: Routes = [
  {
    path: '',
    title: 'Search · Lavrel',
    loadComponent: () => import('./pages/search/search.page').then((m) => m.SearchPage),
  },
  {
    path: 'results',
    title: 'Results · Lavrel',
    data: { heading: 'Results', branch: 'feat/search-results' },
    loadComponent: () => import('../../layout/placeholder-page/placeholder-page').then((m) => m.PlaceholderPage),
  },
];
