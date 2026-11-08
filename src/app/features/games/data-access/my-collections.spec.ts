import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { testProviders } from '../../../../testing/test-env';
import { MyCollections } from './my-collections';

const settle = () => new Promise((resolve) => setTimeout(resolve));

describe('MyCollections', () => {
  let store: MyCollections;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: testProviders(MyCollections) });
    store = TestBed.inject(MyCollections);
    http = TestBed.inject(HttpTestingController);
  });

  it('creates a collection and adds it to the list', async () => {
    const done = store.create('  Cozy games ');
    await settle();
    const req = http.expectOne('/api/currentuser/collections');
    expect(req.request.body).toEqual({ name: 'Cozy games' });
    req.flush({ id: 'c1', name: 'Cozy games', position: 1, gameCount: 0 });
    expect(await done).toEqual({ id: 'c1', name: 'Cozy games', position: 1, gameCount: 0 });
    expect(store.list().map((c) => c.name)).toEqual(['Cozy games']);
  });

  it('returns the message when the name is taken', async () => {
    const done = store.create('Cozy games');
    await settle();
    http.expectOne('/api/currentuser/collections').flush({ error: 'collection_name_taken' }, { status: 409, statusText: 'x' });
    expect(await done).toContain('already have a collection');
  });

  it('adds a game, then reloads the counts', async () => {
    const done = store.addGame('c1', 7);
    await settle();
    http.expectOne('/api/currentuser/collections/c1/games/7').flush(null);
    await settle();
    http.expectOne('/api/currentuser/collections').flush({ collections: [{ id: 'c1', name: 'Cozy', position: 1, gameCount: 1 }] });
    expect(await done).toBeNull();
    expect(store.list()[0].gameCount).toBe(1);
  });
});
