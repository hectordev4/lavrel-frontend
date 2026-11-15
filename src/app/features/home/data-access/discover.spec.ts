import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { testProviders } from '../../../../testing/test-env';
import { Discover } from './discover';

describe('Discover', () => {
  it('asks for the 5 most popular and 8 newest games', () => {
    TestBed.configureTestingModule({ providers: testProviders(Discover) });
    TestBed.inject(Discover).loadAll();
    const http = TestBed.inject(HttpTestingController);
    const popular = http.expectOne((r) => r.params.get('sort') === 'popular');
    const newest = http.expectOne((r) => r.params.get('sort') === 'newest');
    expect(popular.request.params.get('size')).toBe('5');
    expect(newest.request.params.get('size')).toBe('8');
    popular.flush(null, { status: 0, statusText: 'offline' });
    expect(TestBed.inject(Discover).popular()).toEqual({
      kind: 'error',
      message: expect.stringContaining('connection'),
    });
  });
});
