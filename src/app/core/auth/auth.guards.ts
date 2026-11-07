import { inject } from '@angular/core';
import { CanMatchFn, Router, UrlTree } from '@angular/router';
import { AuthStore } from './auth.store';
import { GuestMode } from './guest-mode';
import { AuthPlace } from './models/auth-place.model';

/** The three account states the routes care about. */
type AccountState = 'signed-out' | 'unverified' | 'member';

async function accountState(): Promise<AccountState> {
  const store = inject(AuthStore);
  await store.ready();
  const user = store.user();
  if (!user) return 'signed-out';
  return user.emailVerified ? 'member' : 'unverified';
}

function to(router: Router, place: AuthPlace): UrlTree {
  return router.parseUrl(place);
}

/**
 * The app's entry (`/`): never matches, always sends people where they belong.
 * Signed out: welcome, or Home if they chose to browse without an account.
 */
export const entryGuard: CanMatchFn = async () => {
  const router = inject(Router);
  const guestMode = inject(GuestMode);
  const state = await accountState();
  if (state === 'unverified') return to(router, '/verify-email');
  if (state === 'member') return to(router, '/home');
  return to(router, guestMode.active() ? '/home' : '/welcome');
};

/** Welcome, sign-in, register: only while signed out. */
export const signedOutGuard: CanMatchFn = async () => {
  const router = inject(Router);
  const state = await accountState();
  if (state === 'signed-out') return true;
  return to(router, state === 'member' ? '/home' : '/verify-email');
};

/** The "check your inbox" page: only for signed-in, unverified e-mail accounts. */
export const unverifiedGuard: CanMatchFn = async () => {
  const router = inject(Router);
  const state = await accountState();
  if (state === 'unverified') return true;
  return to(router, state === 'member' ? '/home' : '/welcome');
};

/**
 * Pages for members (verified e-mail). Signed-out visitors don't match, so the router
 * falls through to the route meant for them (for example a sign-in screen).
 */
export const memberGuard: CanMatchFn = async () => {
  const router = inject(Router);
  const state = await accountState();
  if (state === 'unverified') return to(router, '/verify-email');
  return state === 'member';
};

/** The version of a page for people browsing without an account. Members don't match. */
export const guestGuard: CanMatchFn = async () => {
  const router = inject(Router);
  const state = await accountState();
  if (state === 'unverified') return to(router, '/verify-email');
  return state === 'signed-out';
};

/** Pages open to everyone (search, game pages). Unverified accounts finish verifying first. */
export const browseGuard: CanMatchFn = async () => {
  const router = inject(Router);
  const state = await accountState();
  return state === 'unverified' ? to(router, '/verify-email') : true;
};
