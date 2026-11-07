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
    loadComponent: () => import('./pages/results/results.page').then((m) => m.ResultsPage),
  },
  {
    path: 'filters',
    title: 'Filters · Lavrel',
    data: { heading: 'Filters', branch: 'feat/search-filters' },
    loadComponent: () => import('../../layout/placeholder-page/placeholder-page').then((m) => m.PlaceholderPage),
  },
];
