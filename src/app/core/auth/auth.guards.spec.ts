import { EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CanMatchFn, Router, UrlTree } from '@angular/router';
import { fakeAuthProvider, signInAs } from '../../../testing/auth-testing';
import { memberUser, testProviders, unverifiedUser } from '../../../testing/test-env';
import { browseGuard, entryGuard, guestGuard, memberGuard, signedOutGuard, unverifiedGuard } from './auth.guards';
import { GuestMode } from './guest-mode';
import { AuthUser } from './models/auth-user.model';

async function run(guard: CanMatchFn): Promise<string | boolean> {
  const result: unknown = await runInInjectionContext(TestBed.inject(EnvironmentInjector), () =>
    (guard as (...args: unknown[]) => unknown)({}, []),
  );
  return result instanceof UrlTree ? TestBed.inject(Router).serializeUrl(result) : (result as boolean);
}

describe('auth guards', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: testProviders(fakeAuthProvider) });
  });

  const as = (user: AuthUser | null) => signInAs(user);

  it('entry sends signed-out visitors to welcome, or home after Skip for now', async () => {
    as(null);
    expect(await run(entryGuard)).toBe('/welcome');
    TestBed.inject(GuestMode).enable();
    expect(await run(entryGuard)).toBe('/home');
  });

  it('entry sends unverified accounts to verify-email and members home', async () => {
    as(unverifiedUser());
    expect(await run(entryGuard)).toBe('/verify-email');
    as(memberUser());
    expect(await run(entryGuard)).toBe('/home');
  });

  it('auth pages are only for signed-out visitors', async () => {
    as(null);
    expect(await run(signedOutGuard)).toBe(true);
    as(memberUser());
    expect(await run(signedOutGuard)).toBe('/home');
  });

  it('verify-email is only for unverified accounts', async () => {
    as(unverifiedUser());
    expect(await run(unverifiedGuard)).toBe(true);
    as(null);
    expect(await run(unverifiedGuard)).toBe('/welcome');
  });

  it('member pages let guests fall through and send unverified to verify-email', async () => {
    as(memberUser());
    expect(await run(memberGuard)).toBe(true);
    as(null);
    expect(await run(memberGuard)).toBe(false);
    as(unverifiedUser());
    expect(await run(memberGuard)).toBe('/verify-email');
  });

  it('guest pages match only signed-out visitors', async () => {
    as(null);
    expect(await run(guestGuard)).toBe(true);
    as(memberUser());
    expect(await run(guestGuard)).toBe(false);
  });

  it('browse pages are open to everyone verified or signed out', async () => {
    as(null);
    expect(await run(browseGuard)).toBe(true);
    as(memberUser());
    expect(await run(browseGuard)).toBe(true);
    as(unverifiedUser());
    expect(await run(browseGuard)).toBe('/verify-email');
  });
});
