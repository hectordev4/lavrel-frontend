import { PublicProfile } from './public-profile.model';

export type PlayerPageState =
  | { kind: 'loading' }
  | { kind: 'ready'; profile: PublicProfile }
  | { kind: 'not-found' }
  | { kind: 'error' };
