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
});
