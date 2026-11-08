import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { fakeAuthProvider, signInAs } from '../../../../../testing/auth-testing';
import { memberUser, testProviders } from '../../../../../testing/test-env';
import { HomePage } from './home.page';

describe('HomePage (members)', () => {
  it('greets by name and, without Steam, offers Connect Steam', async () => {
    TestBed.configureTestingModule({ providers: testProviders(fakeAuthProvider) });
    signInAs(memberUser());
    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);

    http.expectOne('/api/currentuser').flush({ username: 'SwiftOtter' });
    fixture.detectChanges();
    TestBed.tick();
    http.expectOne('/api/currentuser/accounts').flush({ accounts: [] });
    http.expectOne('/api/currentuser/tracked').flush({ games: [] });
    http.match(() => true).forEach((r) => r.flush(r.request.url.includes('stats') ? null : { games: [], achievements: [], page: 0, size: 5, hasMore: false }));
    await fixture.whenStable();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h1')!.textContent).toBe('SwiftOtter');
    expect(el.textContent).toContain('Connect your Steam account');
    expect(el.textContent).toContain('Nothing pinned yet');
  });
});
