import { Router } from '@angular/router';
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

  it('shows the avatar, linking to Profile, for members', () => {
    signInAs(memberUser());
    const fixture = TestBed.createComponent(AppHeader);
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector('.avatar-link');
    expect(link.getAttribute('href')).toBe('/profile');
    expect(link.querySelector('app-avatar')).not.toBeNull();
  });
});

describe('AppHeader desktop search', () => {
  it('opens the results for what was typed when Enter is pressed', () => {
    TestBed.configureTestingModule({ providers: testProviders(fakeAuthProvider) });
    signInAs(null);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(AppHeader);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('.desktop-search input') as HTMLInputElement;
    input.value = ' hades ';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(navigate).toHaveBeenCalledWith(['/search/results'], { queryParams: { q: 'hades' } });
  });
});
