import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { AuthGateway } from './core/auth/auth-gateway';
import { FirebaseAuthGateway } from './core/auth/firebase-auth.gateway';
import { APP_ENV } from './core/config/app-env';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    { provide: APP_ENV, useValue: environment },
    { provide: AuthGateway, useClass: FirebaseAuthGateway },
  ],
};
