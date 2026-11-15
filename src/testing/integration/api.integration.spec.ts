import { HttpClient } from '@angular/common/http';
import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AuthStore } from '../../app/core/auth/auth.store';
import { libraryGame } from '../fixtures';
import { startApp } from './integration-app';

const hades = libraryGame(1, { title: 'Hades', playtimeMinutes: 300 });
const celeste = libraryGame(2, { title: 'Celeste', playtimeMinutes: 900 });

/**
 * Integration: how the app talks to the API, seen from real pages: the token on every call, what the backend's
 * auth errors do to the session and the route, and that the newest answer wins when several are in flight.
 */
describe('Integration · API communication', () => {
  afterEach(() => TestBed.inject(HttpTestingController).verify());

  const start = () => startApp({ backend: (b) => (b.games = [hades, celeste]) });

  it('sends the Firebase token on every API call of a page, and on nothing else', async () => {
    const app = await start();
    await app.visit('/library');

    expect(app.backend.requests.length).toBeGreaterThanOrEqual(3);
    for (const req of app.backend.requests)
      expect(req.headers.get('Authorization')).toBe('Bearer token-123');

    const other = firstValueFrom(TestBed.inject(HttpClient).get('/assets/manifest.json'));
    await app.settle();
    const req = TestBed.inject(HttpTestingController).expectOne('/assets/manifest.json');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
    await other;
  });

  describe('when the API refuses the session', () => {
    const games = /^\/api\/currentuser\/games$/;

    it('recovers from a stale token with a fresh one, without anyone noticing', async () => {
      const app = await start();
      app.auth.idToken.mockImplementation(async (force?: boolean) =>
        force ? 'fresh-456' : 'token-123',
      );
      app.backend.failNext('GET', games, 401);
      await app.visit('/library');

      expect(app.url).toBe('/library');
      expect(app.cardTitles()).toEqual(['Hades', 'Celeste']);
      expect(app.backend.requests.at(-1)!.headers.get('Authorization')).toBe('Bearer fresh-456');
      expect(app.auth.signOut).not.toHaveBeenCalled();
      expect(app.messages()).toEqual([]);
    });

    it('signs a dead session out and says so on welcome (401 twice)', async () => {
      const app = await start();
      app.backend.failNext('GET', games, 401);
      app.backend.failNext('GET', games, 401);
      await app.visit('/library');

      expect(app.auth.signOut).toHaveBeenCalledTimes(1);
      expect(TestBed.inject(AuthStore).user()).toBeNull();
      expect(app.url).toBe('/welcome?reason=signed_out');
      expect(app.messages()).toEqual(['You’ve been signed out. Please sign in again.']);
    });

    it('says the session expired when Firebase can’t renew it', async () => {
      const app = await start();
      app.auth.idToken.mockImplementation(async (force?: boolean) => {
        if (force) throw new Error('auth/user-token-expired');
        return 'token-123';
      });
      app.backend.failNext('GET', games, 401);
      await app.visit('/library');

      expect(app.url).toBe('/welcome?reason=session_expired');
      expect(app.messages()).toEqual(['Your session has expired. Please sign in again.']);
    });

    it('signs out once when every call on Home is refused at the same time', async () => {
      const app = await start();
      for (let i = 0; i < 20; i++) app.backend.failNext('GET', /^\/api\//, 401);
      await app.visit('/home');

      expect(app.auth.signOut).toHaveBeenCalledTimes(1);
      expect(app.url).toBe('/welcome?reason=signed_out');
    });

    it('lets a fresh token clear email_not_verified (the e-mail was confirmed elsewhere)', async () => {
      const app = await start();
      app.backend.failNext('GET', games, 403, 'email_not_verified');
      await app.visit('/library');

      expect(app.url).toBe('/library');
      expect(app.cardTitles()).toEqual(['Hades', 'Celeste']);
    });

    it('opens the verify page when the API still says the e-mail isn’t verified', async () => {
      const app = await start();
      app.backend.failNext('GET', games, 403, 'email_not_verified');
      app.backend.failNext('GET', games, 403, 'email_not_verified');
      await app.visit('/library');

      expect(TestBed.inject(AuthStore).user()?.emailVerified).toBe(false);
      expect(app.url).toBe('/verify-email');
      expect(app.has('I’ve confirmed my e-mail')).toBe(true);
    });

    it('leaves a guest on the page when a call is refused', async () => {
      const app = await startApp({ user: null });
      app.backend.failNext('GET', /^\/api\//, 401);
      await app.visit('/home');

      expect(app.backend.requests.length).toBeGreaterThan(0);
      expect(app.url).toBe('/home');
      expect(app.auth.signOut).not.toHaveBeenCalled();
    });
  });

  it('treats other 403s as errors of the page, without moving', async () => {
    const app = await start();
    app.backend.failNext('GET', /^\/api\/currentuser\/games$/, 403, 'forbidden');
    await app.visit('/library');

    expect(app.url).toBe('/library');
    expect(app.messages()).toContain('Your library didn’t load. Try again in a moment.');
  });

  it('shows only the newest answer when the sort changes while one is loading', async () => {
    const app = await start();
    await app.visit('/library');

    const slow = app.backend.hold('GET', /^\/api\/currentuser\/games$/);
    await app.select('Sort by', 'name');
    expect(app.el.querySelector('[aria-label="Loading your library"]')).not.toBeNull();

    await app.select('Sort by', 'playtime');
    expect(app.cardTitles()).toEqual(['Celeste', 'Hades']);

    slow.release(); // the "name" answer arrives late, and is ignored
    await app.settle();
    expect(app.cardTitles()).toEqual(['Celeste', 'Hades']);
    expect(app.backend.calls().slice(-2)).toEqual([
      'GET /api/currentuser/games?sort=name&page=0&size=48',
      'GET /api/currentuser/games?sort=playtime&page=0&size=48',
    ]);
  });

  it('refreshes the collection counts from the backend after adding a game', async () => {
    const app = await startApp({
      backend: (b) => {
        b.games = [hades];
        b.collections = [{ id: 'c1', name: 'Cozy', position: 1, gameCount: 0 }];
        b.inCollection.set('c1', new Set());
      },
    });
    await app.visit('/library');

    await app.click('More for Hades');
    await app.click('Add to collection…');
    (app.openDialog().querySelector('ul.pick button') as HTMLButtonElement).click();
    await app.settle();

    // The count shown comes from the backend after the change, not from a guess in the page.
    expect(app.backend.calls().slice(-2)).toEqual([
      'PUT /api/currentuser/collections/c1/games/1',
      'GET /api/currentuser/collections',
    ]);
    expect(app.chips().labels).toEqual(['All games', 'Cozy 1']);
  });
});
