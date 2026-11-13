import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { achievement } from '../../../../testing/fixtures';
import { testProviders } from '../../../../testing/test-env';
import { GameAchievementsStore } from './game-achievements';

describe('GameAchievementsStore', () => {
  function loaded(unlocked: number | null) {
    TestBed.configureTestingModule({ providers: testProviders(GameAchievementsStore) });
    const store = TestBed.inject(GameAchievementsStore);
    store.load(7);
    const list = Array.from({ length: 12 }, (_, i) => achievement(i, { unlocked: i < 3 }));
    TestBed.inject(HttpTestingController)
      .expectOne('/api/games/7/achievements')
      .flush({ gameId: 7, total: 12, unlocked, achievements: list });
    return store;
  }

  it('shows the first 10, then all', () => {
    const store = loaded(null);
    expect(store.visible().length).toBe(10);
    expect(store.hiddenCount()).toBe(2);
    store.showAll.set(true);
    expect(store.visible().length).toBe(12);
  });

  it('is personal only with the member’s unlock count', () => {
    expect(loaded(null).personal()).toBe(false);
    TestBed.resetTestingModule();
    expect(loaded(3).personal()).toBe(true);
  });

  it('filters unlocked and locked', () => {
    const store = loaded(3);
    store.setFilter('unlocked');
    expect(store.filtered().length).toBe(3);
    store.setFilter('locked');
    expect(store.filtered().length).toBe(9);
  });

  it('remembers revealed hidden achievements', () => {
    const store = loaded(null);
    store.reveal(5);
    expect(store.revealed().has(5)).toBe(true);
  });
});

describe('GameAchievementsStore, switching games', () => {
  it('cancels the older request when another game loads', () => {
    TestBed.configureTestingModule({ providers: testProviders(GameAchievementsStore) });
    const store = TestBed.inject(GameAchievementsStore);
    const http = TestBed.inject(HttpTestingController);
    store.load(1);
    const first = http.expectOne('/api/games/1/achievements');
    store.load(2);
    expect(first.cancelled).toBe(true);
    http.expectOne('/api/games/2/achievements').flush({ gameId: 2, total: 0, unlocked: null, achievements: [] });
    expect(store.state().kind).toBe('ready');
  });
});
