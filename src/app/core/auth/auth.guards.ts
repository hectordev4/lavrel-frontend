import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthStore } from './auth.store';

type Place = '/welcome' | '/verify-email' | '/home';

/** Where a user belongs right now: welcome when signed out, verify-email until verified, else home. */
function placeFor(store: AuthStore): Place {
  const user = store.user();
  if (!user) return '/welcome';
  return user.emailVerified ? '/home' : '/verify-email';
}

function only(target: Place): CanMatchFn {
  return async () => {
    const store = inject(AuthStore);
    const router = inject(Router);
    await store.ready();
    const place = placeFor(store);
    return place === target ? true : router.parseUrl(place);
  };
}

/** Welcome, sign-in, register: only for signed-out visitors. */
export const guestGuard = only('/welcome');
/** The "check your inbox" page: only for signed-in, unverified e-mail accounts. */
export const unverifiedGuard = only('/verify-email');
/** Everything inside the app: signed in with a verified e-mail. */
export const verifiedGuard = only('/home');
