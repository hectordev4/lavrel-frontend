import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { fakeAuthProvider, signInAs } from '../../../../../testing/auth-testing';
import { installDialogStandIn } from '../../../../../testing/dialog';
import { memberUser, testProviders } from '../../../../../testing/test-env';
import { SetupPage } from './setup.page';

const settle = () => new Promise((resolve) => setTimeout(resolve));

async function render() {
  installDialogStandIn();
  TestBed.configureTestingModule({ providers: testProviders(fakeAuthProvider) });
  signInAs(memberUser());
  const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
  const fixture = TestBed.createComponent(SetupPage);
  fixture.detectChanges();
  const http = TestBed.inject(HttpTestingController);
  http
    .match('/api/currentuser')
    .forEach((r) => r.flush({ username: 'BraveOtter1234', publicId: '1', countryId: null }));
  http.expectOne('/api/countries').flush({ countries: [{ id: 2, code: 'ES', name: 'Spain' }] });
  http
    .match(() => true)
    .forEach((r) => r.flush({ kind: 'GENERATED', galleryId: null, imageUrl: null }));
  await settle();
  fixture.detectChanges();
  return { fixture, http, navigate, el: fixture.nativeElement as HTMLElement };
}

const skipButton = (el: HTMLElement) =>
  [...el.querySelectorAll('button')].find((b) =>
    b.textContent!.includes('Skip for now'),
  ) as HTMLButtonElement;

describe('SetupPage', () => {
  it('shows the given name, and Skip for now keeps the defaults and only marks the setup as done', async () => {
    const { el, http, navigate } = await render();
    expect((el.querySelector('input[type="text"]') as HTMLInputElement).value).toBe(
      'BraveOtter1234',
    );
    skipButton(el).click();
    await settle();
    const done = http.expectOne('/api/currentuser/setup');
    expect(done.request.method).toBe('PUT');
    http.expectNone((r) => r.method !== 'GET' && r.url !== '/api/currentuser/setup');
    expect(navigate).not.toHaveBeenCalled();
    done.flush(null, { status: 204, statusText: 'No Content' });
    await settle();
    expect(navigate).toHaveBeenCalledWith('/home', { replaceUrl: true });
  });

  it('still goes to Home when marking the setup as done fails', async () => {
    const { el, http, navigate } = await render();
    skipButton(el).click();
    await settle();
    http.expectOne('/api/currentuser/setup').flush(null, { status: 500, statusText: 'x' });
    await settle();
    expect(navigate).toHaveBeenCalledWith('/home', { replaceUrl: true });
  });

  it('saves only what changed: a new name and a country, then marks the setup as done', async () => {
    const { el, http, navigate } = await render();
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
    http
      .expectOne({ method: 'PUT', url: '/api/currentuser/setup' })
      .flush(null, { status: 204, statusText: 'No Content' });
    await settle();
    expect(navigate).toHaveBeenCalledWith('/home', { replaceUrl: true });
  });

  it('asks for a name if it was emptied', async () => {
    const { el, fixture, http } = await render();
    (el.querySelector('input[type="text"]') as HTMLInputElement).value = '  ';
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    await settle();
    fixture.detectChanges();
    expect(el.textContent).toContain('Enter a name, or skip');
    http.expectNone('/api/currentuser/username');
    http.expectNone('/api/currentuser/setup');
  });
});
