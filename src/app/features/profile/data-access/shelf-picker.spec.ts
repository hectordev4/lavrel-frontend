import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { testProviders } from '../../../../testing/test-env';
import { ShelfPicker } from './shelf-picker';

const settle = () => new Promise((resolve) => setTimeout(resolve));
const game = { gameId: 7, title: 'Hades', slug: 'hades' };
const unlock = (id: number) => ({ achievementId: id, name: `A${id}`, iconUrl: null, hidden: false, globalPercent: 10, unlockedAt: null });

describe('ShelfPicker', () => {
  let picker: ShelfPicker;
  let http: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: testProviders(ShelfPicker) });
    picker = TestBed.inject(ShelfPicker);
    http = TestBed.inject(HttpTestingController);
    const opening = picker.open('s1');
    http.expectOne('/api/currentuser/profile/shelves').flush({
      shelves: [
        {
          id: 's1',
          type: 'ACHIEVEMENTS',
          title: null,
          position: 1,
          collectionId: null,
          achievementIds: [10],
          achievements: [{ achievementId: 10, name: 'Phoenix Rising', iconUrl: null, gameId: 7, gameTitle: 'Hades', gameSlug: 'hades', globalPercent: 2.3, unlockedAt: null }],
        },
      ],
    });
    await opening;
  });

  it('starts from the shelf’s picks, unchanged', () => {
    expect(picker.picked().map((p) => p.name)).toEqual(['Phoenix Rising']);
    expect(picker.dirty()).toBe(false);
  });

  it('adds in the order picked, removes, and stops at 12', () => {
    picker.toggle(unlock(1), game);
    picker.toggle(unlock(2), game);
    expect(picker.picked().map((p) => p.achievementId)).toEqual([10, 1, 2]);
    expect(picker.dirty()).toBe(true);
    picker.toggle(unlock(1), game);
    expect(picker.isPicked(1)).toBe(false);
    for (let i = 100; i < 120; i++) picker.toggle(unlock(i), game);
    expect(picker.count()).toBe(12);
    expect(picker.full()).toBe(true);
  });

  it('saves the ids in order', async () => {
    picker.toggle(unlock(1), game);
    const saving = picker.save();
    await settle();
    const req = http.expectOne('/api/currentuser/profile/shelves/s1/achievements');
    expect(req.request.body).toEqual({ achievementIds: [10, 1] });
    req.flush({});
    expect(await saving).toBeNull();
    expect(picker.dirty()).toBe(false);
  });
});
