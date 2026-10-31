import { AppEnv } from '../app/core/config/app-env.model';

/**
 * Template. Copy it to environment.ts and environment.development.ts and fill in the values:
 *   cp src/environments/environment.example.ts src/environments/environment.ts
 *   cp src/environments/environment.example.ts src/environments/environment.development.ts
 * Both copies are git-ignored.
 */
export const environment: AppEnv = {
  production: false,
  apiBaseUrl: '',
  firebase: {
    apiKey: 'REPLACE_ME',
    authDomain: 'REPLACE_ME.firebaseapp.com',
    projectId: 'REPLACE_ME',
    appId: 'REPLACE_ME',
  },
};
