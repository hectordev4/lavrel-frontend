import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { fakeAuthProvider, signInAs } from '../../../testing/auth-testing';
import { memberUser, testProviders } from '../../../testing/test-env';
import { FirstSetup } from './first-setup';

const settle = () => new Promise((resolve) => setTimeout(resolve));

describe('FirstSetup', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: testProviders(fakeAuthProvider) });
    signInAs(memberUser());
  });

  it('follows the backend flag', () => {
    const setup = TestBed.inject(FirstSetup);
    expect(setup.neededFor({ setupCompleted: false })).toBe(true);
    expect(setup.neededFor({ setupCompleted: true })).toBe(false);
    expect(setup.neededFor({})).toBe(false);
  });

  it('tells the backend when it is done, and stops offering it', async () => {
    const setup = TestBed.inject(FirstSetup);
    const done = setup.complete();
    const req = TestBed.inject(HttpTestingController).expectOne('/api/currentuser/setup');
    expect(req.request.method).toBe('PUT');
    req.flush(null, { status: 204, statusText: 'No Content' });
    await done;
    expect(setup.neededFor({ setupCompleted: false })).toBe(false);
  });

  it('lets the person go on if the backend call fails, without offering it again this session', async () => {
    const setup = TestBed.inject(FirstSetup);
    const done = setup.complete();
    await settle();
    TestBed.inject(HttpTestingController)
      .expectOne('/api/currentuser/setup')
      .flush(null, { status: 500, statusText: 'x' });
    await expect(done).resolves.toBeUndefined();
    expect(setup.neededFor({ setupCompleted: false })).toBe(false);
  });
});
