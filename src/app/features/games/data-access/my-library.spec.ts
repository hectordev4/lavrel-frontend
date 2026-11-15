import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { libraryGame } from '../../../../testing/fixtures';
import { testProviders } from '../../../../testing/test-env';
import { MyLibrary } from './my-library';

describe('MyLibrary', () => {
  it('reloads from page 0 when the query changes, and only sends names of 2+ characters', () => {
    TestBed.configureTestingModule({ providers: testProviders(MyLibrary) });
    const library = TestBed.inject(MyLibrary);
    const http = TestBed.inject(HttpTestingController);

    library.setQuery({ q: 'd', sort: 'playtime', collection: 'c1' });
    const req = http.expectOne((r) => r.url === '/api/currentuser/games');
    expect(req.request.params.has('q')).toBe(false);
    expect(req.request.params.get('sort')).toBe('playtime');
    expect(req.request.params.get('collection')).toBe('c1');
    expect(req.request.params.get('page')).toBe('0');
    req.flush({ games: [libraryGame(1)], page: 0, size: 48, hasMore: false });
    expect(library.state().kind).toBe('ready');
  });
});

describe('MyLibrary, a new query while one is loading', () => {
  it('cancels the older request', () => {
    TestBed.configureTestingModule({ providers: testProviders(MyLibrary) });
    const library = TestBed.inject(MyLibrary);
    const http = TestBed.inject(HttpTestingController);
    library.setQuery({ sort: 'name' });
    const first = http.expectOne((r) => r.params.get('sort') === 'name');
    library.setQuery({ sort: 'playtime' });
    expect(first.cancelled).toBe(true);
    http
      .expectOne((r) => r.params.get('sort') === 'playtime')
      .flush({ games: [], page: 0, size: 48, hasMore: false });
    expect(library.state().kind).toBe('ready');
  });
});
