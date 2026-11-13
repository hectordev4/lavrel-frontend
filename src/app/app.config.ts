import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, ErrorHandler, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { AuthGateway } from './core/auth/auth-gateway';
import { authInterceptor } from './core/auth/auth.interceptor';
import { FirebaseAuthGateway } from './core/auth/firebase-auth.gateway';
import { APP_ENV } from './core/config/app-env.token';
import { AppErrorHandler } from './core/errors/app-error-handler';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: ErrorHandler, useClass: AppErrorHandler },
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    { provide: APP_ENV, useValue: environment },
    { provide: AuthGateway, useClass: FirebaseAuthGateway },
  ],
};
