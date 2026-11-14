import { TestBed } from '@angular/core/testing';
import { fakeAuthProvider, signInAs } from '../../../testing/auth-testing';
import { memberUser, testProviders } from '../../../testing/test-env';
import { FirstSetup } from './first-setup';

describe('FirstSetup', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: testProviders(fakeAuthProvider) });
  });

  it('is offered to a new account until it is done', () => {
    signInAs(memberUser({ createdAt: new Date().toISOString() }));
    const setup = TestBed.inject(FirstSetup);
    expect(setup.needed()).toBe(true);
    setup.markDone();
    expect(setup.needed()).toBe(false);
    expect(localStorage.getItem('lavrel.first-setup-done.u1')).toBe('true');
  });

  it('is never offered to an older account', () => {
    signInAs(memberUser({ createdAt: '2025-01-01T00:00:00Z' }));
    expect(TestBed.inject(FirstSetup).needed()).toBe(false);
  });
});
