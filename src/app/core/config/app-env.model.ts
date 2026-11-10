/** Settings that differ per environment. Values live in src/environments. */
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
