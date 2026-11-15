import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { fakeAuthProvider, signInAs } from '../../../../testing/auth-testing';
import { libraryGame } from '../../../../testing/fixtures';
import { memberUser, testProviders } from '../../../../testing/test-env';
import { AlmostThereSection } from './almost-there/almost-there.section';
import { DiscoverSection } from './discover/discover.section';
import { RecentUnlocksSection } from './recent-unlocks/recent-unlocks.section';
import { StatsSection } from './stats/stats.section';
import { SyncSection } from './sync/sync.section';

const settle = () => new Promise((resolve) => setTimeout(resolve));

function setUp() {
  TestBed.configureTestingModule({ providers: testProviders(fakeAuthProvider) });
  signInAs(memberUser());
  return TestBed.inject(HttpTestingController);
}

describe('Home sections', () => {
  it('Sync shows the Steam line once Steam is linked', async () => {
    const http = setUp();
    const f = TestBed.createComponent(SyncSection);
    f.detectChanges();
    http
      .expectOne('/api/currentuser/accounts')
      .flush({
        accounts: [{ platform: 'STEAM', externalId: '1', displayName: null, lastSyncedAt: null }],
      });
    await settle();
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Steam · not synced yet');
    expect(f.nativeElement.textContent).toContain('Sync now');
  });

  it('Stats offers Try again after a failure, and loads again', async () => {
    const http = setUp();
    const f = TestBed.createComponent(StatsSection);
    f.detectChanges();
    TestBed.tick();
    http.expectOne('/api/currentuser/stats').flush(null, { status: 500, statusText: 'x' });
    f.detectChanges();
    (f.nativeElement.querySelector('.failed button') as HTMLButtonElement).click();
    http
      .expectOne('/api/currentuser/stats')
      .flush({ achievementsUnlocked: 3, averageCompletion: 10, perfectGames: 0, gamesOwned: 2 });
    f.detectChanges();
    expect(f.nativeElement.querySelector('app-stats-row')).not.toBeNull();
  });

  it('Almost there stays hidden without games close to 100%', () => {
    const http = setUp();
    const f = TestBed.createComponent(AlmostThereSection);
    f.detectChanges();
    TestBed.tick();
    http
      .expectOne((r) => r.url === '/api/currentuser/games')
      .flush({ games: [libraryGame(1, { unlocked: 0 })], page: 0, size: 48, hasMore: false });
    f.detectChanges();
    expect(f.nativeElement.querySelector('section')).toBeNull();
  });

  it('Recent unlocks shows its own error', () => {
    const http = setUp();
    const f = TestBed.createComponent(RecentUnlocksSection);
    f.detectChanges();
    TestBed.tick();
    http
      .expectOne((r) => r.url === '/api/currentuser/achievements/recent')
      .flush(null, { status: 503, statusText: 'x' });
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Your recent unlocks didn’t load.');
  });

  it('Discover lists popular games', () => {
    const http = setUp();
    const f = TestBed.createComponent(DiscoverSection);
    f.detectChanges();
    http
      .expectOne((r) => r.params.get('sort') === 'popular')
      .flush({
        games: [{ id: 1, title: 'Popular One', slug: 'popular-one', topTags: [], modes: null }],
        page: 0,
        size: 5,
        hasMore: false,
      });
    http
      .expectOne((r) => r.params.get('sort') === 'newest')
      .flush({ games: [], page: 0, size: 8, hasMore: false });
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Popular One');
  });
});
