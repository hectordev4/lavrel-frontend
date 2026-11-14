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
});
