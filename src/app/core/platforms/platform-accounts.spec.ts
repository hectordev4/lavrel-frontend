import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { fakeAuthProvider, signInAs } from '../../../testing/auth-testing';
import { memberUser, testProviders } from '../../../testing/test-env';
import { PlatformAccount } from '../api/models/platform-account.model';
import { PlatformAccounts } from './platform-accounts';

const steam: PlatformAccount = { platform: 'STEAM', externalId: '7656', displayName: 'Otter', lastSyncedAt: null };

/** Lets pending promise callbacks (and the HTTP calls they start) run. */
const settle = () => new Promise((resolve) => setTimeout(resolve));

describe('PlatformAccounts', () => {
  let accounts: PlatformAccounts;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: testProviders(fakeAuthProvider) });
    signInAs(memberUser());
    accounts = TestBed.inject(PlatformAccounts);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('finds the Steam account after loading', async () => {
    const loading = accounts.reload();
    http.expectOne('/api/currentuser/accounts').flush({ accounts: [steam] });
    await loading;
    expect(accounts.steam()).toEqual(steam);
  });

  it('syncs again while games are pending, then reloads and bumps syncVersion', async () => {
    const done = accounts.sync(steam);
    await settle();
    http.expectOne('/api/currentuser/accounts/steam/7656/sync').flush({ gamesSynced: 50, gamesSkipped: 0, unlocksRecorded: 0, gamesPending: 30 });
    await settle();
    expect(accounts.syncing()).toEqual({ gamesSynced: 50, gamesPending: 30 });
    http.expectOne('/api/currentuser/accounts/steam/7656/sync').flush({ gamesSynced: 80, gamesSkipped: 0, unlocksRecorded: 0, gamesPending: 0 });
    await settle();
    http.expectOne('/api/currentuser/accounts').flush({ accounts: [{ ...steam, lastSyncedAt: '2026-11-01T00:00:00Z' }] });
    http.expectOne('/api/currentuser/tracked').flush({ games: [] });
    expect(await done).toBe(true);
    expect(accounts.syncing()).toBeNull();
    expect(accounts.syncVersion()).toBe(1);
  });

  it('explains a failed sync', async () => {
    const done = accounts.sync(steam);
    await settle();
    http.expectOne('/api/currentuser/accounts/steam/7656/sync').flush({ error: 'profile_private' }, { status: 422, statusText: 'x' });
    expect(await done).toBe(false);
    expect(accounts.message()).toContain('privacy settings');
  });
});

describe('PlatformAccounts.connect', () => {
  it('syncs instead of starting a Steam login when Steam is already linked to you', async () => {
    TestBed.configureTestingModule({ providers: testProviders(fakeAuthProvider) });
    signInAs(memberUser());
    const accounts = TestBed.inject(PlatformAccounts);
    const http = TestBed.inject(HttpTestingController);
    const done = accounts.connect('STEAM');
    await settle();
    http.expectOne('/api/currentuser/accounts').flush({ accounts: [steam] });
    await settle();
    http.expectNone('/api/currentuser/accounts/steam/link');
    http.expectOne('/api/currentuser/accounts/steam/7656/sync').flush({ gamesSynced: 1, gamesSkipped: 0, unlocksRecorded: 0, gamesPending: 0 });
    await settle();
    http.match(() => true).forEach((r) => r.flush(r.request.url.endsWith('tracked') ? { games: [] } : { accounts: [steam] }));
    await done;
  });
});
