import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthError } from '../../../core/auth/auth-error';
import { AuthStore } from '../../../core/auth/auth.store';
import { GuestMode } from '../../../core/auth/guest-mode';
import { fakeAuthProvider, fakeGateway } from '../../../../testing/auth-testing';
import { memberUser, testProviders, unverifiedUser } from '../../../../testing/test-env';
import { AuthFlow } from './auth-flow';

describe('AuthFlow', () => {
  let flow: AuthFlow;
  let navigate: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: testProviders(fakeAuthProvider) });
    flow = TestBed.inject(AuthFlow);
    navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
  });

  it('signs in with e-mail and goes home', async () => {
    await flow.signInWithEmail('a@b.c', 'secret123');
    expect(fakeGateway().signInWithEmail).toHaveBeenCalledWith('a@b.c', 'secret123');
    expect(TestBed.inject(AuthStore).user()).toEqual(memberUser());
    expect(navigate).toHaveBeenCalledWith('/home');
    expect(flow.busy()).toBeNull();
  });

  it('registers, sends the verification e-mail and goes to verify-email', async () => {
    await flow.register('new@b.c', 'secret123');
    expect(fakeGateway().sendVerificationEmail).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('/verify-email');
  });

  it('shows the message for a failure', async () => {
    fakeGateway().signInWithEmail.mockRejectedValue(new AuthError('invalid-credentials'));
    await flow.signInWithEmail('a@b.c', 'wrong');
    expect(flow.error()).toContain('don’t match');
  });

  it('keeps the person on verify-email while the e-mail is unconfirmed', async () => {
    fakeGateway().reloadUser.mockResolvedValue(unverifiedUser());
    await flow.checkVerified();
    expect(flow.error()).toContain('Not verified yet');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('remembers Skip for now and opens Home', async () => {
    await flow.browseWithoutAccount();
    expect(TestBed.inject(GuestMode).active()).toBe(true);
    expect(navigate).toHaveBeenCalledWith('/home');
  });

  it('answers a reset request the same way whether the account exists or not', async () => {
    await flow.sendPasswordReset('who@b.c');
    expect(flow.notice()).toBe('If who@b.c has a Lavrel account, a reset link is on its way.');
  });
});
