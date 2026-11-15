import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { GuestMode } from '../../../../core/auth/guest-mode';
import { fakeAuthProvider, fakeGateway } from '../../../../../testing/auth-testing';
import { testProviders } from '../../../../../testing/test-env';
import { AuthFlow } from '../../data-access/auth-flow';
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

  describe('after the app ended the session', () => {
    const query = new BehaviorSubject(convertToParamMap({}));
    const open = (reason?: string) => {
      query.next(convertToParamMap(reason === undefined ? {} : { reason }));
      TestBed.overrideProvider(ActivatedRoute, { useValue: { queryParamMap: query } });
      const fixture = TestBed.createComponent(WelcomePage);
      fixture.detectChanges();
      return fixture;
    };
    const alert = (fixture: { nativeElement: HTMLElement }) =>
      fixture.nativeElement.querySelector('[role="alert"]')?.textContent?.trim() ?? null;

    it('says the session expired', () => {
      expect(alert(open('session_expired'))).toBe(
        'Your session has expired. Please sign in again.',
      );
    });

    it('says the person was signed out', () => {
      expect(alert(open('signed_out'))).toBe('You’ve been signed out. Please sign in again.');
    });

    it('shows nothing without a reason', () => {
      expect(alert(open())).toBeNull();
    });

    it('shows nothing for a reason it doesn’t know', () => {
      expect(alert(open('<b>made up</b>'))).toBeNull();
    });

    it('hides the reason once the person starts signing in, and a sign-in error takes its place', async () => {
      const fixture = open('signed_out');
      const flow = TestBed.inject(AuthFlow);
      let fail!: () => void;
      fakeGateway().signInWithGoogle.mockReturnValueOnce(
        new Promise<never>((_, reject) => (fail = () => reject(new Error('popup closed oddly')))),
      );

      const pending = flow.signInWithGoogle();
      fixture.detectChanges();
      expect(alert(fixture)).toBeNull();

      fail();
      await pending;
      fixture.detectChanges();
      expect(alert(fixture)).toBe('Something went wrong on our side. Try again in a moment.');
    });
  });
});
