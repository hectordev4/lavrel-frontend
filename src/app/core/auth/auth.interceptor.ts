import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { APP_ENV } from '../config/app-env.token';
import { AuthGateway } from './auth-gateway';
import { AuthSession } from './auth-session';
import { AuthStore } from './auth.store';

/**
 * Adds the Firebase ID token to every call to the Lavrel API, and handles the backend's auth errors for a
 * signed-in person:
 * 1. A 401, or a 403 email_not_verified, is first sent again once with a fresh token: a stale token is the
 *    usual cause, and then nobody notices. The retry goes on down the chain, not through this interceptor
 *    again, so it can't loop.
 * 2. No fresh token (Firebase can't renew the session) → the session ends: welcome, "session expired".
 * 3. Still 401 → the session ends: welcome, "signed out".
 * 4. Still 403 email_not_verified → the account is marked unverified, then the verify page opens.
 * Ending the session and marking the account change the auth state the guards read, so they don't send the
 * person straight back. Guests (no token) are left alone: the page shows its own error.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const env = inject(APP_ENV);
  if (!req.url.startsWith(`${env.apiBaseUrl}/api/`)) return next(req);

  const gateway = inject(AuthGateway);
  const router = inject(Router);
  const store = inject(AuthStore);
  const session = inject(AuthSession);

  const send = (token: string | null) =>
    next(token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req);

  const giveUp = (error: unknown) => {
    if (!(error instanceof HttpErrorResponse)) return;
    if (error.status === 401) void session.endSession('signed_out');
    if (isNotVerified(error)) {
      const user = store.user();
      if (user?.emailVerified) store.set({ ...user, emailVerified: false });
      void router.navigateByUrl('/verify-email');
    }
  };

  return from(gateway.idToken()).pipe(
    switchMap((token) =>
      send(token).pipe(
        catchError((error: unknown) => {
          if (!token || !isAuthFailure(error)) return throwError(() => error);
          return from(gateway.idToken(true).catch(() => null)).pipe(
            switchMap((fresh) => {
              if (!fresh) {
                void session.endSession('session_expired');
                return throwError(() => error);
              }
              return send(fresh).pipe(
                catchError((second: unknown) => {
                  giveUp(second);
                  return throwError(() => second);
                }),
              );
            }),
          );
        }),
      ),
    ),
  );
};

function isNotVerified(error: HttpErrorResponse): boolean {
  return error.status === 403 && error.error?.error === 'email_not_verified';
}

function isAuthFailure(error: unknown): boolean {
  return error instanceof HttpErrorResponse && (error.status === 401 || isNotVerified(error));
}
