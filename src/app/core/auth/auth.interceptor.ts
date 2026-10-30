import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { APP_ENV } from '../config/app-env';
import { AuthGateway } from './auth-gateway';

/**
 * Adds the Firebase ID token to every call to the Lavrel API, and reacts to the
 * backend's auth errors: 401 → back to welcome, 403 email_not_verified → verify page.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const env = inject(APP_ENV);
  if (!req.url.startsWith(`${env.apiBaseUrl}/api/`)) return next(req);

  const gateway = inject(AuthGateway);
  const router = inject(Router);

  return from(gateway.idToken()).pipe(
    switchMap((token) => next(token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req)),
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401) void router.navigateByUrl('/welcome');
        if (error.status === 403 && error.error?.error === 'email_not_verified') void router.navigateByUrl('/verify-email');
      }
      return throwError(() => error);
    }),
  );
};
