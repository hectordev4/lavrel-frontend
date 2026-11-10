import { InjectionToken } from '@angular/core';
import { AppEnv } from './app-env.model';

/** Inject this instead of importing an environment file, so tests can provide their own values. */
export const APP_ENV = new InjectionToken<AppEnv>('APP_ENV');
