import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { testProviders } from '../../../testing/test-env';
import { LibraryApi } from './library.api';

describe('LibraryApi', () => {
  it('passes the sort, collection and paging', () => {
    TestBed.configureTestingModule({ providers: testProviders() });
    TestBed.inject(LibraryApi).list({ sort: 'progress', collection: 'abc', size: 48 }).subscribe();
    const req = TestBed.inject(HttpTestingController).expectOne(
      (r) => r.url === '/api/currentuser/games',
    );
    expect(req.request.params.get('sort')).toBe('progress');
    expect(req.request.params.get('collection')).toBe('abc');
    expect(req.request.params.get('size')).toBe('48');
    expect(req.request.params.has('q')).toBe(false);
    req.flush({ games: [], page: 0, size: 48, hasMore: false });
  });
});
