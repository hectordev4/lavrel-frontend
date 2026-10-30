import { InjectionToken } from '@angular/core';

export interface AppEnv {
  production: boolean;
  /** Base URL of the Lavrel API, without a trailing slash. Empty means same origin. */
  apiBaseUrl: string;
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    appId: string;
  };
}

export const APP_ENV = new InjectionToken<AppEnv>('APP_ENV');
