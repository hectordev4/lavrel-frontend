import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { fakeAuthProvider, fakeGateway, signInAs } from '../../../../testing/auth-testing';
import { memberUser, testProviders } from '../../../../testing/test-env';
import { MyAccount } from './my-account';

const settle = () => new Promise((resolve) => setTimeout(resolve));

describe('MyAccount', () => {
  let account: MyAccount;
  let http: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: testProviders(fakeAuthProvider, MyAccount) });
    signInAs(memberUser());
    account = TestBed.inject(MyAccount);
    http = TestBed.inject(HttpTestingController);
    const loading = account.load();
    http
      .expectOne('/api/currentuser')
      .flush({ username: 'SwiftOtter', countryId: 2, publicId: '4829103755210846' });
    http.expectOne('/api/countries').flush({ countries: [{ id: 2, code: 'ES', name: 'Spain' }] });
    await loading;
  });

  it('knows the country by its id', () => {
    expect(account.country()?.name).toBe('Spain');
  });

  it('renames with a trimmed name', async () => {
    const done = account.rename('  QuietMoth ');
    await settle();
    const req = http.expectOne('/api/currentuser/username');
    expect(req.request.body).toEqual({ username: 'QuietMoth' });
    req.flush(null);
    expect(await done).toBeNull();
    expect(account.user()?.username).toBe('QuietMoth');
  });

  it('deletes the account with confirm=true, then signs out', async () => {
    vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const done = account.deleteAccount();
    await settle();
    const req = http.expectOne((r) => r.url === '/api/currentuser' && r.method === 'DELETE');
    expect(req.request.params.get('confirm')).toBe('true');
    req.flush(null);
    expect(await done).toBeNull();
    expect(fakeGateway().signOut).toHaveBeenCalled();
  });
});
