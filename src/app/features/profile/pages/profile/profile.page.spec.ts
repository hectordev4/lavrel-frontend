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
    // The page and the shared avatar both read the current user.
    http.match('/api/currentuser').forEach((r) => r.flush({ username: 'SwiftOtter', publicId: '4829103755210846', countryId: 2 }));
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

describe('ProfilePage copy button', () => {
  it('shows a green tick for a second, without moving anything, and tells screen readers', async () => {
    HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
      this.open = true;
    };
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
    TestBed.configureTestingModule({ providers: testProviders(fakeAuthProvider) });
    signInAs(memberUser());
    const fixture = TestBed.createComponent(ProfilePage);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.match('/api/currentuser').forEach((r) => r.flush({ username: 'SwiftOtter', publicId: '4829103755210846' }));
    http.expectOne('/api/countries').flush({ countries: [] });
    await settle();
    fixture.detectChanges();
    http.match(() => true).forEach((r) => r.flush(r.request.url.endsWith('accounts') ? { accounts: [] } : {}));
    await settle();
    fixture.detectChanges();

    vi.useFakeTimers();
    const el = fixture.nativeElement as HTMLElement;
    (el.querySelector('[aria-label="Copy your player id"]') as HTMLButtonElement).click();
    await vi.advanceTimersByTimeAsync(0);
    fixture.detectChanges();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('4829103755210846');
    expect(el.querySelector('.copy .tick')).not.toBeNull();
    expect(el.querySelector('[role="status"].visually-hidden')!.textContent).toContain('Player id copied');

    await vi.advanceTimersByTimeAsync(1000);
    fixture.detectChanges();
    expect(el.querySelector('.tick')).toBeNull();
    vi.useRealTimers();
  });
});
