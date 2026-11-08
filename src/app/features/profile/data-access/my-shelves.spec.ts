import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { testProviders } from '../../../../testing/test-env';
import { MyShelf } from '../models/my-shelf.model';
import { MyShelves } from './my-shelves';

const settle = () => new Promise((resolve) => setTimeout(resolve));
const shelf = (id: string, position: number, over: Partial<MyShelf> = {}): MyShelf => ({
  id,
  type: 'PLAYING',
  title: null,
  position,
  collectionId: null,
  achievementIds: [],
  ...over,
});

describe('MyShelves', () => {
  let shelves: MyShelves;
  let http: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: testProviders(MyShelves) });
    shelves = TestBed.inject(MyShelves);
    http = TestBed.inject(HttpTestingController);
    const loading = shelves.reload();
    http.expectOne('/api/currentuser/profile/shelves').flush({ shelves: [shelf('b', 2), shelf('a', 1, { type: 'STATS' })] });
    await loading;
  });

  it('keeps the shelves in their order', () => {
    expect(shelves.list().map((s) => s.id)).toEqual(['a', 'b']);
  });

  it('sends an empty title as null, so the type’s name is used', async () => {
    const done = shelves.add('COMPLETED', '   ', null);
    await settle();
    const req = http.expectOne('/api/currentuser/profile/shelves');
    expect(req.request.body).toEqual({ type: 'COMPLETED', title: null, collectionId: null });
    req.flush(shelf('c', 3, { type: 'COMPLETED' }));
    expect(await done).toBeNull();
  });

  it('moves a shelf down by sending the whole new order', async () => {
    const done = shelves.move('a', 1);
    await settle();
    const req = http.expectOne((r) => r.method === 'PUT');
    expect(req.request.body).toEqual({ shelfIds: ['b', 'a'] });
    req.flush({ shelves: [shelf('b', 1), shelf('a', 2, { type: 'STATS' })] });
    await done;
    expect(shelves.list().map((s) => s.id)).toEqual(['b', 'a']);
  });

  it('explains the 10-shelf limit', async () => {
    const done = shelves.add('COMPLETED', '', null);
    await settle();
    http.expectOne('/api/currentuser/profile/shelves').flush({ error: 'shelf_limit_reached' }, { status: 409, statusText: 'x' });
    expect(await done).toContain('10 shelves');
  });
});
