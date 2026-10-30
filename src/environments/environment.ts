import { AppEnv } from '../app/core/config/app-env';

/** Production build. Fill in the real values before deploying. */
export const environment: AppEnv = {
  production: true,
  // Where the Spring Boot API lives in production, without a trailing slash.
  apiBaseUrl: 'https://api.lavrel.example',
  // Firebase console → Project settings → Your apps → Web app config. None of these are secrets.
  firebase: {
    apiKey: 'REPLACE_ME',
    authDomain: 'REPLACE_ME.firebaseapp.com',
    projectId: 'REPLACE_ME',
    appId: 'REPLACE_ME',
  },
};
