import { TestBed } from '@angular/core/testing';
import { fakeAuthProvider, fakeGateway } from '../testing/auth-testing';
import { testProviders } from '../testing/test-env';
import { App } from './app';

describe('App', () => {
  it('shows the splash until the session is known and the logo has built', () => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({ providers: testProviders(fakeAuthProvider) });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-loading-screen')).not.toBeNull();

    fakeGateway().state.next(null);
    vi.advanceTimersByTime(1500);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('router-outlet')).not.toBeNull();
    vi.useRealTimers();
  });
});
