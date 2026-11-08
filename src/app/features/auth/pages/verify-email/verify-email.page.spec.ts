import { TestBed } from '@angular/core/testing';
import { fakeAuthProvider, signInAs } from '../../../../../testing/auth-testing';
import { testProviders, unverifiedUser } from '../../../../../testing/test-env';
import { VerifyEmailPage } from './verify-email.page';

describe('VerifyEmailPage', () => {
  it('shows where the link went and waits before resending', () => {
    TestBed.configureTestingModule({ providers: testProviders(fakeAuthProvider) });
    signInAs(unverifiedUser());
    const fixture = TestBed.createComponent(VerifyEmailPage);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('player@example.com');
    const resend = [...el.querySelectorAll('button')].find((b) => b.textContent!.includes('Send again'))!;
    expect(resend.disabled).toBe(true);
    fixture.destroy();
  });
});
