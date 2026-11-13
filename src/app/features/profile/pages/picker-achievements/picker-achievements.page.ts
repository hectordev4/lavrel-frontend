import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, map, of, switchMap } from 'rxjs';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PickerAchievementSort, PickerApi } from '../../data-access/picker.api';
import { ShelfPicker } from '../../data-access/shelf-picker';
import { UnlockedAchievement } from '../../models/achievement-game.model';

/** Under 5% of owners: shown in gold as rare. */
const RARE_BELOW = 5;

/** Picker step 2: my unlocks in one game, rarest or newest first, to tick. */
@Component({
  selector: 'app-picker-achievements-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink],
  templateUrl: './picker-achievements.page.html',
  styleUrl: './picker-achievements.page.scss',
})
export class PickerAchievementsPage {
  private readonly api = inject(PickerApi);
  protected readonly picker = inject(ShelfPicker);
  private readonly gameId = Number(inject(ActivatedRoute).snapshot.paramMap.get('gameId'));
  protected readonly game = this.picker.games.get(this.gameId) ?? { gameId: this.gameId, title: 'This game', slug: '' };

  protected readonly sort = signal<PickerAchievementSort>('rarity');
  protected readonly achievements = signal<UnlockedAchievement[]>([]);
  protected readonly loading = signal(true);
  protected readonly failed = signal(false);

  /** Each order asked for; a newer one cancels the request still loading. */
  private readonly requests = new Subject<PickerAchievementSort>();

  constructor() {
    this.requests
      .pipe(
        switchMap((sort) =>
          this.api.unlocked(this.gameId, sort).pipe(
            map((r) => r.achievements as UnlockedAchievement[] | null),
            catchError(() => of(null)),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((list) => {
        this.loading.set(false);
        if (list) this.achievements.set(list);
        else this.failed.set(true);
      });
    this.load();
  }

  protected setSort(sort: PickerAchievementSort): void {
    this.sort.set(sort);
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.failed.set(false);
    this.requests.next(this.sort());
  }

  protected rare(percent: number | null): boolean {
    return percent !== null && percent < RARE_BELOW;
  }
}
