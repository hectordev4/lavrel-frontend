import { AppEnv } from '../app/core/config/app-env';

/**
 * `ng serve` uses this file. apiBaseUrl stays empty so calls go to /api on the dev server,
 * which proxies them to Spring Boot on :8080 (see proxy.conf.json). No CORS setup needed.
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
