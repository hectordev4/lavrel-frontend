import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { testProviders } from '../../../../testing/test-env';
import { SearchSuggestions } from './search-suggestions';

describe('SearchSuggestions', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({ providers: testProviders(SearchSuggestions) });
  });
  afterEach(() => vi.useRealTimers());

  it('waits for a pause, then asks once for the last text', () => {
    const suggestions = TestBed.inject(SearchSuggestions);
    const http = TestBed.inject(HttpTestingController);
    suggestions.type('ro');
    suggestions.type('rog');
    vi.advanceTimersByTime(250);
    expect(suggestions.state().kind).toBe('loading');
    http
      .expectOne((r) => r.url === '/api/search' && r.params.get('q') === 'rog')
      .flush({ games: [], tags: [], franchises: [] });
    expect(suggestions.state()).toEqual({
      kind: 'ready',
      query: 'rog',
      results: { games: [], tags: [], franchises: [] },
    });
    http.verify();
  });

  it('stays idle under 2 characters', () => {
    const suggestions = TestBed.inject(SearchSuggestions);
    suggestions.type('r');
    vi.advanceTimersByTime(300);
    expect(suggestions.state().kind).toBe('idle');
    TestBed.inject(HttpTestingController).expectNone(() => true);
  });
});
