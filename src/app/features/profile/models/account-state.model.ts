import { CurrentUser } from '../../../core/api/models/current-user.model';

export type AccountState =
  { kind: 'loading' } | { kind: 'ready'; user: CurrentUser } | { kind: 'error' };
