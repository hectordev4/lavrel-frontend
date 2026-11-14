import { installIntersectionObserverStandIn } from '../../../../../testing/intersection-observer';
import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { fakeAuthProvider, signInAs } from '../../../../../testing/auth-testing';
import { memberUser, testProviders } from '../../../../../testing/test-env';
import { FirstSetup } from '../../../../core/profile/first-setup';
import { HomePage } from './home.page';

const settle = () => new Promise((resolve) => setTimeout(resolve));

async function render(user: object = { username: 'SwiftOtter', setupCompleted: true }) {
  TestBed.configureTestingModule({ providers: testProviders(fakeAuthProvider) });
  signInAs(memberUser());
  const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
  const fixture = TestBed.createComponent(HomePage);
  fixture.detectChanges();
  const http = TestBed.inject(HttpTestingController);
  http.expectOne('/api/currentuser').flush(user);
  await settle();
  fixture.detectChanges();
  return { fixture, http, navigate, el: fixture.nativeElement as HTMLElement };
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

  it('sends a member whose first setup isn’t done to /setup', async () => {
    const { navigate } = await render({ username: 'SwiftOtter', setupCompleted: false });
    expect(navigate).toHaveBeenCalledWith('/setup', { replaceUrl: true });
  });

  it('stays on Home once the setup is done, or after it was finished this session', async () => {
    const { navigate } = await render();
    expect(navigate).not.toHaveBeenCalled();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: testProviders(fakeAuthProvider) });
    signInAs(memberUser());
    const finishing = TestBed.inject(FirstSetup).complete();
    TestBed.inject(HttpTestingController)
      .expectOne('/api/currentuser/setup')
      .flush(null, { status: 500, statusText: 'x' });
    await finishing;
    const again = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    TestBed.createComponent(HomePage).detectChanges();
    TestBed.inject(HttpTestingController)
      .expectOne('/api/currentuser')
      .flush({ setupCompleted: false });
    await settle();
    expect(again).not.toHaveBeenCalled();
  });
});
