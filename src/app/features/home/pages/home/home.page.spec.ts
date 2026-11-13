import { installIntersectionObserverStandIn } from '../../../../../testing/intersection-observer';
import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { fakeAuthProvider, signInAs } from '../../../../../testing/auth-testing';
import { memberUser, testProviders } from '../../../../../testing/test-env';
import { HomePage } from './home.page';

const settle = () => new Promise((resolve) => setTimeout(resolve));

async function render() {
  TestBed.configureTestingModule({ providers: testProviders(fakeAuthProvider) });
  signInAs(memberUser());
  const fixture = TestBed.createComponent(HomePage);
  fixture.detectChanges();
  const http = TestBed.inject(HttpTestingController);
  http.expectOne('/api/currentuser').flush({ username: 'SwiftOtter' });
  await settle();
  fixture.detectChanges();
  return { fixture, http, el: fixture.nativeElement as HTMLElement };
}

installIntersectionObserverStandIn();

describe('HomePage (members)', () => {
  it('greets by name and places the sections', async () => {
    const { el } = await render();
    expect(el.querySelector('h1')!.textContent).toBe('SwiftOtter');
    for (const s of ['app-stats-section', 'app-sync-section', 'app-playing-now-section']) {
      expect(el.querySelector(s)).not.toBeNull();
    }
  });

  it('keeps the rest of Home when one section fails', async () => {
    const { fixture, http, el } = await render();
    http.expectOne('/api/currentuser/stats').flush(null, { status: 500, statusText: 'x' });
    http.expectOne('/api/currentuser/accounts').flush({ accounts: [] });
    http.expectOne('/api/currentuser/tracked').flush({ games: [] });
    await settle();
    fixture.detectChanges();
    expect(el.textContent).toContain('Your totals didn’t load.');
    expect(el.textContent).toContain('Connect your Steam account');
    expect(el.textContent).toContain('Nothing pinned yet');
  });

  it('waits for the user record before any section loads', () => {
    TestBed.configureTestingModule({ providers: testProviders(fakeAuthProvider) });
    signInAs(memberUser());
    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/currentuser');
    http.expectNone('/api/currentuser/tracked');
    http.expectNone('/api/currentuser/accounts');
  });
});
