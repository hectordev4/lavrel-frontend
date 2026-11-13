import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { testProviders } from '../../../../testing/test-env';
import { emptyFilters } from './search-query';
import { SearchResults } from './search-results';

const game = (id: number) => ({ id, title: `G${id}` });

describe('SearchResults', () => {
  it('loads the first page, then appends the next one', () => {
    TestBed.configureTestingModule({ providers: testProviders(SearchResults) });
    const results = TestBed.inject(SearchResults);
    const http = TestBed.inject(HttpTestingController);

    results.load(emptyFilters('doom'));
    http
      .expectOne((r) => r.params.get('page') === '0')
      .flush({ games: [game(1)], page: 0, size: 20, hasMore: true });
    results.loadMore();
    http
      .expectOne((r) => r.params.get('page') === '1')
      .flush({ games: [game(2)], page: 1, size: 20, hasMore: false });

    const s = results.state();
    expect(s.kind === 'ready' && s.games.map((g) => g.id)).toEqual([1, 2]);
    expect(s.kind === 'ready' && s.hasMore).toBe(false);
  });

  it('keeps the list when a further page fails', () => {
    TestBed.configureTestingModule({ providers: testProviders(SearchResults) });
    const results = TestBed.inject(SearchResults);
    const http = TestBed.inject(HttpTestingController);
    results.load(emptyFilters());
    http.expectOne(() => true).flush({ games: [game(1)], page: 0, size: 20, hasMore: true });
    results.loadMore();
    http.expectOne(() => true).flush(null, { status: 500, statusText: 'x' });
    const s = results.state();
    expect(s.kind === 'ready' && s.games.length).toBe(1);
    expect(s.kind === 'ready' && s.moreError).toContain('Search didn’t work');
  });
});

describe('SearchResults, a new search while one is loading', () => {
  it('cancels the older request', () => {
    TestBed.configureTestingModule({ providers: testProviders(SearchResults) });
    const results = TestBed.inject(SearchResults);
    const http = TestBed.inject(HttpTestingController);
    results.load(emptyFilters('doom'));
    const first = http.expectOne((r) => r.params.get('q') === 'doom');
    results.load(emptyFilters('hades'));
    expect(first.cancelled).toBe(true);
    http
      .expectOne((r) => r.params.get('q') === 'hades')
      .flush({ games: [], page: 0, size: 20, hasMore: false });
    expect(results.state().kind).toBe('ready');
  });
});
