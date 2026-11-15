import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { fakeAuthProvider, signInAs } from '../../../../../testing/auth-testing';
import { memberUser, testProviders } from '../../../../../testing/test-env';
import { PlatformsSection } from './platforms-section';

const settle = () => new Promise((resolve) => setTimeout(resolve));

async function render(accounts: object[]) {
  TestBed.configureTestingModule({ providers: testProviders(fakeAuthProvider) });
  signInAs(memberUser());
  const fixture = TestBed.createComponent(PlatformsSection);
  fixture.detectChanges();
  const http = TestBed.inject(HttpTestingController);
  http.expectOne('/api/currentuser/accounts').flush({ accounts });
  http.expectOne('/api/currentuser/auto-sync').flush({ enabled: true });
  await settle();
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('PlatformsSection', () => {
  it('shows Steam as connected, with automatic sync and unlink', async () => {
    const el = await render([
      { platform: 'STEAM', externalId: '1', displayName: 'OtterPlays', lastSyncedAt: null },
    ]);
    expect(el.querySelector('.connected')!.textContent).toContain('Connected');
    expect(el.textContent).toContain('Signed in as OtterPlays');
    expect(el.textContent).toContain('Sync automatically');
    expect(el.textContent).toContain('Unlink Steam');
  });

  it('offers Connect Steam when nothing is linked', async () => {
    const el = await render([]);
    expect(el.textContent).toContain('Not connected');
    expect(el.textContent).toContain('Connect Steam');
    expect(el.textContent).toContain('Coming soon');
  });
});
