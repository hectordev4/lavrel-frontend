import { TestBed } from '@angular/core/testing';
import { fakeAuthProvider, fakeGateway } from '../../../testing/auth-testing';
import { memberUser, unverifiedUser } from '../../../testing/test-env';
import { AuthStore } from './auth.store';

describe('AuthStore', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [fakeAuthProvider] }));

  it('is unknown until the gateway reports, then ready() resolves', async () => {
    const store = TestBed.inject(AuthStore);
    expect(store.status()).toBe('unknown');
    fakeGateway().state.next(memberUser());
    await expect(store.ready()).resolves.toEqual(memberUser());
    expect(store.status()).toBe('signed-in');
    expect(store.isVerified()).toBe(true);
  });

  it('knows an unverified account is not verified', () => {
    const store = TestBed.inject(AuthStore);
    fakeGateway().state.next(unverifiedUser());
    expect(store.isVerified()).toBe(false);
  });

  it('goes signed-out when the user leaves', () => {
    const store = TestBed.inject(AuthStore);
    fakeGateway().state.next(memberUser());
    fakeGateway().state.next(null);
    expect(store.status()).toBe('signed-out');
    expect(store.user()).toBeNull();
  });
});
