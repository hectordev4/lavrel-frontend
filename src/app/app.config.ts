import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  ErrorHandler,
  isDevMode,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { AuthGateway } from './core/auth/auth-gateway';
import { authInterceptor } from './core/auth/auth.interceptor';
import { FirebaseAuthGateway } from './core/auth/firebase-auth.gateway';
import { APP_ENV } from './core/config/app-env.token';
import { AppErrorHandler } from './core/errors/app-error-handler';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: ErrorHandler, useClass: AppErrorHandler },
    // Installable app: caches the app's own files so it opens fast and offline; API answers are never cached.
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    { provide: APP_ENV, useValue: environment },
    { provide: AuthGateway, useClass: FirebaseAuthGateway },
  ],
};
