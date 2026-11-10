import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MAX_SHELF_ACHIEVEMENTS } from '../../../core/profile/shelf-types';
import { AchievementGame, UnlockedAchievement } from '../models/achievement-game.model';
import { PickedAchievement } from '../models/picked-achievement.model';
import { ShelvesApi } from './shelves.api';
import { shelfErrorMessage } from './shelf-messages';

/**
 * The picks for one ACHIEVEMENTS shelf while the picker is open: starts from what the shelf has, keeps the
 * order of picking across games, stops at 12, and saves them in one go. Provided by the picker page.
 */
@Injectable()
export class ShelfPicker {
  private readonly shelvesApi = inject(ShelvesApi);
  private shelfId = '';
  private saved: number[] = [];

  readonly picked = signal<PickedAchievement[]>([]);
  readonly loaded = signal(false);
  readonly error = signal<string | null>(null);
  readonly saving = signal(false);
  /** Games seen in the list, so a game's page can show its title. */
  readonly games = new Map<number, AchievementGame>();

  readonly count = computed(() => this.picked().length);
  readonly full = computed(() => this.count() >= MAX_SHELF_ACHIEVEMENTS);
  readonly dirty = computed(() => {
    const now = this.picked().map((p) => p.achievementId);
    return now.length !== this.saved.length || now.some((id, i) => id !== this.saved[i]);
  });
  readonly max = MAX_SHELF_ACHIEVEMENTS;

  async open(shelfId: string): Promise<void> {
    this.shelfId = shelfId;
    try {
      const shelf = (await firstValueFrom(this.shelvesApi.list())).find((s) => s.id === shelfId);
      const picks = shelf?.achievements ?? [];
      this.saved = picks.map((p) => p.achievementId);
      this.picked.set(picks);
    } catch {
      this.error.set('Your shelf didn’t load. Go back and try again.');
    } finally {
      this.loaded.set(true);
    }
  }

  isPicked(achievementId: number): boolean {
    return this.picked().some((p) => p.achievementId === achievementId);
  }

  /** Adds (at the end) or removes an unlock; adding stops at 12. */
  toggle(a: UnlockedAchievement, game: Pick<AchievementGame, 'gameId' | 'title' | 'slug'>): void {
    if (this.isPicked(a.achievementId)) {
      this.remove(a.achievementId);
      return;
    }
    if (this.full()) return;
    this.picked.update((all) => [
      ...all,
      {
        achievementId: a.achievementId,
        name: a.name,
        iconUrl: a.iconUrl,
        gameId: game.gameId,
        gameTitle: game.title,
        gameSlug: game.slug,
        globalPercent: a.globalPercent,
        unlockedAt: a.unlockedAt,
      },
    ]);
  }

  remove(achievementId: number): void {
    this.picked.update((all) => all.filter((p) => p.achievementId !== achievementId));
  }

  /** Saves the picks in their order. Resolves to an error message, or null. */
  async save(): Promise<string | null> {
    this.saving.set(true);
    try {
      const ids = this.picked().map((p) => p.achievementId);
      await firstValueFrom(this.shelvesApi.showAchievements(this.shelfId, ids));
      this.saved = ids;
      this.picked.update((p) => [...p]);
      return null;
    } catch (error) {
      return shelfErrorMessage(error);
    } finally {
      this.saving.set(false);
    }
  }
}
