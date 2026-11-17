import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { libraryGame, trackedGame } from '../fixtures';
import { startApp } from './integration-app';

const hades = libraryGame(1, { title: 'Hades', playtimeMinutes: 300 });
const celeste = libraryGame(2, { title: 'Celeste', playtimeMinutes: 900 });
const outerWilds = libraryGame(3, { title: 'Outer Wilds', playtimeMinutes: 60 });

/** Integration: /library as a member, from the route to the API and back to the cards. */
describe('Integration · my library', () => {
  afterEach(() => TestBed.inject(HttpTestingController).verify());

  const start = (games = [hades, celeste, outerWilds]) =>
    startApp({ backend: (b) => (b.games = games) });

  it('lists the owned games, asking for the first page in the default order', async () => {
    const app = await start();
    await app.visit('/library');

    expect(app.cardTitles()).toEqual(['Hades', 'Celeste', 'Outer Wilds']);
    expect(app.backend.calls()).toContain('GET /api/currentuser/games?sort=recent&page=0&size=48');
    expect(app.chips().labels).toEqual(['All games']);
  });

  it('re-asks the API when the sort changes and shows its order', async () => {
    const app = await start();
    await app.visit('/library');

    await app.select('Sort by', 'name');

    expect(app.backend.calls().at(-1)).toBe('GET /api/currentuser/games?sort=name&page=0&size=48');
    expect(app.cardTitles()).toEqual(['Celeste', 'Hades', 'Outer Wilds']);
  });

  it('filters by name once the person stops typing, and says when nothing matches', async () => {
    const app = await start();
    await app.visit('/library');
    const before = app.backend.requests.length;

    await app.type('Find in your library', 'ce');
    expect(app.backend.requests.length).toBe(before); // still waiting for the debounce
    await app.wait(320);

    expect(app.backend.calls().at(-1)).toBe(
      'GET /api/currentuser/games?q=ce&sort=recent&page=0&size=48',
    );
    expect(app.cardTitles()).toEqual(['Celeste']);

    await app.type('Find in your library', 'zelda');
    await app.wait(320);
    expect(app.cardTitles()).toEqual([]);
    expect(app.text()).toContain('No games here match “zelda”.');
  });

  it('adds the next page under the first with Show more', async () => {
    const many = Array.from({ length: 50 }, (_, i) => libraryGame(i + 1));
    const app = await start(many);
    await app.visit('/library');
    expect(app.cardTitles().length).toBe(48);

    await app.click('Show more');

    expect(app.backend.calls().at(-1)).toBe(
      'GET /api/currentuser/games?sort=recent&page=1&size=48',
    );
    expect(app.cardTitles().length).toBe(50);
    expect(app.has('Show more')).toBe(false);
  });

  it('offers to connect Steam when no account is linked', async () => {
    const app = await startApp({ backend: (b) => (b.accounts = []) });
    await app.visit('/library');

    expect(app.el.querySelector('app-connect-steam-card')).not.toBeNull();
    expect(app.el.querySelector('app-collections-bar')).toBeNull();
  });

  it('explains a lost connection and loads again with Try again', async () => {
    const app = await start();
    app.backend.failNext('GET', /^\/api\/currentuser\/games$/, 0);
    await app.visit('/library');

    expect(app.messages()).toContain(
      'Can’t reach Lavrel right now. Check your connection, then try again.',
    );
    expect(app.cardTitles()).toEqual([]);

    await app.click('Try again');
    expect(app.cardTitles()).toEqual(['Hades', 'Celeste', 'Outer Wilds']);
  });

  it('switches between Tracked and My library both ways with the Games views nav', async () => {
    const app = await startApp({
      backend: (b) => {
        b.games = [hades, celeste];
        b.tracked = [trackedGame(9, { title: 'Outer Wilds' })];
      },
    });
    await app.visit('/games');
    expect(app.text()).toContain('Outer Wilds');

    await app.click('My library');
    expect(app.url).toBe('/library');
    expect(app.cardTitles()).toEqual(['Hades', 'Celeste']);
    expect(app.control('My library').getAttribute('aria-current')).toBe('page');

    await app.click('Tracked');
    expect(app.url).toBe('/games');
    expect(app.text()).toContain('Outer Wilds');
    expect(app.control('Tracked').getAttribute('aria-current')).toBe('page');

    await app.click('My library');
    expect(app.url).toBe('/library');
  });
});
