import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { FirstSetup } from '../../../../core/profile/first-setup';
import { fakeAuthProvider, signInAs } from '../../../../../testing/auth-testing';
import { installDialogStandIn } from '../../../../../testing/dialog';
import { memberUser, testProviders } from '../../../../../testing/test-env';
import { SetupPage } from './setup.page';

const settle = () => new Promise((resolve) => setTimeout(resolve));

async function render() {
  installDialogStandIn();
  localStorage.clear();
  TestBed.configureTestingModule({ providers: testProviders(fakeAuthProvider) });
  signInAs(memberUser({ createdAt: new Date().toISOString() }));
  const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
  const fixture = TestBed.createComponent(SetupPage);
  fixture.detectChanges();
  const http = TestBed.inject(HttpTestingController);
  http.match('/api/currentuser').forEach((r) => r.flush({ username: 'BraveOtter1234', publicId: '1', countryId: null }));
  http.expectOne('/api/countries').flush({ countries: [{ id: 2, code: 'ES', name: 'Spain' }] });
  http.match(() => true).forEach((r) => r.flush({ kind: 'GENERATED', galleryId: null, imageUrl: null }));
  await settle();
  fixture.detectChanges();
  return { fixture, http, navigate, el: fixture.nativeElement as HTMLElement };
}

describe('SetupPage', () => {
  it('shows the given name, and Skip for now keeps the defaults without saving anything', async () => {
    const { el, http, navigate } = await render();
    expect((el.querySelector('input[type="text"]') as HTMLInputElement).value).toBe('BraveOtter1234');
    ([...el.querySelectorAll('button')].find((b) => b.textContent!.includes('Skip for now')) as HTMLButtonElement).click();
    await settle();
    http.expectNone((r) => r.method !== 'GET');
    expect(TestBed.inject(FirstSetup).needed()).toBe(false);
    expect(navigate).toHaveBeenCalledWith('/home', { replaceUrl: true });
  });

  it('saves only what changed: a new name and a country', async () => {
    const { el, http, fixture } = await render();
    const name = el.querySelector('input[type="text"]') as HTMLInputElement;
    name.value = 'QuietMoth';
    (el.querySelector('select') as HTMLSelectElement).value = '2';
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    await settle();
    http.expectOne('/api/currentuser/username').flush(null);
    await settle();
    const country = http.expectOne('/api/currentuser/country');
    expect(country.request.body).toEqual({ countryId: 2 });
    country.flush(null);
    await settle();
    fixture.detectChanges();
    expect(TestBed.inject(FirstSetup).needed()).toBe(false);
  });

  it('asks for a name if it was emptied', async () => {
    const { el, fixture, http } = await render();
    (el.querySelector('input[type="text"]') as HTMLInputElement).value = '  ';
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    await settle();
    fixture.detectChanges();
    expect(el.textContent).toContain('Enter a name, or skip');
    http.expectNone('/api/currentuser/username');
  });
});
