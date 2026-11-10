import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { testProviders } from '../../../../testing/test-env';
import { MemberOverview } from './member-overview';

describe('MemberOverview', () => {
  it('loads totals and the 3 latest unlocks independently', () => {
    TestBed.configureTestingModule({ providers: testProviders(MemberOverview) });
    const overview = TestBed.inject(MemberOverview);
    const http = TestBed.inject(HttpTestingController);
    overview.load();
    http.expectOne('/api/currentuser/stats').flush(null, { status: 500, statusText: 'x' });
    const recent = http.expectOne((r) => r.url === '/api/currentuser/achievements/recent');
    expect(recent.request.params.get('limit')).toBe('3');
    recent.flush({ achievements: [] });
    expect(overview.statsFailed()).toBe(true);
    expect(overview.recent()).toEqual([]);
  });
});
