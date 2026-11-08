import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { testProviders } from '../../../../testing/test-env';
import { PlayerSearch, normalize } from './player-search';

describe('PlayerSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({ providers: testProviders(PlayerSearch) });
  });
  afterEach(() => vi.useRealTimers());

  it('accepts a player id with its spaces', () => {
    expect(normalize(' 4829 1037 5521 0846 ')).toBe('4829103755210846');
    expect(normalize(' Swift Otter ')).toBe('Swift Otter');
  });

  it('searches after a pause, from 2 characters', () => {
    const search = TestBed.inject(PlayerSearch);
    const http = TestBed.inject(HttpTestingController);
    search.type('s');
    vi.advanceTimersByTime(300);
    expect(search.state().kind).toBe('idle');
    search.type('swi');
    vi.advanceTimersByTime(300);
    http
      .expectOne((r) => r.url === '/api/users' && r.params.get('q') === 'swi')
      .flush({ users: [{ publicId: '1', username: 'SwiftOtter', memberSince: null, country: null, platforms: null }] });
    const s = search.state();
    expect(s.kind === 'ready' && s.players.map((p) => p.username)).toEqual(['SwiftOtter']);
  });
});
