import { Tab } from '../models/tab.model';

/** Home, Search, AI, Games. Profile is reached from the avatar at the top right. */
export const TABS: readonly Tab[] = [
  { path: '/home', label: 'Home', icon: 'M3 11l9-7 9 7 M5 10v10h14V10' },
  {
    path: '/search',
    label: 'Search',
    // Games search, player search and public profiles.
    activeOn: /^\/(search|players)(\/|$)/,
    icon: 'M11 4a7 7 0 1 1 0 14a7 7 0 1 1 0-14z M20 20l-3.5-3.5',
  },
  {
    path: '/assistant',
    label: 'AI',
    icon: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z',
  },
  {
    path: '/games',
    label: 'Games',
    // The Games tab and My library, but not game pages (/games/{slug}).
    activeOn: /^\/(games|library)$/,
    icon: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  },
];
