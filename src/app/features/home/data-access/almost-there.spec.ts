import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { libraryGame } from '../../../../testing/fixtures';
import { testProviders } from '../../../../testing/test-env';
import { AlmostThere } from './almost-there';

describe('AlmostThere', () => {
  it('keeps started games short of 100%, from the library sorted by progress', () => {
    TestBed.configureTestingModule({ providers: testProviders(AlmostThere) });
    const almost = TestBed.inject(AlmostThere);
    almost.load();
    const req = TestBed.inject(HttpTestingController).expectOne(
      (r) => r.url === '/api/currentuser/games',
    );
    expect(req.request.params.get('sort')).toBe('progress');
    req.flush({
      games: [
        libraryGame(1, { unlocked: 10, total: 10 }),
        libraryGame(2, { unlocked: 9, total: 10 }),
        libraryGame(3, { unlocked: 0, total: 10 }),
        libraryGame(4, { unlocked: 0, total: 0 }),
      ],
      page: 0,
      size: 48,
      hasMore: false,
    });
    const s = almost.state();
    expect(s.kind === 'ready' && s.games.map((g) => g.gameId)).toEqual([2]);
  });
});

describe('AlmostThere reloads', () => {
  it('cancels the earlier load when a new one starts', () => {
    TestBed.configureTestingModule({ providers: testProviders(AlmostThere) });
    const almost = TestBed.inject(AlmostThere);
    const http = TestBed.inject(HttpTestingController);
    almost.load();
    const first = http.expectOne((r) => r.url === '/api/currentuser/games');
    almost.load();
    expect(first.cancelled).toBe(true);
    http
      .expectOne((r) => r.url === '/api/currentuser/games')
      .flush({ games: [], page: 0, size: 48, hasMore: false });
    expect(almost.state().kind).toBe('ready');
  });
});
