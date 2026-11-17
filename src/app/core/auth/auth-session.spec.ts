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

  describe('endSession', () => {
    it('signs out, clears the state and opens welcome with the reason', async () => {
      signInAs(memberUser());
      TestBed.inject(GuestMode).enable();
      const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);

      await TestBed.inject(AuthSession).endSession('signed_out');

      expect(fakeGateway().signOut).toHaveBeenCalled();
      expect(TestBed.inject(AuthStore).user()).toBeNull();
      expect(TestBed.inject(GuestMode).active()).toBe(false);
      expect(navigate).toHaveBeenCalledWith('/welcome?reason=signed_out');
    });

    it('signs out once when several calls end the session together', async () => {
      signInAs(memberUser());
      const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
      const session = TestBed.inject(AuthSession);

      await Promise.all([
        session.endSession('signed_out'),
        session.endSession('signed_out'),
        session.endSession('session_expired'),
      ]);

      expect(fakeGateway().signOut).toHaveBeenCalledTimes(1);
      expect(navigate).toHaveBeenCalledTimes(1);
    });

    it('can end a later session again', async () => {
      vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
      const session = TestBed.inject(AuthSession);
      await session.endSession('signed_out');
      await session.endSession('session_expired');
      expect(fakeGateway().signOut).toHaveBeenCalledTimes(2);
    });

    it('still clears the state and opens welcome when Firebase fails to sign out', async () => {
      signInAs(memberUser());
      fakeGateway().signOut.mockRejectedValueOnce(new Error('offline'));
      const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);

      await TestBed.inject(AuthSession).endSession('session_expired');

      expect(TestBed.inject(AuthStore).user()).toBeNull();
      expect(navigate).toHaveBeenCalledWith('/welcome?reason=session_expired');
    });
  });
});
