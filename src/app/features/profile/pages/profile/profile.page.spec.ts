import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { fakeAuthProvider, signInAs } from '../../../../../testing/auth-testing';
import { memberUser, testProviders } from '../../../../../testing/test-env';
import { ProfilePage } from './profile.page';

const settle = () => new Promise((resolve) => setTimeout(resolve));

describe('ProfilePage', () => {
  it('shows the name, the player id in groups of four and the country', async () => {
    HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
      this.open = true;
    };
    TestBed.configureTestingModule({ providers: testProviders(fakeAuthProvider) });
    signInAs(memberUser());
    const fixture = TestBed.createComponent(ProfilePage);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/currentuser').flush({ username: 'SwiftOtter', publicId: '4829103755210846', countryId: 2 });
    http.expectOne('/api/countries').flush({ countries: [{ id: 2, code: 'ES', name: 'Spain' }] });
    await settle();
    fixture.detectChanges();
    http.match(() => true).forEach((r) => r.flush(r.request.url.endsWith('accounts') ? { accounts: [] } : {}));
    await settle();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h1')!.textContent).toBe('SwiftOtter');
    expect(el.textContent).toContain('ID 4829 1037 5521 0846');
    expect(el.querySelector('.country')!.textContent).toContain('Spain');
    expect(el.textContent).toContain('Delete account');
  });
});
