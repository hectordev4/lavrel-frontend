import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { GuestMode } from '../../../../core/auth/guest-mode';
import { fakeAuthProvider } from '../../../../../testing/auth-testing';
import { testProviders } from '../../../../../testing/test-env';
import { WelcomePage } from './welcome.page';

describe('WelcomePage', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: testProviders(fakeAuthProvider) });
  });

  it('offers Google, e-mail, registration and Skip for now', () => {
    const fixture = TestBed.createComponent(WelcomePage);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent!;
    expect(text).toContain('Continue with Google');
    expect(text).toContain('Sign in with e-mail');
    expect(text).toContain('Create an account');
    expect(text).toContain('Skip for now');
  });

  it('Skip for now enables guest mode', async () => {
    vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const fixture = TestBed.createComponent(WelcomePage);
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.skip button') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(TestBed.inject(GuestMode).active()).toBe(true);
  });
});
