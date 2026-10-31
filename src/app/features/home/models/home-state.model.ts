import { CurrentUser } from '../../../core/api/models/current-user.model';

/** What the home page is showing: the profile loading, loaded, or failed. */
export type HomeState =
  | { kind: 'loading' }
  | { kind: 'ready'; user: CurrentUser }
  | { kind: 'error'; message: string };
