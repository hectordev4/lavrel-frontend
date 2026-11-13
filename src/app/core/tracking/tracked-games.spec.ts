import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { fakeAuthProvider, signInAs } from '../../../testing/auth-testing';
import { memberUser, testProviders } from '../../../testing/test-env';
import { TrackedGame } from '../api/models/tracked-game.model';
import { MAX_PINNED, TrackedGames } from './tracked-games';

function card(gameId: number, pinPosition: number | null = null): TrackedGame {
  return {
    gameId,
    title: `Game ${gameId}`,
    slug: `game-${gameId}`,
    coverImageUrl: null,
    releaseDate: null,
    status: 'PLAYING',
    pinPosition,
    unlocked: 0,
    total: 10,
    nextAchievements: [],
    addedAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };
}

describe('TrackedGames', () => {
  let store: TrackedGames;
  let http: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: testProviders(fakeAuthProvider) });
    signInAs(memberUser());
    store = TestBed.inject(TrackedGames);
    http = TestBed.inject(HttpTestingController);
    const loading = store.reload();
    http.expectOne('/api/currentuser/tracked').flush({ games: [card(1, 1), card(2, 2), card(3)] });
    await loading;
  });

  afterEach(() => http.verify());

  it('loads the list and the pinned games in order', () => {
    expect(store.loadState()).toBe('ready');
    expect(store.pinned().map((g) => g.gameId)).toEqual([1, 2]);
    expect(store.byGameId().get(3)?.title).toBe('Game 3');
  });

  it('adds a newly tracked game', async () => {
    const done = store.track(4, 'BACKLOG');
    await Promise.resolve();
    http.expectOne('/api/currentuser/tracked/4').flush({ ...card(4), status: 'BACKLOG' });
    expect(await done).toBeNull();
    expect(store.byGameId().get(4)?.status).toBe('BACKLOG');
  });

  it('renumbers the pins after untracking a pinned game', async () => {
    const done = store.untrack(1);
    await Promise.resolve();
    http.expectOne('/api/currentuser/tracked/1').flush(null);
    await done;
    expect(store.pinned().map((g) => [g.gameId, g.pinPosition])).toEqual([[2, 1]]);
  });

  it('stops a pin past the limit before calling the backend', async () => {
    const many = Array.from({ length: MAX_PINNED }, (_, i) => card(100 + i, i + 1));
    const loading = store.reload();
    http.expectOne('/api/currentuser/tracked').flush({ games: many });
    await loading;
    expect(await store.pin(999)).toContain('20 pinned games');
    http.expectNone('/api/currentuser/tracked/999/pin');
  });

  it('returns a message when the backend refuses', async () => {
    const done = store.pin(3);
    await Promise.resolve();
    http.expectOne('/api/currentuser/tracked/3/pin').flush({ error: 'quick_access_full' }, { status: 409, statusText: 'Conflict' });
    expect(await done).toContain('20 pinned games');
  });

  it('clears everything on sign-out', () => {
    signInAs(null);
    expect(store.games()).toEqual([]);
    expect(store.loadState()).toBe('idle');
  });
});

describe('TrackedGames overlapping reloads', () => {
  it('keeps the newest answer when an older reload finishes last', async () => {
    TestBed.configureTestingModule({ providers: testProviders(fakeAuthProvider) });
    signInAs(memberUser());
    const store = TestBed.inject(TrackedGames);
    const http = TestBed.inject(HttpTestingController);
    const older = store.reload();
    const newer = store.reload();
    const [oldReq, newReq] = http.match('/api/currentuser/tracked');
    newReq.flush({ games: [card(2)] });
    await newer;
    oldReq.flush({ games: [card(1)] });
    await older;
    expect(store.games().map((g) => g.gameId)).toEqual([2]);
  });
});
