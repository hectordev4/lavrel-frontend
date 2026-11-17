import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { installDialogStandIn } from '../../../../testing/dialog';
import { libraryGame } from '../../../../testing/fixtures';
import { testProviders } from '../../../../testing/test-env';
import { CollectionsUi } from '../data-access/collections-ui';
import { MyCollections } from '../data-access/my-collections';
import { MyLibrary } from '../data-access/my-library';
import { CollectionsBar } from './collections-bar/collections-bar';
import { LibraryGameMenu } from './library-game-menu/library-game-menu';

const settle = () => new Promise((resolve) => setTimeout(resolve));

function setUp(collections: object[]) {
  installDialogStandIn();
  TestBed.configureTestingModule({ providers: testProviders(MyLibrary, MyCollections, CollectionsUi) });
  const http = TestBed.inject(HttpTestingController);
  const loading = TestBed.inject(MyCollections).reload();
  http.expectOne('/api/currentuser/collections').flush({ collections });
  return { http, loading };
}

describe('My library collection parts', () => {
  it('CollectionsBar shows All games and each collection, and asks for a name before creating', async () => {
    const { loading } = setUp([{ id: 'c1', name: 'Cozy', position: 1, gameCount: 3 }]);
    await loading;
    const f = TestBed.createComponent(CollectionsBar);
    f.detectChanges();
    const chips = [...f.nativeElement.querySelectorAll('app-chip button')].map((b: Element) => b.textContent!.replace(/\s+/g, ' ').trim());
    expect(chips).toEqual(['All games', 'Cozy 3']);
    const ui = TestBed.inject(CollectionsUi);
    await ui.create('   ');
    expect(ui.formError()).toBe('Give the collection a name.');
  });

  it('LibraryGameMenu offers to create a collection first when there is none', async () => {
    const { loading } = setUp([]);
    await loading;
    const f = TestBed.createComponent(LibraryGameMenu);
    f.componentRef.setInput('game', libraryGame(1));
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Create a collection first');
  });

  it('adding a game reports where it went', async () => {
    const { http, loading } = setUp([{ id: 'c1', name: 'Cozy', position: 1, gameCount: 0 }]);
    await loading;
    const ui = TestBed.inject(CollectionsUi);
    ui.adding.set(libraryGame(1));
    const done = ui.addTo({ id: 'c1', name: 'Cozy', position: 1, gameCount: 0 });
    await settle();
    http.expectOne('/api/currentuser/collections/c1/games/1').flush(null);
    await settle();
    http.expectOne('/api/currentuser/collections').flush({ collections: [] });
    await done;
    expect(ui.message()).toBe('Added Game 1 to Cozy.');
  });
  describe('saving a name', () => {
    const cozy = { id: 'c1', name: 'Cozy', position: 1, gameCount: 0 };
    const posts = (http: HttpTestingController) =>
      http.match((r) => r.method === 'POST' && r.url === '/api/currentuser/collections');

    /** The open sheet's submit button, after a render. */
    function submitButton(f: {
      detectChanges(): void;
      nativeElement: HTMLElement;
    }): HTMLButtonElement {
      f.detectChanges();
      return f.nativeElement.querySelector('dialog[open] button[type="submit"]')!;
    }

    it('sends one create for a double tap, with the button disabled until the answer', async () => {
      const { http, loading } = setUp([]);
      await loading;
      const ui = TestBed.inject(CollectionsUi);
      const f = TestBed.createComponent(CollectionsBar);
      ui.openCreate();

      const first = ui.create('Cozy');
      const second = ui.create('Cozy');
      await second;
      await settle();

      const sent = posts(http);
      expect(sent.length).toBe(1);
      expect(ui.saving()).toBe(true);
      const button = submitButton(f);
      expect(button.disabled).toBe(true);
      expect(button.textContent!.trim()).toBe('Creating…');

      sent[0].flush(cozy, { status: 201, statusText: 'Created' });
      await first;
      expect(ui.saving()).toBe(false);
      expect(ui.creating()).toBe(false);
      expect(ui.formError()).toBeNull();
      http.match(() => true); // the library reload for the new collection
    });

    it('lets the person try again after a failed create', async () => {
      const { http, loading } = setUp([]);
      await loading;
      const ui = TestBed.inject(CollectionsUi);
      const f = TestBed.createComponent(CollectionsBar);
      ui.openCreate();

      const done = ui.create('Cozy');
      await settle();
      posts(http)[0].flush(
        { error: 'collection_name_taken' },
        { status: 409, statusText: 'Conflict' },
      );
      await done;

      expect(ui.saving()).toBe(false);
      expect(ui.formError()).toBe('You already have a collection with that name.');
      const button = submitButton(f);
      expect(button.disabled).toBe(false);
      expect(button.textContent!.trim()).toBe('Create collection');

      const again = ui.create('Cozier');
      await settle();
      const retry = posts(http);
      expect(retry.length).toBe(1);
      retry[0].flush({ ...cozy, name: 'Cozier' }, { status: 201, statusText: 'Created' });
      await again;
      expect(ui.saving()).toBe(false);
      expect(ui.creating()).toBe(false);
      http.match(() => true); // the library reload for the new collection
    });

    it('sends one rename for a double tap, and saves again after a failure', async () => {
      const { http, loading } = setUp([cozy]);
      await loading;
      const ui = TestBed.inject(CollectionsUi);
      ui.browse('c1');
      http.match(() => true); // the library load for the collection
      const f = TestBed.createComponent(CollectionsBar);
      ui.openRename();

      const first = ui.rename('Comfy');
      await ui.rename('Comfy');
      await settle();
      const patches = http.match((r) => r.method === 'PATCH');
      expect(patches.length).toBe(1);
      const button = submitButton(f);
      expect(button.disabled).toBe(true);
      expect(button.textContent!.trim()).toBe('Saving…');

      patches[0].flush({ error: 'collection_name_taken' }, { status: 409, statusText: 'Conflict' });
      await first;
      expect(ui.saving()).toBe(false);
      expect(ui.renaming()).toBe(true);
      expect(submitButton(f).disabled).toBe(false);

      const retry = ui.rename('Comfy evenings');
      await settle();
      http
        .expectOne({ method: 'PATCH', url: '/api/currentuser/collections/c1' })
        .flush({ ...cozy, name: 'Comfy evenings' });
      await retry;
      expect(ui.saving()).toBe(false);
      expect(ui.renaming()).toBe(false);
    });
  });
});
