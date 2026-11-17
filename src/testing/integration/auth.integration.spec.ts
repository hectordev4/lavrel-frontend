import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { memberUser, unverifiedUser } from '../test-env';
import { startApp } from './integration-app';

/**
 * Integration: signing in and the first visit, across the real routes, guards, auth pages, Home and the setup
 * page, with Firebase and the API replaced by fakes.
 */
describe('Integration · auth and first setup', () => {
  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('sends a first-time visitor to welcome, and a guest to the sign-in gate instead of their library', async () => {
    const app = await startApp({ user: null });
    await app.visit('/');
    expect(app.url).toBe('/welcome');

    await app.visit('/library');
    expect(app.url).toBe('/library');
    expect(app.text()).toContain('Your games live here');
    expect(app.has('Sign in or create an account')).toBe(true);
    expect(app.backend.requests).toEqual([]);
  });

  it('signs in with e-mail and opens Home with the account the API returns', async () => {
    const app = await startApp({
      user: null,
      backend: (b) => (b.user = { ...b.user, username: 'Aloy' }),
    });
    await app.visit('/sign-in');

    await app.type('E-mail', 'player@example.com');
    await app.type('Password', 'hunter22');
    await app.click('Sign in');

    expect(app.auth.signInWithEmail).toHaveBeenCalledWith('player@example.com', 'hunter22');
    expect(app.url).toBe('/home');
    expect(app.el.querySelector('h1')?.textContent).toContain('Aloy');
    const me = app.backend.requests.find((r) => r.url === '/api/currentuser')!;
    expect(me.headers.get('Authorization')).toBe('Bearer token-123');
  });

  it('shows why sign-in failed and stays on the page', async () => {
    const app = await startApp({ user: null });
    app.auth.signInWithEmail.mockRejectedValueOnce({ code: 'auth/invalid-credential' });
    await app.visit('/sign-in');

    await app.type('E-mail', 'player@example.com');
    await app.type('Password', 'wrong');
    await app.click('Sign in');

    expect(app.url).toBe('/sign-in');
    expect(app.messages().length).toBe(1);
  });

  it('keeps an unverified account on the verify page until the e-mail is confirmed', async () => {
    const app = await startApp({ user: unverifiedUser() });
    await app.visit('/library');
    expect(app.url).toBe('/verify-email');

    app.auth.reloadUser.mockResolvedValueOnce(unverifiedUser());
    await app.click('I’ve confirmed my e-mail');
    expect(app.url).toBe('/verify-email');

    app.auth.reloadUser.mockResolvedValueOnce(memberUser());
    await app.click('I’ve confirmed my e-mail');
    expect(app.auth.idToken).toHaveBeenCalledWith(true);
    expect(app.url).toBe('/home');
  });

  it('sends a new account from Home to setup; skipping saves it and Home stays', async () => {
    const app = await startApp({ backend: (b) => (b.user = { ...b.user, setupCompleted: false }) });
    await app.visit('/home');
    expect(app.url).toBe('/setup');
    expect(app.text()).toContain('Make it yours');

    await app.click('Skip for now');

    expect(app.backend.calls()).toContain('PUT /api/currentuser/setup');
    expect(app.backend.user.setupCompleted).toBe(true);
    expect(app.url).toBe('/home');
  });

  it('saves a new name from setup, then shows it on Home', async () => {
    const app = await startApp({
      backend: (b) => (b.user = { ...b.user, username: 'Player', setupCompleted: false }),
    });
    await app.visit('/setup');

    await app.type('Name others see', 'Kratos');
    await app.click('Save and continue');

    const calls = app.backend.calls();
    expect(calls.indexOf('PATCH /api/currentuser/username')).toBeLessThan(
      calls.indexOf('PUT /api/currentuser/setup'),
    );
    expect(app.url).toBe('/home');
    expect(app.el.querySelector('h1')?.textContent).toContain('Kratos');
  });
});
