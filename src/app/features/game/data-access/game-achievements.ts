import { Injectable, computed, inject, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { Achievement } from '../models/achievement.model';
import { AchievementFilter } from '../models/achievement-filter.model';
import { AchievementsState } from '../models/achievements-state.model';
import { GameAchievementsApi } from './game-achievements.api';
import { achievementsLoadMessage } from './game-messages';

const FIRST_VISIBLE = 10;

/** The game page's achievements: loading, filter, "Show all" and revealed hidden ones. Provided by the page. */
@Injectable()
export class GameAchievementsStore {
  private readonly api = inject(GameAchievementsApi);
  private request: Subscription | null = null;
  private gameId: number | null = null;

  readonly state = signal<AchievementsState>({ kind: 'loading' });
  readonly filter = signal<AchievementFilter>('all');
  readonly showAll = signal(false);
  readonly revealed = signal<ReadonlySet<number>>(new Set());

  /** True when the response says what this person unlocked (signed in). */
  readonly personal = computed(() => {
    const s = this.state();
    return s.kind === 'ready' && s.data.unlocked !== null;
  });

  readonly filtered = computed<Achievement[]>(() => {
    const s = this.state();
    if (s.kind !== 'ready') return [];
    const f = this.filter();
    if (f === 'unlocked') return s.data.achievements.filter((a) => a.unlocked);
    if (f === 'locked') return s.data.achievements.filter((a) => !a.unlocked);
    return s.data.achievements;
  });

  readonly visible = computed(() =>
    this.showAll() ? this.filtered() : this.filtered().slice(0, FIRST_VISIBLE),
  );
  readonly hiddenCount = computed(() => this.filtered().length - this.visible().length);

  load(gameId: number): void {
    this.gameId = gameId;
    this.request?.unsubscribe();
    this.state.set({ kind: 'loading' });
    this.filter.set('all');
    this.showAll.set(false);
    this.revealed.set(new Set());
    this.request = this.api.list(gameId).subscribe({
      next: (data) => this.state.set({ kind: 'ready', data }),
      error: (error: unknown) =>
        this.state.set({ kind: 'error', message: achievementsLoadMessage(error) }),
    });
  }

  retry(): void {
    if (this.gameId !== null) this.load(this.gameId);
  }

  setFilter(filter: AchievementFilter): void {
    this.filter.set(filter);
    this.showAll.set(false);
  }

  reveal(id: number): void {
    this.revealed.update((ids) => new Set([...ids, id]));
  }
}
