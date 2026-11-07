import { QuickResults } from './quick-results.model';

/** What the suggestion panel shows for the text typed so far. idle: fewer than 2 characters. */
export type SuggestionsState =
  | { kind: 'idle' }
  | { kind: 'loading'; query: string }
  | { kind: 'ready'; query: string; results: QuickResults }
  | { kind: 'error'; query: string; message: string };
