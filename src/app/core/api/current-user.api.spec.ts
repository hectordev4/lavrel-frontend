import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { testProviders } from '../../../testing/test-env';
import { CurrentUserApi } from './current-user.api';

describe('CurrentUserApi', () => {
  it('loads the signed-in user', () => {
    TestBed.configureTestingModule({ providers: testProviders() });
    let name = '';
    TestBed.inject(CurrentUserApi)
      .get()
      .subscribe((u) => (name = u.username ?? ''));
    TestBed.inject(HttpTestingController)
      .expectOne('/api/currentuser')
      .flush({ username: 'SwiftOtter' });
    expect(name).toBe('SwiftOtter');
  });

  it('marks the first setup as done', () => {
    TestBed.configureTestingModule({ providers: testProviders() });
    let done = false;
    TestBed.inject(CurrentUserApi)
      .completeSetup()
      .subscribe(() => (done = true));
    const req = TestBed.inject(HttpTestingController).expectOne('/api/currentuser/setup');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toBeNull();
    req.flush(null, { status: 204, statusText: 'No Content' });
    expect(done).toBe(true);
  });
});
