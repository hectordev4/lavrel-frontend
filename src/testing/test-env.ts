import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { EnvironmentProviders, Provider } from '@angular/core';
import { provideRouter } from '@angular/router';
import { AppEnv } from '../app/core/config/app-env.model';
import { APP_ENV } from '../app/core/config/app-env.token';
import { AuthUser } from '../app/core/auth/models/auth-user.model';

/** Environment for tests: same-origin API, placeholder Firebase config. */
export const TEST_ENV: AppEnv = {
  production: false,
  apiBaseUrl: '',
  firebase: { apiKey: 'test', authDomain: 'test.firebaseapp.com', projectId: 'test', appId: 'test' },
};

/** HTTP (with HttpTestingController), an empty router and the test environment. */
export function testProviders(...extra: (Provider | EnvironmentProviders)[]): (Provider | EnvironmentProviders)[] {
  return [
    provideHttpClient(withInterceptors([])),
    provideHttpClientTesting(),
    provideRouter([]),
    { provide: APP_ENV, useValue: TEST_ENV },
    ...extra,
  ];
}

export function memberUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return { uid: 'u1', email: 'player@example.com', emailVerified: true, provider: 'password', ...overrides };
}

export function unverifiedUser(): AuthUser {
  return memberUser({ emailVerified: false });
}
