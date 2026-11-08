import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { fakeAuthProvider, fakeGateway } from '../../../../../testing/auth-testing';
import { testProviders } from '../../../../../testing/test-env';
import { EmailAuthPage } from './email-auth.page';

function render(mode: 'sign-in' | 'register') {
  TestBed.configureTestingModule({
    providers: testProviders(fakeAuthProvider, { provide: ActivatedRoute, useValue: { data: of({ mode }) } }),
  });
  const fixture = TestBed.createComponent(EmailAuthPage);
  fixture.detectChanges();
  return fixture;
}

describe('EmailAuthPage', () => {
  it('asks for both fields before calling Firebase', () => {
    const fixture = render('sign-in');
    (fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent!;
    expect(text).toContain('Enter your e-mail.');
    expect(text).toContain('Enter your password.');
    expect(fakeGateway().signInWithEmail).not.toHaveBeenCalled();
  });

  it('wants 8 characters when registering', () => {
    const fixture = render('register');
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h1')!.textContent).toContain('Create your account');
    const email = el.querySelector('#email') as HTMLInputElement;
    const password = el.querySelector('#password') as HTMLInputElement;
    email.value = 'a@b.c';
    email.dispatchEvent(new Event('input'));
    password.value = 'short';
    password.dispatchEvent(new Event('input'));
    (el.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(el.textContent).toContain('Use at least 8 characters.');
    expect(fakeGateway().registerWithEmail).not.toHaveBeenCalled();
  });
});
