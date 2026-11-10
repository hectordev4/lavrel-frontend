import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
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

  constructor() {
    this.load();
  }

  protected setSort(sort: PickerAchievementSort): void {
    this.sort.set(sort);
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.failed.set(false);
    this.api.unlocked(this.gameId, this.sort()).subscribe({
      next: (r) => {
        this.achievements.set(r.achievements);
        this.loading.set(false);
      },
      error: () => {
        this.failed.set(true);
        this.loading.set(false);
      },
    });
  }

  protected rare(percent: number | null): boolean {
    return percent !== null && percent < RARE_BELOW;
  }
}
