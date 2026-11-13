import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, map, of, startWith, switchMap } from 'rxjs';
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
  private readonly loads = new Subject<number>();
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

  constructor() {
    // A new game (or Try again) cancels the request still running.
    this.loads
      .pipe(
        switchMap((gameId) =>
          this.api.list(gameId).pipe(
            map((data): AchievementsState => ({ kind: 'ready', data })),
            catchError((error: unknown) =>
              of<AchievementsState>({ kind: 'error', message: achievementsLoadMessage(error) }),
            ),
            startWith<AchievementsState>({ kind: 'loading' }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((state) => this.state.set(state));
  }

  load(gameId: number): void {
    this.gameId = gameId;
    this.filter.set('all');
    this.showAll.set(false);
    this.revealed.set(new Set());
    this.loads.next(gameId);
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
