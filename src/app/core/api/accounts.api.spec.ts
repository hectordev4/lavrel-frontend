import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { testProviders } from '../../../testing/test-env';
import { AccountsApi } from './accounts.api';
import { PlatformAccount } from './models/platform-account.model';

const steam: PlatformAccount = {
  platform: 'STEAM',
  externalId: '7656',
  displayName: 'Otter',
  lastSyncedAt: null,
};

describe('AccountsApi', () => {
  let api: AccountsApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: testProviders() });
    api = TestBed.inject(AccountsApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('unwraps {"accounts": [...]}', () => {
    let result: PlatformAccount[] = [];
    api.list().subscribe((a) => (result = a));
    http.expectOne('/api/currentuser/accounts').flush({ accounts: [steam] });
    expect(result).toEqual([steam]);
  });

  it('asks for the Steam login address', () => {
    let url = '';
    api.linkUrl('STEAM').subscribe((u) => (url = u));
    const req = http.expectOne('/api/currentuser/accounts/steam/link');
    expect(req.request.method).toBe('POST');
    req.flush({ redirectUrl: 'https://steamcommunity.com/openid/login?x' });
    expect(url).toContain('steamcommunity.com');
  });

  it('syncs and unlinks by platform and external id', () => {
    api.sync(steam).subscribe();
    http
      .expectOne('/api/currentuser/accounts/steam/7656/sync')
      .flush({ gamesSynced: 1, gamesSkipped: 0, unlocksRecorded: 0, gamesPending: 0 });
    api.unlink(steam).subscribe();
    const del = http.expectOne('/api/currentuser/accounts/steam/7656');
    expect(del.request.method).toBe('DELETE');
    del.flush(null);
  });

  it('reads and changes automatic sync', () => {
    let enabled: boolean | null = null;
    api.setAutoSync(false).subscribe((e) => (enabled = e));
    const req = http.expectOne('/api/currentuser/auto-sync');
    expect(req.request.body).toEqual({ enabled: false });
    req.flush({ enabled: false });
    expect(enabled).toBe(false);
  });
});
