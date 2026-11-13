import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { fakeAuthProvider, signInAs } from '../../../../../testing/auth-testing';
import { memberUser, testProviders } from '../../../../../testing/test-env';
import { SteamLinkedPage } from './steam-linked.page';

const settle = () => new Promise((resolve) => setTimeout(resolve));
const steam = { platform: 'STEAM', externalId: '7656', displayName: 'Otter', lastSyncedAt: null };

async function render(query: Record<string, string>, accounts: object[]) {
  TestBed.configureTestingModule({
    providers: testProviders(fakeAuthProvider, {
      provide: ActivatedRoute,
      useValue: { snapshot: { queryParamMap: convertToParamMap(query) } },
    }),
  });
  signInAs(memberUser());
  const router = TestBed.inject(Router);
  vi.spyOn(router, 'navigate').mockResolvedValue(true);
  const navigateByUrl = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
  const fixture = TestBed.createComponent(SteamLinkedPage);
  fixture.detectChanges();
  const http = TestBed.inject(HttpTestingController);
  if (Object.keys(query).length) http.expectOne('/api/currentuser/accounts').flush({ accounts });
  await settle();
  fixture.detectChanges();
  return { fixture, http, navigateByUrl };
}

describe('SteamLinkedPage', () => {
  it('after a failed first sync offers Sync again, never a new Steam login', async () => {
    const { fixture, http } = await render({ status: 'success' }, [steam]);
    http.expectOne('/api/currentuser/accounts/steam/7656/sync').flush({ error: 'profile_private' }, { status: 422, statusText: 'x' });
    await settle();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Steam is connected, but the sync didn’t finish');
    expect(el.textContent).toContain('privacy settings');
    const syncAgain = [...el.querySelectorAll('button')].find((b) => b.textContent!.includes('Sync again')) as HTMLButtonElement;
    syncAgain.click();
    await settle();
    http.expectOne('/api/currentuser/accounts/steam/7656/sync');
    http.expectNone('/api/currentuser/accounts/steam/link');
  });

  it('treats "already linked" as success when the account is linked to you, and syncs', async () => {
    const { http } = await render({ status: 'error', reason: 'account_already_linked' }, [steam]);
    http.expectOne('/api/currentuser/accounts/steam/7656/sync');
  });

  it('explains a Steam account linked to someone else, without a retry', async () => {
    const { fixture } = await render({ status: 'error', reason: 'account_linked_elsewhere' }, []);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('This Steam account is taken');
    expect(el.textContent).toContain('linked to another Lavrel account');
    expect([...el.querySelectorAll('button')].some((b) => b.textContent!.includes('Connect Steam'))).toBe(false);
  });

  it('goes Home when opened without a result', async () => {
    const { navigateByUrl } = await render({}, []);
    expect(navigateByUrl).toHaveBeenCalledWith('/home', { replaceUrl: true });
  });
});
