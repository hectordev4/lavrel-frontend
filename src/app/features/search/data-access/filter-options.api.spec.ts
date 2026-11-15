import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { testProviders } from '../../../../testing/test-env';
import { FilterOptionsApi } from './filter-options.api';

describe('FilterOptionsApi', () => {
  it('asks for creators by role in lowercase and unwraps them', () => {
    TestBed.configureTestingModule({ providers: testProviders() });
    let names: string[] = [];
    TestBed.inject(FilterOptionsApi)
      .creators('DEVELOPER', 'val')
      .subscribe((c) => (names = c.map((x) => x.name)));
    const req = TestBed.inject(HttpTestingController).expectOne((r) => r.url === '/api/creators');
    expect(req.request.params.get('role')).toBe('developer');
    expect(req.request.params.get('q')).toBe('val');
    req.flush({ creators: [{ id: 1, name: 'Valve', role: 'DEVELOPER', gameCount: 12 }] });
    expect(names).toEqual(['Valve']);
  });
});
