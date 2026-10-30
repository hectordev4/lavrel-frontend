import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { AuthGateway } from './core/auth/auth-gateway';
import { authInterceptor } from './core/auth/auth.interceptor';
import { FirebaseAuthGateway } from './core/auth/firebase-auth.gateway';
import { APP_ENV } from './core/config/app-env';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    { provide: APP_ENV, useValue: environment },
    { provide: AuthGateway, useClass: FirebaseAuthGateway },
  ],
};
