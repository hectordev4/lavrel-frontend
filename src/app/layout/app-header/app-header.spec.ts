import { TestBed } from '@angular/core/testing';
import { fakeAuthProvider, signInAs } from '../../../testing/auth-testing';
import { memberUser, testProviders } from '../../../testing/test-env';
import { AppHeader } from './app-header';

describe('AppHeader', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: testProviders(fakeAuthProvider) }));

  it('offers Sign in to guests', () => {
    signInAs(null);
    const fixture = TestBed.createComponent(AppHeader);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.sign-in').getAttribute('href')).toBe('/welcome');
  });

  it('shows the avatar letter, linking to Profile, for members', () => {
    signInAs(memberUser({ email: 'otter@example.com' }));
    const fixture = TestBed.createComponent(AppHeader);
    fixture.detectChanges();
    const avatar = fixture.nativeElement.querySelector('.avatar');
    expect(avatar.textContent.trim()).toBe('O');
    expect(avatar.getAttribute('href')).toBe('/profile');
  });
});
