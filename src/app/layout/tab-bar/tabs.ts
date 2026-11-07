import { Tab } from '../models/tab.model';

export const TABS: readonly Tab[] = [
  { path: '/home', label: 'Home', icon: 'M3 11l9-7 9 7 M5 10v10h14V10' },
  {
    path: '/games',
    label: 'Games',
    // The Games tab and My library, but not game pages (/games/{id}-{slug}).
    activeOn: /^\/games(\/library)?$/,
    icon: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  },
  { path: '/search', label: 'Search', icon: 'M11 4a7 7 0 1 1 0 14a7 7 0 1 1 0-14z M20 20l-3.5-3.5' },
  { path: '/profile', label: 'Profile', icon: 'M12 4a4 4 0 1 1 0 8a4 4 0 1 1 0-8z M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6' },
];
