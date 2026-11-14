import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { testProviders } from '../../../testing/test-env';
import { GameCatalogApi } from './game-catalog.api';

describe('GameCatalogApi', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: testProviders() }));

  it('sends every filter, repeating tags and modes, and leaves empty ones out', () => {
    TestBed.inject(GameCatalogApi)
      .search({
        q: '  rogue ',
        tags: [1, 2],
        franchise: 5,
        modes: ['co-op', 'multiplayer'],
        system: 'PC',
        sort: 'rating',
        page: 2,
        size: 20,
      })
      .subscribe();
    const req = TestBed.inject(HttpTestingController).expectOne((r) => r.url === '/api/games');
    const p = req.request.params;
    expect(p.get('q')).toBe('rogue');
    expect(p.getAll('tag')).toEqual(['1', '2']);
    expect(p.get('franchise')).toBe('5');
    expect(p.getAll('mode')).toEqual(['co-op', 'multiplayer']);
    expect(p.get('system')).toBe('PC');
    expect(p.get('sort')).toBe('rating');
    expect(p.get('page')).toBe('2');
    expect(p.has('developer')).toBe(false);
    req.flush({ games: [], page: 2, size: 20, hasMore: false });
  });
});
