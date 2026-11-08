import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { fakeAuthProvider, fakeGateway, signInAs } from '../../../testing/auth-testing';
import { memberUser, testProviders } from '../../../testing/test-env';
import { AuthSession } from './auth-session';
import { AuthStore } from './auth.store';
import { GuestMode } from './guest-mode';

describe('AuthSession', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: testProviders(fakeAuthProvider) }));

  it('signs out, clears the user and guest mode, and goes to welcome', async () => {
    signInAs(memberUser());
    TestBed.inject(GuestMode).enable();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);

    await TestBed.inject(AuthSession).signOut();

    expect(fakeGateway().signOut).toHaveBeenCalled();
    expect(TestBed.inject(AuthStore).user()).toBeNull();
    expect(TestBed.inject(GuestMode).active()).toBe(false);
    expect(navigate).toHaveBeenCalledWith('/welcome');
  });
});
