import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { libraryGame } from '../fixtures';
import { startApp } from './integration-app';

const hades = libraryGame(1, { title: 'Hades' });
const celeste = libraryGame(2, { title: 'Celeste' });

/**
 * Integration: collections on /library, through the bar, the game menus and the sheets, with a backend that keeps
 * what each step saved.
 */
describe('Integration · collections', () => {
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    vi.restoreAllMocks();
  });

  const start = () => startApp({ backend: (b) => (b.games = [hades, celeste]) });

  it('creates a collection, fills it from a game menu, browses, renames and empties it', async () => {
    const app = await start();
    await app.visit('/library');

    // No collections yet: the game menu offers to create one first.
    await app.click('More for Hades');
    expect(app.has('Create a collection first')).toBe(true);
    await app.click('More for Hades');

    // Create: the new collection opens right away, empty.
    await app.click('New collection');
    await app.type('Cozy games', 'Cozy');
    await app.submitDialog();
    expect(app.backend.calls()).toContain('POST /api/currentuser/collections');
    expect(app.chips()).toEqual({ labels: ['All games', 'Cozy 0'], pressed: 'Cozy 0' });
    expect(app.backend.calls().at(-1)).toContain('collection=c1');
    expect(app.text()).toContain('Cozy is empty. Open a game’s menu in All games to add it.');

    // Add Hades from All games.
    await app.click('All games');
    await app.click('More for Hades');
    await app.click('Add to collection…');
    expect(app.openDialog().textContent).toContain('Add Hades to…');
    (app.openDialog().querySelector('ul.pick button') as HTMLButtonElement).click();
    await app.settle();
    expect(app.backend.calls()).toContain('PUT /api/currentuser/collections/c1/games/1');
    expect(app.messages()).toContain('Added Hades to Cozy.');
    expect(app.chips().labels).toEqual(['All games', 'Cozy 1']);

    // Browse it: only Hades.
    await app.click('Cozy');
    expect(app.cardTitles()).toEqual(['Hades']);

    // Rename.
    await app.click('Rename');
    const name = app.openDialog().querySelector('input')!;
    expect(name.value).toBe('Cozy');
    name.value = 'Comfy';
    await app.submitDialog();
    expect(app.backend.calls()).toContain('PATCH /api/currentuser/collections/c1');
    expect(app.chips()).toEqual({ labels: ['All games', 'Comfy 1'], pressed: 'Comfy 1' });

    // Remove the game: the collection reloads empty.
    await app.click('More for Hades');
    await app.click('Remove from Comfy');
    expect(app.backend.calls()).toContain('DELETE /api/currentuser/collections/c1/games/1');
    expect(app.messages()).toContain('Removed Hades from Comfy.');
    expect(app.cardTitles()).toEqual([]);
    expect(app.chips().labels).toEqual(['All games', 'Comfy 0']);
  });

  it('deletes the open collection only after the person confirms, then shows all games', async () => {
    const app = await startApp({
      backend: (b) => {
        b.games = [hades, celeste];
        b.collections = [{ id: 'c9', name: 'Backlog', position: 1, gameCount: 0 }];
        b.inCollection.set('c9', new Set([2]));
      },
    });
    await app.visit('/library');
    await app.click('Backlog');
    expect(app.cardTitles()).toEqual(['Celeste']);

    const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false);
    await app.click('Delete');
    expect(confirm).toHaveBeenCalledWith(
      'Delete the collection Backlog? Its games stay in your library.',
    );
    expect(app.backend.calls().some((c) => c.startsWith('DELETE'))).toBe(false);

    confirm.mockReturnValueOnce(true);
    await app.click('Delete');
    expect(app.backend.calls()).toContain('DELETE /api/currentuser/collections/c9');
    expect(app.chips()).toEqual({ labels: ['All games'], pressed: 'All games' });
    expect(app.cardTitles()).toEqual(['Hades', 'Celeste']);
  });

  it('keeps the sheet open with the reason when the name is empty or already used', async () => {
    const app = await startApp({
      backend: (b) => {
        b.games = [hades];
        b.collections = [{ id: 'c9', name: 'Backlog', position: 1, gameCount: 0 }];
        b.inCollection.set('c9', new Set());
      },
    });
    await app.visit('/library');
    await app.click('New collection');

    await app.submitDialog();
    expect(app.openDialog().textContent).toContain('Give the collection a name.');
    expect(app.backend.calls()).not.toContain('POST /api/currentuser/collections');

    await app.type('Cozy games', 'backlog');
    await app.submitDialog();
    expect(app.openDialog().textContent).toContain('You already have a collection with that name.');
    expect(app.chips().labels).toEqual(['All games', 'Backlog 0']);
  });
});
